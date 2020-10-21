import { Election } from './election';
import { Team } from './team';
import { PlayerService } from './playerService';
import { Player } from './player';
import { commandMapping, ECommand } from './commands';
import { MatchMap } from './matchMap';
import { makeStringify, sleep } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { ISerializedGameServer, SerializedGameServer } from './interfaces/gameServer';
import { ISerializedMatchInitData } from './interfaces/matchInitData';
import { ETeamSides, SerializedTeam } from './interfaces/team';
import { GameServer } from './gameServer';
import {
	EMatchSate,
	EMatchEndAction,
	isISerializedMatch,
	ISerializedMatch,
	IMatchChange,
} from './interfaces/match';
import { EMatchMapSate, SerializedMatchMap } from './interfaces/matchMap';
import { SerializedElection } from './interfaces/election';

export const COMMAND_PREFIXES = ['.', '!'];
const PERIODIC_MESSAGE_FREQUENCY = 30000;
const SAY_PREFIX = '[TMT] ';

export class Match {
	id: string;
	readonly matchInitData: ISerializedMatchInitData;
	state: EMatchSate;
	election: Election;
	teamA: Team;
	teamB: Team;
	gameServer: GameServer;
	logSecret: string;
	parseIncomingLogs: boolean;
	logCounter: number;
	logLineCounter: number;
	matchMaps: MatchMap[];
	currentMap: number;
	periodicTimerId?: NodeJS.Timeout;
	canClinch: boolean;
	webhookUrl?: string;
	matchEndAction: EMatchEndAction;

	constructor(id: string, serializedMatch: ISerializedMatch);
	constructor(id: string, matchInitData: ISerializedMatchInitData);
	constructor(
		id: string,
		matchInitDataOrSerializedMatch: ISerializedMatchInitData | ISerializedMatch
	) {
		if (isISerializedMatch(matchInitDataOrSerializedMatch)) {
			console.log('create match from serialized');
			const serializedMatch = matchInitDataOrSerializedMatch;
			this.id = serializedMatch.id;
			this.state = serializedMatch.state;
			this.matchInitData = serializedMatch.matchInitData;
			this.election = SerializedElection.fromSerializedToNormal(
				serializedMatch.election,
				this
			);
			this.teamA = SerializedTeam.fromSerializedToNormal(serializedMatch.teamA, this);
			this.teamB = SerializedTeam.fromSerializedToNormal(serializedMatch.teamB, this);
			this.gameServer = SerializedGameServer.fromSerializedToNormal(
				serializedMatch.gameServer
			);
			this.logSecret = serializedMatch.logSecret;
			this.parseIncomingLogs = serializedMatch.parseIncomingLogs;
			this.logCounter = serializedMatch.logCounter;
			this.logLineCounter = serializedMatch.logLineCounter;
			this.matchMaps = serializedMatch.matchMaps.map((matchMap) =>
				SerializedMatchMap.fromSerializedToNormal(matchMap, this)
			);
			this.currentMap = serializedMatch.currentMap;
			this.canClinch = serializedMatch.canClinch;
			this.webhookUrl = serializedMatch.webhookUrl;
			this.matchEndAction = serializedMatch.matchEndAction;
		} else {
			console.log('create match from normal (matchInitData)');
			this.state = EMatchSate.ELECTION;
			this.logSecret = uuidv4();
			this.parseIncomingLogs = false;
			this.logCounter = 0;
			this.logLineCounter = 0;
			this.matchMaps = [];
			this.currentMap = 0;
			this.canClinch = true;
			this.matchEndAction = EMatchEndAction.NONE;
			const matchInitData = matchInitDataOrSerializedMatch;
			this.id = id;
			this.matchInitData = matchInitData;
			this.gameServer = new GameServer(
				matchInitData.gameServer.ip,
				matchInitData.gameServer.port,
				matchInitData.gameServer.rconPassword
			);
			this.teamA = new Team(
				this,
				ETeamSides.CT,
				true,
				this.matchInitData.teamA.name,
				this.matchInitData.teamA.advantage,
				this.matchInitData.teamA.remoteId
			);
			this.teamB = new Team(
				this,
				ETeamSides.T,
				false,
				this.matchInitData.teamB.name,
				this.matchInitData.teamB.advantage,
				this.matchInitData.teamB.remoteId
			);
			this.election = new Election(this);
			if (typeof this.matchInitData.canClinch === 'boolean') {
				this.canClinch = this.matchInitData.canClinch;
			}
			this.webhookUrl = this.matchInitData.webhookUrl;
			if (this.matchInitData.matchEndAction) {
				this.matchEndAction = this.matchInitData.matchEndAction;
			}
		}
	}

