import { generate as shortUuid } from 'short-uuid';
import * as Election from './election';
import * as Team from './team';
import * as Player from './player';
import { commandMapping, ECommand } from './commands';
import * as MatchMap from './matchMap';
import * as MatchService from './matchService';
import { escapeRconString, sleep } from './utils';
import * as GameServer from './gameServer';
import * as Webhook from './webhook';
import {
	EMatchEndAction,
	EMatchSate,
	IMatch,
	IMatchCreateDto,
	IMatchUpdateDto,
} from './interfaces/match';
import { IPlayer } from './interfaces/player';
import { EMatchMapSate, ETeamAB, getOtherTeamAB } from './interfaces/matchMap';
import { Settings } from './settings';
import { ITeam } from './interfaces/team';
import { ETeamSides } from './interfaces/stuff';
import { Rcon } from './rcon-client';

export interface Match {
	data: IMatch;
	rconConnection: Rcon;
	periodicTimerId?: NodeJS.Timeout;
	logBuffer: string[];
	log: (msg: string) => void;
}

export const createFromData = async (data: IMatch) => {
	const log = logger(data.id);
	const gameServer = await GameServer.create(data.gameServer, log);
	const match: Match = {
		data: data,
		rconConnection: gameServer,
		logBuffer: [],
		log: log,
	};
	gameServer.on('end', () => onRconConnectionEnd(match));
	await setup(match);
	return match;
};

export const createFromCreateDto = async (dto: IMatchCreateDto, id: string, logSecret: string) => {
	const data: IMatch = {
		...dto,
		id: id,
		teamA: Team.createFromCreateDto(dto.teamA),
		teamB: Team.createFromCreateDto(dto.teamB),
		state: EMatchSate.ELECTION,
		logSecret: logSecret,
		parseIncomingLogs: false,
		matchMaps: [],
		currentMap: 0,
		logs: [],
		players: [],
		rconCommands: {
			init: dto.rconCommands?.init ?? [],
			knife: dto.rconCommands?.knife ?? [],
			match: dto.rconCommands?.match ?? [],
			end: dto.rconCommands?.end ?? [],
		},
		canClinch: dto.canClinch ?? true,
		matchEndAction: dto.matchEndAction ?? EMatchEndAction.NONE,
		election: Election.create(dto.mapPool, dto.electionSteps),
		isStopped: false,
		electionMap: dto.electionMap ?? 'de_dust2',
		tmtSecret: shortUuid(),
	};
	const match = await createFromData(data);
	await init(match);
	return match;
};

const logger = (id: string) => (msg: string) => {
	console.log(`[${id}] ${msg}`);
};

export const onRconConnectionEnd = async (match: Match) => {
	const addr = `${match.data.gameServer.ip}:${match.data.gameServer.port}`;
	match.log(`rcon connection lost: ${addr}`);
	while (true) {
		try {
			await sleep(10000);
			if (match.data.isStopped) {
				return;
			}
			match.log(`reconnect rcon ${addr}`);
			const gameServer = await GameServer.create(match.data.gameServer, match.log);
			match.rconConnection = gameServer;
			match.log(`reconnect rcon successful ${addr}`);
			return;
		} catch (err) {
			match.log(`reconnect rcon failed ${addr}: ${err}`);
		}
	}
};

/**
 * Executed once per match and every time the map will be loaded from storage.
 */
const setup = async (match: Match) => {
	// TMT does not need any special log settings to work. Only 'log on' must be executed.
	// If more is needed (in the future): mp_logdetail, mp_logdetail_items, mp_logmoney

	match.log('Setup match...');

	await execRcon(match, 'log on');

	await registerLogAddress(match);
	await setTeamNames(match);

	await execRcon(match, `mp_backup_round_file "round_backup_${match.data.id}"`);
	await execRcon(match, 'mp_backup_restore_load_autopause 1');
	await execRcon(match, 'mp_backup_round_auto 1');
	await execRcon(
		match,
		'mp_backup_round_file_pattern "%prefix%_%date%_%time%_%team1%_%team2%_%map%_round%round%_score_%score1%_%score2%.txt"'
	);

	// delay parsing of incoming log lines (because we don't care about the initial big batch)
	sleep(2000)
		.then(async () => {
			match.log('enable parsing of incoming log');
			match.data.parseIncomingLogs = true;
			await say(match, 'ONLINE');
			if (match.data.state === EMatchSate.ELECTION) {
				await Election.auto(match);
			}
			await sayPeriodicMessage(match);
		})
		.catch((err) => {
			match.log(`Error in delayed setup: ${err}`);
		});

	match.log('Setup finished');
};

