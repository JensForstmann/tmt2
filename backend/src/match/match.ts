import { Rcon } from 'rcon-client';
import { ElectionStep, Election, ElectionState } from './election';
import { Team, ETeamSides } from './team';
import { PlayerService } from './playerService';
import { Player } from './player';
import { commandMapping, ECommand } from './commands';
import { EMatchMapSate, MatchMap } from './matchMap';
import { makeStringify, sleep } from '../utils';

export interface STeam {
	id: string;
	name: string;
}

export interface MatchInitData {
	id: string;
	/**
	 * @minItems 1
	 */
	mapPool: string[];
	team1: STeam;
	team2: STeam;
	/**
	 * @minItems 1
	 */
	electionSteps: ElectionStep[];
	gameServer: {
		ip: string;
		port: number;
		rconPassword: string;
	};
	webhookUrl?: string;
	rcon?: {
		init?: string[]; // executed once on match init
		knife?: string[]; // executed before every knife round
		match?: string[]; // executed before every match map start
		end?: string[]; // executed after last match map
	};
	canClinch?: boolean;
}

export interface IMatch {
	matchInitData: MatchInitData;
}

export enum EMatchSate {
	ELECTION = 'ELECTION',
	MATCH_MAP = 'MATCH_MAP',
	FINISHED = 'FINISHED',
}

export const COMMAND_PREFIXES = ['.', '!'];
const PERIODIC_MESSAGE_FREQUENCY = 30000;

export class Match implements IMatch {
	matchInitData: MatchInitData;
	state: EMatchSate = EMatchSate.ELECTION;
	election: Election;
	team1: Team;
	team2: Team;
	rcon: Rcon;
	logSecret: string = '' + Math.random() * 1000000;
	parseIncomingLogs: boolean = false;
	logCounter: number = 0;
	logLineCounter: number = 0;
	matchMaps: MatchMap[] = [];
	currentMap: number = 0;
	periodicTimerId?: NodeJS.Timeout;
	canClinch: boolean = true;

	constructor(matchInitData: MatchInitData) {
		this.matchInitData = matchInitData;
		this.rcon = new Rcon({
			host: matchInitData.gameServer.ip,
			port: matchInitData.gameServer.port,
			password: matchInitData.gameServer.rconPassword,
		});
		this.team1 = new Team(
			this.matchInitData.team1.id,
			ETeamSides.CT,
			true,
			this.matchInitData.team1.name
		);
		this.team2 = new Team(
			this.matchInitData.team2.id,
			ETeamSides.T,
			false,
			this.matchInitData.team2.name
		);
		this.election = new Election(this);
		if (typeof this.matchInitData.canClinch === 'boolean') {
			this.canClinch = this.matchInitData.canClinch;
		}
	}

	async init() {
		await this.rcon.connect();
		// TODO add other log options as well
		await this.rcon.send(
			`logaddress_add_http "http://localhost:8080/api/matches/${this.matchInitData.id}/server/log/${this.logSecret}"`
		);
		// logaddress_list_http
		await this.loadInitConfig();
		await this.rcon.send(`mp_teamname_1 "${this.team1.toIngameString()}"`);
		await this.rcon.send(`mp_teamname_2 "${this.team2.toIngameString()}"`);

		sleep(2000).then(() => {
			this.parseIncomingLogs = true;
			this.say('BOT IS ONLINE');
			this.election.auto();
			this.sayPeriodicMessage();
		});
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
		await this.executeRconCommands(this.matchInitData.rcon?.init);
	}

	async loadEndConfig() {
		await this.executeRconCommands(this.matchInitData.rcon?.end);
	}

	async executeRconCommands(commands?: string[]) {
		if (commands) {
			for (let i = 0; i < commands.length; i++) {
				await this.rcon.send(commands[i]);
			}
		}
	}

	async say(message: string) {
		console.log(message);
		await this.rcon.send('say ' + message.replace(/;/g, ''));
	}

	getOtherTeam(team: Team) {
		if (this.team1 === team) return this.team2;
		return this.team1;
	}