	async init() {
		await this.gameServer.setupRconConnection();
		// TODO add needed log options so that TMT can work

		this.registerLogAddress();

		await this.loadInitConfig();
		await this.setTeamNames();

		await this.gameServer.rcon(`mp_backup_round_file "round_backup_${this.id}"`);
		await this.gameServer.rcon('mp_backup_restore_load_autopause 1');
		await this.gameServer.rcon('mp_backup_round_auto 1');
		await this.gameServer.rcon(
			'mp_backup_round_file_pattern "%prefix%_%date%_%time%_%teamA%_%teamB%_%map%_round%round%_score_%score1%_%score2%.txt"'
		);

		// delay parsing of incoming log lines (because we don't about the initial big batch)
		sleep(2000).then(() => {
			this.parseIncomingLogs = true;
			this.say('ONLINE');
			this.election.auto();
			this.sayPeriodicMessage();
		});
	}

	registerLogAddress() {
		this.gameServer.rcon(
			`logaddress_add_http "http://localhost:8080/api/matches/${this.id}/server/log/${this.logSecret}"`
		);
	}

	async setTeamNames() {
		const currentMatch = this.getCurrentMatchMap();
		if (currentMatch) {
			await currentMatch.setTeamNames();
		} else {
			await this.gameServer.rcon(`mp_teamname_1 "${this.teamA.toIngameString()}"`);
			await this.gameServer.rcon(`mp_teamname_2 "${this.teamB.toIngameString()}"`);
		}
	}

	async getRoundBackups(count: number = 5) {
		const response = await this.gameServer.rcon(`mp_backup_restore_list_files ${count}`);
		const lines = response.trim().split('\n');
		const files = lines.filter((line) => line[0] === ' ').map((line) => line.trim());
		const totalFiles = parseInt(lines[lines.length - 1].split(' ')[0]);
		return {
			latestFiles: files,
			total: isNaN(totalFiles) ? 0 : totalFiles,
		};
	}

	async loadRoundBackup(file: string) {
		const response = await this.gameServer.rcon(`mp_backup_restore_load_file "${file}"`);
		if (response.includes('Failed to load file:')) {
			return false;
		} else {
			const currentMatchMap = this.getCurrentMatchMap();
			if (currentMatchMap) {
				currentMatchMap.state = EMatchMapSate.PAUSED;
			}
			return true;
		}
	}

	sayPeriodicMessage() {
		if (this.periodicTimerId) {
			clearTimeout(this.periodicTimerId);
		}

		this.periodicTimerId = setTimeout(
			() => this.sayPeriodicMessage(),
			PERIODIC_MESSAGE_FREQUENCY
		);

		if (this.state === EMatchSate.ELECTION) {
			this.election.sayPeriodicMessage();
		} else if (this.state === EMatchSate.MATCH_MAP) {
			this.getCurrentMatchMap()?.sayPeriodicMessage();
		} else if (this.state === EMatchSate.FINISHED) {
			this.say('MATCH IS FINISHED');
		}
	}

	async loadInitConfig() {
		await this.executeRconCommands(this.matchInitData.rconCommands?.init);
	}

	async loadEndConfig() {
		await this.executeRconCommands(this.matchInitData.rconCommands?.end);
	}

	async executeRconCommands(commands?: string[]) {
		if (commands) {
			for (let i = 0; i < commands.length; i++) {
				await this.gameServer.rcon(commands[i]);
			}
		}
	}

	say(message: string) {
		message = (SAY_PREFIX + message).replace(/;/g, '');
		this.gameServer.rcon(`say ${message}`);
	}

	getOtherTeam(team: Team) {
		if (this.teamA === team) return this.teamB;
		return this.teamA;
	}

	getTeamBySide(side: ETeamSides) {
		if (this.teamA.currentSide === side) return this.teamA;
		return this.teamB;
	}

	async onLog(body: string) {
		this.logCounter++;
		if (this.parseIncomingLogs) {
			const lines = body.split('\n');
			for (let index = 0; index < lines.length; index++) {
				await this.onLogLine(lines[index]);
			}
		}
	}