const registerLogAddress = async (match: Match) => {
	const logAddress = `${process.env.TMT_LOG_ADDRESS}/api/matches/${match.data.id}/server/log/${match.data.logSecret}`;
	await execRcon(match, `logaddress_add_http "${logAddress}"`);
};

export const execRcon = async (match: Match, command: string) => {
	return await GameServer.exec(match, command);
};

/**
 * Executes only once per match (at creation).
 */
const init = async (match: Match) => {
	match.log('init match...');
	await execRcon(match, `changelevel ${match.data.electionMap}`);
	await execManyRcon(match, match.data.rconCommands.init);
	await execRcon(match, 'mp_warmuptime 600');
	await execRcon(match, 'mp_warmup_pausetimer 1');
	await execRcon(match, 'mp_autokick 0');
	match.log('init match finished');
};

export const execManyRcon = async (match: Match, commands: string[]) => {
	for (let i = 0; i < commands.length; i++) {
		await execRcon(match, commands[i]);
	}
};

export const say = async (match: Match, message: string) => {
	message = (Settings.SAY_PREFIX + message).replace(/;/g, '');
	await execRcon(match, `say ${message}`);
};

const sayPeriodicMessage = async (match: Match) => {
	if (match.periodicTimerId) {
		clearTimeout(match.periodicTimerId);
	}

	match.periodicTimerId = setTimeout(async () => {
		try {
			await sayPeriodicMessage(match);
		} catch (err) {
			match.log(`Error in sayPeriodicMessage: ${err}`);
		}
	}, Settings.PERIODIC_MESSAGE_FREQUENCY);

	if (match.data.state === EMatchSate.ELECTION) {
		await Election.sayPeriodicMessage(match);
	} else if (match.data.state === EMatchSate.MATCH_MAP) {
		const matchMap = getCurrentMatchMap(match);
		if (matchMap) {
			await MatchMap.sayPeriodicMessage(match, matchMap);
		}
	} else if (match.data.state === EMatchSate.FINISHED) {
		await say(match, 'MATCH IS FINISHED');
	}
};

export const getCurrentMatchMap = (match: Match) => {
	if (match.data.state === EMatchSate.MATCH_MAP) {
		return match.data.matchMaps[match.data.currentMap];
	}
	return undefined;
};

export const getTeamByAB = (match: Match, teamAB: ETeamAB): ITeam => {
	switch (teamAB) {
		case ETeamAB.TEAM_A:
			return match.data.teamA;
		case ETeamAB.TEAM_B:
			return match.data.teamB;
	}
};

export const setTeamNames = async (match: Match) => {
	const currentMatchMap = getCurrentMatchMap(match);
	if (currentMatchMap) {
		const team1 = getTeamByAB(match, currentMatchMap.startAsCtTeam);
		const team2 = getOtherTeam(match, team1);
		await execRcon(match, `mp_teamname_1 "${escapeRconString(team1.name)}"`);
		await execRcon(match, `mp_teamname_2 "${escapeRconString(team2.name)}"`);
	} else {
		await execRcon(match, `mp_teamname_1 "${escapeRconString(match.data.teamA.name)}"`);
		await execRcon(match, `mp_teamname_2 "${escapeRconString(match.data.teamB.name)}"`);
	}
};