	getTeamBySide(side: ETeamSides) {
		if (this.team1.currentSide === side) return this.team1;
		return this.team2;
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
			const team = playerMatch[4];
			const remainingLine = playerMatch[5];
			await this.onPlayerLogLine(name, ingamePlayerId, steamId, team, remainingLine);
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

		// TODO:
		// World triggered "Match_Start" on "de_dust2"
		// Team playing "CT": team1
		// Team playing "TERRORIST": team2
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

	onMatchEnd() {
		this.state = EMatchSate.FINISHED;
		this.loadEndConfig();
		// TODO webhook
	}

	isMatchEnd(): boolean {
		if (this.canClinch) {
			const team1Wins = this.matchMaps.reduce(
				(pv: number, cv) =>
					pv +
					(cv.state === EMatchMapSate.FINISHED && cv.getWinner() === this.team1 ? 1 : 0),
				0
			);
			const team2Wins = this.matchMaps.reduce(
				(pv: number, cv) =>
					pv +
					(cv.state === EMatchMapSate.FINISHED && cv.getWinner() === this.team2 ? 1 : 0),
				0
			);
			if (this.matchMaps.length / 2 < Math.max(team1Wins, team2Wins)) {
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
			const player = PlayerService.ensure(steamId);
			const sayMatch = remainingLine.match(/^say(_team)? "(.*)"$/);
			if (sayMatch) {
				const isTeamChat = sayMatch[1] === '_team';
				const message = sayMatch[2];
				await this.onPlayerSay(player, message, isTeamChat);
			}
		}
	}

	async onPlayerSay(player: Player, message: string, isTeamChat: boolean) {
		message = message.trim();

		if (COMMAND_PREFIXES.includes(message[0])) {
			message = message.substr(1);
			const parts = message.split(' ').filter((str) => str.length > 0);
			const commandString = parts.shift()?.toLowerCase();
			if (commandString) {
				const command = commandMapping.get(commandString);
				if (command) {
					await this.onCommand(command, player, parts);
				}
			}
		}
	}

	async onCommand(command: ECommand, player: Player, parameters: string[]) {
		let warnAboutTeam = true;
		if (command === ECommand.TEAM) {
			await this.onTeamCommand(player, parameters[0] || '');
			warnAboutTeam = false;
		}

		const playerTeam = this.getTeamByPlayer(player);
		if (playerTeam) {
			this.election.onCommand(command, playerTeam, parameters);
			await this.getCurrentMatchMap()?.onCommand(command, playerTeam, player);
		} else if (warnAboutTeam) {
			this.sayNotAssigned();
		}
	}

	async onElectionFinished() {
		this.state = EMatchSate.MATCH_MAP;
		this.matchMaps = this.election.maps;
		await this.getCurrentMatchMap()?.loadMap();
	}

	sayNotAssigned() {
		this.say('NOT ASSIGNED!');
		this.say(`!team a   :  ${this.matchInitData.team1.name}`);
		this.say(`!team b   :  ${this.matchInitData.team2.name}`);
		this.say('TYPE !team a OR !team b');
	}

	async onTeamCommand(player: Player, firstParameter: string) {
		firstParameter = firstParameter.toUpperCase();
		if (firstParameter === 'A') {
			this.team1.players.add(player);
			this.team2.players.delete(player);
		} else if (firstParameter === 'B') {
			this.team1.players.delete(player);
			this.team2.players.add(player);
		} else {
			const playerTeam = this.getTeamByPlayer(player);
			if (playerTeam) {
				this.say(
					`YOU ARE CURRENTLY IN TEAM ${
						playerTeam.isTeam1 ? 'A' : 'B'
					}: ${playerTeam.toIngameString()}`
				);
			} else {
				this.say(`YOU HAVE NO TEAM`);
			}
		}
	}

	getCurrentMatchMap(): MatchMap | undefined {
		return this.matchMaps[this.currentMap];
	}

	getTeamByPlayer(player: Player) {
		if (this.team1.isPlayerInTeam(player)) {
			return this.team1;
		}
		if (this.team2.isPlayerInTeam(player)) {
			return this.team2;
		}
		return null;
	}

	toJSON(): any {
		const obj = makeStringify(this);
		delete obj.rcon;
		delete obj.periodicTimerId;
		return obj;
	}
}