	async onLogLine(line: string) {
		if (!line) return;

		this.logLineCounter++;

		//09/14/2020 - 15:11:58.307 - "Yenz<2><STEAM_1:0:8520813><TERRORIST>" say "ajshdaosjkhdlaökjsdhlakjshd"
		// console.log('line:', line);
		const dateTimePattern = /^\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d\.\d\d\d - /;

		const playerPattern = /"(.*)<(\d+)><(.*)><(|Unassigned|CT|TERRORIST|Console)>" (.*)$/;
		const playerMatch = line.match(new RegExp(dateTimePattern.source + playerPattern.source));
		if (playerMatch) {
			const name = playerMatch[1];
			const ingamePlayerId = playerMatch[2];
			const steamId = playerMatch[3];
			const teamString = playerMatch[4];
			const remainingLine = playerMatch[5];
			await this.onPlayerLogLine(name, ingamePlayerId, steamId, teamString, remainingLine);
		}

		const mapEndPattern = /Game Over: competitive (.*) score (\d+):(\d+) after (\d+) min$/;
		const mapEndMatch = line.match(new RegExp(dateTimePattern.source + mapEndPattern.source));
		if (mapEndMatch) {
			this.onMapEnd();
		}

		const roundEndPattern = /Team "(CT|TERRORIST)" triggered "([a-zA-Z_]+)" \(CT "(\d+)"\) \(T "(\d+)"\)/;
		const roundEndMatch = line.match(
			new RegExp(dateTimePattern.source + roundEndPattern.source)
		);
		if (roundEndMatch) {
			const winningTeam = roundEndMatch[1];
			const winningReason = roundEndMatch[2];
			const ctScore = parseInt(roundEndMatch[3]);
			const tScore = parseInt(roundEndMatch[4]);
			await this.getCurrentMatchMap()?.onRoundEnd(
				ctScore,
				tScore,
				winningTeam === 'CT' ? ETeamSides.CT : ETeamSides.T
			);
		}
	}

	async onMapEnd() {
		await this.getCurrentMatchMap()?.onMapEnd();
		if (this.getCurrentMatchMap()?.isDraw()) {
			this.say(`${this.currentMap + 1}. MAP FINISHED (DRAW)`);
		} else {
			this.say(
				`${
					this.currentMap + 1
				}. MAP FINISHED (WINNER: ${this.getCurrentMatchMap()
					?.getWinner()
					.toIngameString()})`
			);
		}

		if (this.isMatchEnd()) {
			this.onMatchEnd();
		} else {
			this.currentMap++;
			const nextMap = this.getCurrentMatchMap();
			if (nextMap) {
				nextMap.loadMap();
			} else {
				this.onMatchEnd();
			}
		}
	}

	async onMatchEnd() {
		this.state = EMatchSate.FINISHED;
		this.loadEndConfig();
		await sleep(20000);
		switch (this.matchEndAction) {
			case EMatchEndAction.KICK_ALL:
				this.gameServer.kickAll();
				break;
			case EMatchEndAction.QUIT_SERVER:
				this.gameServer.quitServer();
				break;
		}
	}

	isMatchEnd(): boolean {
		if (this.canClinch) {
			const teamAWins =
				this.teamA.advantage +
				this.matchMaps.reduce(
					(pv: number, cv) =>
						pv +
						(cv.state === EMatchMapSate.FINISHED && cv.getWinner() === this.teamA
							? 1
							: 0),
					0
				);
			const teamBWins =
				this.teamB.advantage +
				this.matchMaps.reduce(
					(pv: number, cv) =>
						pv +
						(cv.state === EMatchMapSate.FINISHED && cv.getWinner() === this.teamB
							? 1
							: 0),
					0
				);
			if (this.matchMaps.length / 2 < Math.max(teamAWins, teamBWins)) {
				return true;
			}
		}

		return this.matchMaps.reduce(
			(pv: boolean, cv) => pv && cv.state === EMatchMapSate.FINISHED,
			true
		);
	}

	async onPlayerLogLine(
		name: string,
		ingamePlayerId: string,
		steamId: string,
		teamString: string,
		remainingLine: string
	) {
		//say "ajshdaosjkhdlaökjsdhlakjshd"
		if (steamId === 'BOT') {
		} else if (steamId === 'Console') {
		} else {
			const player = PlayerService.ensure(steamId, name);
			const sayMatch = remainingLine.match(/^say(_team)? "(.*)"$/);
			if (sayMatch) {
				const isTeamChat = sayMatch[1] === '_team';
				const message = sayMatch[2];
				await this.onPlayerSay(player, message, isTeamChat, teamString);
			}
		}
	}

	async onPlayerSay(player: Player, message: string, isTeamChat: boolean, teamString: string) {
		message = message.trim();

		if (COMMAND_PREFIXES.includes(message[0])) {
			message = message.substr(1);
			const parts = message.split(' ').filter((str) => str.length > 0);
			const commandString = parts.shift()?.toLowerCase();
			if (commandString) {
				const command = commandMapping.get(commandString);
				if (command) {
					await this.onCommand(command, player, parts, teamString);
				}
			}
		}
	}