export const getRoundBackups = async (match: Match, count: number = 5) => {
	const response = await execRcon(match, `mp_backup_restore_list_files ${count}`);
	const lines = response.trim().split('\n');
	const files = lines.filter((line) => line[0] === ' ').map((line) => line.trim());
	const totalFiles = parseInt(lines[lines.length - 1].split(' ')[0]);
	return {
		latestFiles: files,
		total: isNaN(totalFiles) ? 0 : totalFiles,
	};
};

export const loadRoundBackup = async (match: Match, file: string) => {
	const response = await execRcon(match, `mp_backup_restore_load_file "${file}"`);
	if (response.includes('Failed to load file:')) {
		match.log(`Error loading round backup: ${response}`);
		return false;
	} else {
		match.log(`load round backup ${file}`);
		const currentMatchMap = getCurrentMatchMap(match);
		if (currentMatchMap) {
			currentMatchMap.state = EMatchMapSate.PAUSED;
			currentMatchMap.readyTeams.teamA = false;
			currentMatchMap.readyTeams.teamB = false;
			MatchService.scheduleSave(match);
		}
		return true;
	}
};

export const onLog = async (match: Match, body: string) => {
	if (!match.data.parseIncomingLogs) {
		return;
	}

	const lines = body.split('\n');
	match.logBuffer.push(...lines);

	if (match.logBuffer.length === lines.length) {
		// logBuffer was empty before -> no other onLogLine is in progress right now
		while (match.logBuffer.length > 0) {
			const oldestLine = match.logBuffer[0];
			await onLogLine(match, oldestLine);
			match.logBuffer.splice(0, 1);
		}
	}
};

const onLogLine = async (match: Match, line: string) => {
	if (!line) return;

	//09/14/2020 - 15:11:58.307 - "Yenz<2><STEAM_1:0:8520813><TERRORIST>" say "Hello World"
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
		await onPlayerLogLine(match, name, ingamePlayerId, steamId, teamString, remainingLine);
	}

	const mapEndPattern = /Game Over: competitive (.*) score (\d+):(\d+) after (\d+) min$/;
	const mapEndMatch = line.match(new RegExp(dateTimePattern.source + mapEndPattern.source));
	if (mapEndMatch) {
		await onMapEnd(match);
	}

	const roundEndPattern =
		/Team "(CT|TERRORIST)" triggered "([a-zA-Z_]+)" \(CT "(\d+)"\) \(T "(\d+)"\)/;
	const roundEndMatch = line.match(new RegExp(dateTimePattern.source + roundEndPattern.source));
	if (roundEndMatch) {
		const winningTeam = roundEndMatch[1];
		const winningReason = roundEndMatch[2];
		const ctScore = parseInt(roundEndMatch[3]);
		const tScore = parseInt(roundEndMatch[4]);
		const currentMatchMap = getCurrentMatchMap(match);
		if (currentMatchMap) {
			await MatchMap.onRoundEnd(
				match,
				currentMatchMap,
				ctScore,
				tScore,
				winningTeam === 'CT' ? ETeamSides.CT : ETeamSides.T
			);
		}
	}
};

const onPlayerLogLine = async (
	match: Match,
	name: string,
	ingamePlayerId: string,
	steamId: string,
	teamString: string,
	remainingLine: string
) => {
	//say "Hello World"
	if (steamId === 'BOT') {
	} else if (steamId === 'Console') {
	} else {
		const steamId64 = Player.getSteamID64(steamId);
		let player = match.data.players.find((p) => p.steamId64 === steamId64);
		if (!player) {
			player = Player.create(steamId, name);
			match.data.players.push(player);
		}
		const sayMatch = remainingLine.match(/^say(_team)? "(.*)"$/);
		if (sayMatch) {
			const isTeamChat = sayMatch[1] === '_team';
			const message = sayMatch[2];
			await onPlayerSay(match, player, message, isTeamChat, teamString);
		}
	}
};