	async onCommand(command: ECommand, player: Player, parameters: string[], teamString: string) {
		let warnAboutTeam = true;
		if (command === ECommand.TEAM) {
			await this.onTeamCommand(player, parameters[0] || '');
			warnAboutTeam = false;
		}

		const playerTeam = this.getTeamByPlayer(player);

		if (playerTeam) {
			this.election.onCommand(command, playerTeam, parameters);
			await this.getCurrentMatchMap()?.onCommand(command, playerTeam, player);

			if (
				(playerTeam.currentSide === ETeamSides.T && teamString !== 'TERRORIST') ||
				(playerTeam.currentSide === ETeamSides.CT && teamString !== 'CT')
			) {
				this.sayWrongTeam(player, playerTeam);
			}
		} else if (warnAboutTeam) {
			this.sayNotAssigned();
		}
	}

	async onElectionFinished() {
		this.state = EMatchSate.MATCH_MAP;
		await this.getCurrentMatchMap()?.loadMap();
	}

	sayNotAssigned() {
		this.say('NOT ASSIGNED!');
		this.say(`TYPE "${COMMAND_PREFIXES[0]}team a" TO JOIN ${this.teamA.toIngameString()}`);
		this.say(`TYPE "${COMMAND_PREFIXES[0]}team b" TO JOIN ${this.teamB.toIngameString()}`);
	}

	sayWrongTeam(player: Player, team: Team) {
		const otherTeam = this.getOtherTeam(team);
		this.say(
			`PLAYER ${player.toIngameString()} IS REGISTERED FOR ${team.toIngameString()} BUT CURRENTLY IN ${
				otherTeam.currentSide
			} (${otherTeam.toIngameString()})`
		);
		this.say(
			`CHECK SCOREBOARD AND CHANGE TEAM OR TYPE "${COMMAND_PREFIXES[0]}team ${
				otherTeam.isTeamA ? 'a' : 'b'
			}" TO CHANGE REGISTRATION`
		);
	}

	async onTeamCommand(player: Player, firstParameter: string) {
		firstParameter = firstParameter.toUpperCase();
		if (firstParameter === 'A') {
			this.teamA.players.add(player);
			this.teamB.players.delete(player);
		} else if (firstParameter === 'B') {
			this.teamA.players.delete(player);
			this.teamB.players.add(player);
		} else {
			const playerTeam = this.getTeamByPlayer(player);
			if (playerTeam) {
				this.say(
					`YOU ARE IN TEAM ${
						playerTeam.isTeamA ? 'A' : 'B'
					}: ${playerTeam.toIngameString()}`
				);
			} else {
				this.say(`YOU HAVE NO TEAM`);
			}
		}
	}

	getCurrentMatchMap(): MatchMap | undefined {
		if (this.state === EMatchSate.MATCH_MAP) {
			return this.matchMaps[this.currentMap];
		}
	}

	getTeamByPlayer(player: Player) {
		if (this.teamA.isPlayerInTeam(player)) {
			return this.teamA;
		}
		if (this.teamB.isPlayerInTeam(player)) {
			return this.teamB;
		}
		return undefined;
	}

	getTeamById(id: string) {
		if (this.teamA.id === id) {
			return this.teamA;
		}
		if (this.teamB.id === id) {
			return this.teamB;
		}
		return undefined;
	}

	toJSON(): any {
		const obj = makeStringify(this);
		delete obj.periodicTimerId;
		return obj;
	}

	stop() {
		if (this.periodicTimerId) {
			clearTimeout(this.periodicTimerId);
		}
		this.say(`TMT IS OFFLINE`);
	}

	change(change: IMatchChange) {
		if (change.state) {
			this.changeState(change.state);
		}

		if (change.gameServer) {
			this.changeGameServer(change.gameServer);
		}

		if (change.webhookUrl !== undefined) {
			if (change.webhookUrl === null) {
				this.webhookUrl = undefined;
			} else {
				this.webhookUrl = change.webhookUrl;
			}
		}

		if (change.logSecret) {
			this.logSecret = change.logSecret;
			this.registerLogAddress();
		}

		if (typeof change.parseIncomingLogs === 'boolean') {
			this.parseIncomingLogs = change.parseIncomingLogs;
		}

		if (change.currentMap) {
			this.changeCurrentMap(change.currentMap);
		}

		if (typeof change.canClinch === 'boolean') {
			this.canClinch = change.canClinch;
		}

		if (change.matchEndAction) {
			this.matchEndAction = change.matchEndAction;
		}
	}

	changeState(state: EMatchSate) {
		if (this.state !== state) {
			this.state = state; // TODO: think about if further actions must take place
		}
	}

	changeGameServer(gameServer: ISerializedGameServer) {
		this.gameServer = new GameServer(gameServer.ip, gameServer.port, gameServer.rconPassword);
		this.init();
	}

	changeCurrentMap(currentMap: number) {
		if (this.currentMap !== currentMap) {
			this.currentMap = currentMap;
			this.getCurrentMatchMap()?.loadMap();
		}
	}
}