const onPlayerSay = async (
	match: Match,
	player: IPlayer,
	message: string,
	isTeamChat: boolean,
	teamString: string
) => {
	message = message.trim();

	Webhook.onPlayerSay(match, player, message, isTeamChat);

	if (Settings.COMMAND_PREFIXES.includes(message[0])) {
		message = message.substring(1);
		const parts = message.split(' ').filter((str) => str.length > 0);
		const commandString = parts.shift()?.toLowerCase();
		if (commandString) {
			const command = commandMapping.get(commandString);
			if (command) {
				await onCommand(match, command, player, parts, teamString);
			} else {
				await say(match, `COMMAND UNKNOWN`);
			}
		}
	}
};

const onCommand = async (
	match: Match,
	command: ECommand,
	player: IPlayer,
	parameters: string[],
	teamString: string
) => {
	let warnAboutTeam = true;
	if (command === ECommand.TEAM) {
		await onTeamCommand(match, player, parameters[0] || '');
		warnAboutTeam = false;
	}

	const teamAB = player.team;

	if (teamAB) {
		const playerTeam = getTeamByAB(match, teamAB);

		if (match.data.state === EMatchSate.ELECTION) {
			await Election.onCommand(match, command, teamAB, parameters);
		}

		const currentMatchMap = getCurrentMatchMap(match);
		if (currentMatchMap) {
			await MatchMap.onCommand(match, currentMatchMap, command, teamAB, player);
		}

		const currentCtTeamAB = currentMatchMap
			? MatchMap.getCurrentTeamSideAndRoundSwitch(currentMatchMap).currentCtTeamAB
			: ETeamAB.TEAM_A;
		const currentTTeamAB = getOtherTeamAB(currentCtTeamAB);

		if (
			(teamString === 'TERRORIST' && player.team !== currentTTeamAB) ||
			(teamString === 'CT' && player.team !== currentCtTeamAB)
		) {
			await sayWrongTeamOrSide(match, player, teamString, playerTeam, teamAB);
		}
	} else if (warnAboutTeam) {
		await sayNotAssigned(match, player);
	}
};

const sayNotAssigned = async (match: Match, player: IPlayer) => {
	await say(match, `PLAYER ${escapeRconString(player.name)} NOT ASSIGNED!`);
	await say(
		match,
		`TYPE "${Settings.COMMAND_PREFIXES[0]}team a" TO JOIN ${escapeRconString(
			match.data.teamA.name
		)}`
	);
	await say(
		match,
		`TYPE "${Settings.COMMAND_PREFIXES[0]}team b" TO JOIN ${escapeRconString(
			match.data.teamB.name
		)}`
	);
};

const sayWrongTeamOrSide = async (
	match: Match,
	player: IPlayer,
	currentSite: 'CT' | 'TERRORIST',
	currentTeam: ITeam,
	currentTeamAB: ETeamAB
) => {
	const otherTeam = getOtherTeam(match, currentTeam);
	await say(
		match,
		`PLAYER ${escapeRconString(player.name)} IS REGISTERED FOR ${escapeRconString(
			currentTeam.name
		)} BUT CURRENTLY IN ${currentSite} (${escapeRconString(otherTeam.name)})`
	);
	await say(
		match,
		`CHECK SCOREBOARD AND CHANGE TEAM OR TYPE "${Settings.COMMAND_PREFIXES[0]}team ${
			currentTeamAB === ETeamAB.TEAM_A ? 'b' : 'a'
		}" TO CHANGE REGISTRATION`
	);
};

export const getOtherTeam = (match: Match, team: ITeam) => {
	if (match.data.teamA === team) return match.data.teamB;
	return match.data.teamA;
};

const onTeamCommand = async (match: Match, player: IPlayer, firstParameter: string) => {
	firstParameter = firstParameter.toUpperCase();
	if (firstParameter === 'A') {
		player.team = ETeamAB.TEAM_A;
		say(
			match,
			`PLAYER ${escapeRconString(player.name)} JOINED TEAM ${escapeRconString(
				match.data.teamA.name
			)}`
		);
	} else if (firstParameter === 'B') {
		player.team = ETeamAB.TEAM_B;
		say(
			match,
			`PLAYER ${escapeRconString(player.name)} JOINED TEAM ${escapeRconString(
				match.data.teamB.name
			)}`
		);
	} else {
		const playerTeam = player.team;
		if (playerTeam) {
			say(
				match,
				`YOU ARE IN TEAM ${playerTeam === ETeamAB.TEAM_A ? 'A' : 'B'}: ${escapeRconString(
					playerTeam === ETeamAB.TEAM_A ? match.data.teamA.name : match.data.teamB.name
				)}`
			);
		} else {
			say(match, `YOU HAVE NO TEAM`);
		}
	}
};

const onMapEnd = async (match: Match) => {
	const currentMatchMap = getCurrentMatchMap(match);
	if (currentMatchMap) {
		await MatchMap.onMapEnd(match, currentMatchMap);

		const winnerTeamAB = MatchMap.getWinner(currentMatchMap);
		if (!winnerTeamAB) {
			await say(match, `${match.data.currentMap + 1}. MAP FINISHED (DRAW)`);
		} else {
			const winnerTeam = getTeamByAB(match, winnerTeamAB);
			await say(
				match,
				`${match.data.currentMap + 1}. MAP FINISHED (WINNER: ${escapeRconString(
					winnerTeam.name
				)})`
			);
		}
	}

	if (isMatchEnd(match)) {
		match.log(`onMapEnd -> isMatchEnd -> onMatchEnd`);
		await onMatchEnd(match);
	} else {
		match.data.currentMap++;
		const nextMap = getCurrentMatchMap(match);
		if (nextMap) {
			match.log(`onMapEnd -> loadNextMap`);
			await MatchMap.loadMap(match, nextMap);
		} else {
			await onMatchEnd(match);
		}
	}
};

const isMatchEnd = (match: Match) => {
	if (match.data.canClinch) {
		const wonMapsTeamA = getTeamWins(match, ETeamAB.TEAM_A);
		const wonMapsTeamB = getTeamWins(match, ETeamAB.TEAM_B);
		if (match.data.matchMaps.length / 2 < Math.max(wonMapsTeamA, wonMapsTeamB)) {
			return true;
		}
	}

	return match.data.matchMaps.reduce((pv, cv) => pv && cv.state === EMatchMapSate.FINISHED, true);
};

export const getTeamWins = (match: Match, teamAB: ETeamAB) => {
	if (teamAB === ETeamAB.TEAM_A) {
		return (
			match.data.teamA.advantage +
			match.data.matchMaps.reduce(
				(pv: number, cv) =>
					pv +
					(cv.state === EMatchMapSate.FINISHED &&
					MatchMap.getWinner(cv) === ETeamAB.TEAM_A
						? 1
						: 0),
				0
			)
		);
	} else {
		return (
			match.data.teamB.advantage +
			match.data.matchMaps.reduce(
				(pv: number, cv) =>
					pv +
					(cv.state === EMatchMapSate.FINISHED &&
					MatchMap.getWinner(cv) === ETeamAB.TEAM_B
						? 1
						: 0),
				0
			)
		);
	}
};

const onMatchEnd = async (match: Match) => {
	if (match.data.state !== EMatchSate.FINISHED) {
		match.data.state = EMatchSate.FINISHED;
		MatchService.scheduleSave(match);
		const wonMapsTeamA = getTeamWins(match, ETeamAB.TEAM_A);
		const wonMapsTeamB = getTeamWins(match, ETeamAB.TEAM_B);
		Webhook.onMatchEnd(match, wonMapsTeamA, wonMapsTeamB);
		await sleep(Settings.MATCH_END_ACTION_DELAY);
		switch (match.data.matchEndAction) {
			case EMatchEndAction.KICK_ALL:
				await GameServer.kickAll(match);
				break;
			case EMatchEndAction.QUIT_SERVER:
				await execRcon(match, 'quit');
				break;
		}
	}
	await MatchService.remove(match.data.id); // this will call Match.stop()
};

export const stop = async (match: Match) => {
	match.data.isStopped = true;
	MatchService.scheduleSave(match);
	if (match.periodicTimerId) {
		clearTimeout(match.periodicTimerId);
	}
	await execManyRcon(match, match.data.rconCommands.end).catch((err) => {
		match.log(`error executing match end rcon commands: ${err}`);
	});
	await say(match, `TMT IS OFFLINE`).catch(() => {});
	await GameServer.disconnect(match);
};

export const onElectionFinished = async (match: Match) => {
	Webhook.onElectionEnd(match);
	match.data.state = EMatchSate.MATCH_MAP;
	MatchService.scheduleSave(match);
	const currentMatchMap = getCurrentMatchMap(match);
	if (currentMatchMap) {
		await MatchMap.loadMap(match, currentMatchMap);
	}
};

export const update = async (match: Match, dto: IMatchUpdateDto) => {
	if (dto.state) {
		match.data.state = dto.state;
	}

	if (dto.mapPool) {
		match.data.mapPool = dto.mapPool;
	}

	if (dto.teamA) {
		match.data.teamA = Team.createFromCreateDto(dto.teamA);
	}

	if (dto.teamB) {
		match.data.teamB = Team.createFromCreateDto(dto.teamB);
	}

	if (dto.teamA || dto.teamB) {
		await setTeamNames(match);
	}

	if (dto.electionSteps) {
		match.data.electionSteps = dto.electionSteps;
	}

	if (dto.gameServer) {
		match.data.gameServer = dto.gameServer;
		const addr = `${match.data.gameServer.ip}:${match.data.gameServer.port}`;
		try {
			match.log(`connect rcon ${addr}`);
			const gameServer = await GameServer.create(match.data.gameServer, match.log);
			const previous = match.rconConnection;
			match.rconConnection = gameServer;
			match.log(`connect rcon successful ${addr}`);
			previous.end().catch(() => {});
		} catch (err) {
			match.log(`connect rcon failed ${addr}: ${err}`);
		}
	}

	if (dto.passthrough) {
		match.data.passthrough = dto.passthrough;
	}

	if (dto.webhookUrl) {
		match.data.webhookUrl = dto.webhookUrl;
	}

	if (dto.logSecret) {
		match.data.logSecret = dto.logSecret;
		await registerLogAddress(match);
	}

	if (dto.currentMap !== undefined && dto.currentMap !== match.data.currentMap) {
		const previous = match.data.currentMap;
		match.data.currentMap = dto.currentMap;
		const nextMap = getCurrentMatchMap(match);
		if (nextMap) {
			await MatchMap.loadMap(match, nextMap);
		} else {
			match.data.currentMap = previous;
		}
	}

	if (dto.rconCommands?.init) {
		match.data.rconCommands.init = dto.rconCommands.init;
	}

	if (dto.rconCommands?.knife) {
		match.data.rconCommands.knife = dto.rconCommands.knife;
	}

	if (dto.rconCommands?.match) {
		match.data.rconCommands.match = dto.rconCommands.match;
	}

	if (dto.rconCommands?.end) {
		match.data.rconCommands.end = dto.rconCommands.end;
	}

	if (dto.canClinch !== undefined) {
		match.data.canClinch = dto.canClinch;
		if (isMatchEnd(match)) {
			await onMatchEnd(match);
		}
	}

	if (dto.matchEndAction) {
		match.data.matchEndAction = dto.matchEndAction;
	}

	if (dto._restartElection) {
		match.data.state = EMatchSate.ELECTION;
		match.data.election = Election.create(match.data.mapPool, match.data.electionSteps);
		match.data.matchMaps = [];
		Election.auto(match);
	}

	if (dto._init) {
		await init(match);
	}

	if (dto._setup) {
		await setup(match);
	}

	if (dto._execRconCommandsInit) {
		await execManyRcon(match, match.data.rconCommands.init);
	}

	if (dto._execRconCommandsKnife) {
		await execManyRcon(match, match.data.rconCommands.knife);
	}

	if (dto._execRconCommandsMatch) {
		await execManyRcon(match, match.data.rconCommands.match);
	}

	if (dto._execRconCommandsEnd) {
		await execManyRcon(match, match.data.rconCommands.end);
	}

	MatchService.scheduleSave(match);
};
