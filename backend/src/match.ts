import { ValidateError } from '@tsoa/runtime';
import { generate as shortUuid } from 'short-uuid';
import { TMT_LOG_ADDRESS } from '.';
import {
	escapeRconSayString,
	escapeRconString,
	getCurrentTeamSideAndRoundSwitch,
	getOtherTeamAB,
	IMatch,
	IMatchCreateDto,
	IMatchUpdateDto,
	IPlayer,
	ITeam,
	sleep,
	TTeamAB,
	TTeamString,
} from '../../common';
import { addChangeListener } from './changeListener';
import * as commands from './commands';
import * as Election from './election';
import * as Events from './events';
import * as GameServer from './gameServer';
import * as ManagedGameServers from './managedGameServers';
import * as MatchMap from './matchMap';
import * as MatchService from './matchService';
import * as Player from './player';
import { Rcon } from './rcon-client';
import { Settings } from './settings';
import * as Storage from './storage';
import * as Team from './team';

const STORAGE_LOGS_PREFIX = 'logs_';
const STORAGE_LOGS_SUFFIX = '.jsonl';

export interface Match {
	data: IMatch;
	rconConnection?: Rcon;
	periodicTimerId?: NodeJS.Timeout;
	logBuffer: string[];
	log: (msg: string) => void;
}

export const createFromData = async (data: IMatch) => {
	const match: Match = {
		data: data,
		logBuffer: [],
		log: () => {},
	};
	match.data = addChangeListener(data, createOnDataChangeHandler(match));
	match.log = createLogger(match);

	// http log address checks
	if (match.data.tmtLogAddress) {
		const la = checkAndNormalizeLogAddress(match.data.tmtLogAddress);
		if (!la) {
			throw 'invalid tmtLogAddress';
		}
		match.data.tmtLogAddress = la;
	} else if (!TMT_LOG_ADDRESS) {
		throw 'tmtLogAddress must be set';
	}

	await connectToGameServer(match);
	return match;
};

export const createFromCreateDto = async (dto: IMatchCreateDto, id: string, logSecret: string) => {
	const gameServer = dto.gameServer ?? (await ManagedGameServers.getFree(id));
	if (!gameServer) {
		throw 'no free game server available';
	}
	const data: IMatch = {
		...dto,
		gameServer: gameServer,
		id: id,
		teamA: Team.createFromCreateDto(dto.teamA),
		teamB: Team.createFromCreateDto(dto.teamB),
		state: 'ELECTION',
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
		matchEndAction: dto.matchEndAction ?? 'NONE',
		election: Election.create(dto.mapPool, dto.electionSteps),
		isStopped: false,
		tmtSecret: shortUuid(),
		serverPassword: '',
		tmtLogAddress: dto.tmtLogAddress,
		createdAt: Date.now(),
		webhookUrl: dto.webhookUrl ?? null,
		mode: dto.mode ?? 'SINGLE',
	};
	try {
		const match = await createFromData(data);
		await init(match);
		return match;
	} catch (err) {
		await ManagedGameServers.free(gameServer, id);
		await ManagedGameServers.update({ ...gameServer, canBeUsed: false });
		throw err;
	}
};

const createLogger = (match: Match) => (msg: string) => {
	const ds = new Date().toISOString();
	Storage.appendLine(STORAGE_LOGS_PREFIX + match.data.id + STORAGE_LOGS_SUFFIX, `${ds} | ${msg}`);
	console.info(`${ds} [${match.data.id}] ${msg}`);
	Events.onLog(match, msg);
};

const createOnDataChangeHandler = (match: Match) => (path: Array<string | number>, value: any) => {
	Events.onMatchUpdate(match, path, value);
};

export const getLogsTail = async (matchId: string, numberOfLines = 1000): Promise<string[]> => {
	return await Storage.readLines(
		STORAGE_LOGS_PREFIX + matchId + STORAGE_LOGS_SUFFIX,
		[],
		numberOfLines
	);
};

const connectToGameServer = async (match: Match): Promise<void> => {
	const addr = `${match.data.gameServer.ip}:${match.data.gameServer.port}`;
	match.log(`connect rcon ${addr}`);
	const gameServer = await GameServer.create(match.data.gameServer, match.log);
	gameServer.on('end', () => onRconConnectionEnd(match));
	const previous = match.rconConnection;
	match.rconConnection = gameServer;
	previous?.end().catch(() => {});
	match.log(`connect rcon successful ${addr}`);
	await setup(match);
	await registerLogAddress(match);
};

const onRconConnectionEnd = async (match: Match) => {
	const addr = `${match.rconConnection?.config.host}:${match.rconConnection?.config.port}`;
	match.log(`rcon connection lost: ${addr}`);
	while (true) {
		try {
			await sleep(10000);
			if (match.data.isStopped) {
				return;
			}
			await connectToGameServer(match);
			return;
		} catch (err) {
			match.log(`reconnect rcon failed ${addr}: ${err}`);
		}
	}
};

/**
 * Executed only once per match (at creation).
 */
const init = async (match: Match) => {
	match.log('init match...');
	await execManyRcon(match, match.data.rconCommands.init);
	match.log('init match finished');
};

/**
 * Executed every time after the connection to the game server is established.
 */
const setup = async (match: Match) => {
	// TMT does not need any special log settings to work. Only 'log on' must be executed.
	// If more is needed (in the future): mp_logdetail, mp_logdetail_items, mp_logmoney

	match.log('Setup match...');

	await setTeamNames(match);

	await execRcon(match, 'log on');
	await execRcon(match, 'mp_warmuptime 600');
	await execRcon(match, 'mp_warmup_pausetimer 1');
	await execRcon(match, 'mp_autokick 0');
	await execRcon(match, `mp_backup_round_file "round_backup_${match.data.id}"`);
	await execRcon(match, 'mp_backup_restore_load_autopause 1');
	await execRcon(match, 'mp_backup_round_auto 1');
	await execRcon(
		match,
		'mp_backup_round_file_pattern "%prefix%_%date%_%time%_%map%_round%round%_score_%score1%_%score2%.txt"'
	);

	match.log('Setup finished');
};

/**
 * @returns string (valid log address) or null (invalid input)
 */
export const checkAndNormalizeLogAddress = (url: string): string | null => {
	try {
		const urlParts = new URL(url);
		if (urlParts.protocol !== 'http:' && urlParts.protocol !== 'https:') {
			return null;
		}
		// normalize: "http:////127.1.1.1:8080////whatever"" -> "http://127.1.1.1:8080"
		return urlParts.protocol + '//' + urlParts.host;
	} catch (err) {
		return null;
	}
};

const registerLogAddress = async (match: Match) => {
	const logAddress = `${match.data.tmtLogAddress || TMT_LOG_ADDRESS}/api/matches/${
		match.data.id
	}/server/log/${match.data.logSecret}`;
	const logAddressList = await execRcon(match, 'logaddress_list_http');
	const existing = logAddressList
		.trim()
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.startsWith(logAddress));
	if (!existing) {
		match.data.parseIncomingLogs = false;
		match.log('register log address');
		await execRcon(match, `logaddress_add_http "${logAddress}"`);

		MatchService.scheduleSave(match);
	}

	// delay parsing of incoming log lines (because we don't care about the initial big batch)
	sleep(2000)
		.then(async () => {
			if (!match.data.parseIncomingLogs) {
				match.log('enable parsing of incoming log');
				match.data.parseIncomingLogs = true;
				MatchService.scheduleSave(match);
				await say(match, 'ONLINE');
				if (match.data.state === 'ELECTION') {
					await Election.auto(match);
				}
				await sayPeriodicMessage(match);
			}
		})
		.catch((err) => {
			match.log(`Error in delayed registerLogAddress: ${err}`);
		});
};

export const execRcon = async (match: Match, command: string) => {
	return await GameServer.exec(match, command);
};

export const execManyRcon = async (match: Match, commands: string[]) => {
	const responses = [];
	for (let i = 0; i < commands.length; i++) {
		responses.push(await execRcon(match, commands[i]!));
	}
	return responses;
};

export const say = async (match: Match, message: string) => {
	message = escapeRconSayString(Settings.SAY_PREFIX + message);
	await execRcon(match, `say ${message}`);
};

export const getConfigVar = async (match: Match, configVar: string): Promise<string> => {
	const response = await execRcon(match, configVar);
	const configVarPattern = new RegExp(`^${configVar} = (.*)`);
	const configVarMatch = response.match(configVarPattern);
	if (configVarMatch) {
		return configVarMatch[1]!;
	}
	return '';
};

const sayPeriodicMessage = async (match: Match) => {
	if (match.periodicTimerId) {
		clearTimeout(match.periodicTimerId);
	}

	match.periodicTimerId = match.data.isStopped
		? undefined
		: setTimeout(async () => {
				try {
					await sayPeriodicMessage(match);
				} catch (err) {
					match.log(`Error in sayPeriodicMessage: ${err}`);
				}
		  }, Settings.PERIODIC_MESSAGE_FREQUENCY);

	const sv_password = await getConfigVar(match, 'sv_password');
	if (sv_password && sv_password !== match.data.serverPassword) {
		match.data.serverPassword = sv_password;
	}

	if (match.data.state === 'ELECTION') {
		await Election.sayPeriodicMessage(match);
	} else if (match.data.state === 'MATCH_MAP') {
		const matchMap = getCurrentMatchMap(match);
		if (matchMap) {
			await MatchMap.sayPeriodicMessage(match, matchMap);
		}
	} else if (match.data.state === 'FINISHED') {
		await say(match, 'MATCH IS FINISHED');
	}
};

export const getCurrentMatchMap = (match: Match) => {
	if (match.data.state === 'MATCH_MAP') {
		return match.data.matchMaps[match.data.currentMap];
	}
	return undefined;
};

export const getTeamByAB = (match: Match, teamAB: TTeamAB): ITeam => {
	switch (teamAB) {
		case 'TEAM_A':
			return match.data.teamA;
		case 'TEAM_B':
			return match.data.teamB;
	}
};

export const setTeamNames = async (match: Match) => {
	const currentMatchMap = getCurrentMatchMap(match);
	if (currentMatchMap) {
		const team1 = getTeamByAB(match, currentMatchMap.startAsCtTeam);
		const team2 = getTeamByAB(match, getOtherTeamAB(currentMatchMap.startAsCtTeam));
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
	const summaryPattern = /^(\d+) backup files/;
	const summaryMatch = lines
		.map((line) => line.match(summaryPattern))
		.filter((match) => match !== null)[0];
	const totalFiles = summaryMatch ? parseInt(summaryMatch[1]!) : 0;
	return {
		latestFiles: files,
		total: isNaN(totalFiles) ? 0 : totalFiles,
	};
};

export const loadRoundBackup = async (match: Match, file: string) => {
	await execRcon(match, 'mp_pause_match');
	const response = await execRcon(match, `mp_backup_restore_load_file "${file}"`);
	if (response.includes('Failed to load file:')) {
		match.log(`Error loading round backup: ${response}`);
		return false;
	} else {
		match.log(`load round backup ${file}`);
		const currentMatchMap = getCurrentMatchMap(match);
		if (currentMatchMap) {
			currentMatchMap.state = 'PAUSED';
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
			const oldestLine = match.logBuffer[0]!;
			await onLogLine(match, oldestLine);
			match.logBuffer.splice(0, 1);
		}
	}
};

const onLogLine = async (match: Match, line: string) => {
	if (!line) return;
	try {
		//09/14/2020 - 15:11:58.307 - "PlayerName<2><STEAM_1:0:7426845><TERRORIST>" say "Hello World"
		// console.debug('line:', line);
		const dateTimePattern = /^\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d\.\d\d\d - /;

		const consolePattern = /"Console<0><Console><Console>" (.*)$/;
		const consoleMatch = line.match(new RegExp(dateTimePattern.source + consolePattern.source));
		if (consoleMatch) {
			const remainingLine = consoleMatch[1]!;
			await onConsoleLogLine(match, remainingLine);
			return;
		}

		const botPattern = /"(.*?)<(\d+)><BOT><(CT|TERRORIST)>" (.*)$/;
		const botMatch = line.match(new RegExp(dateTimePattern.source + botPattern.source));
		if (botMatch) {
			const name = botMatch[1]!;
			const teamString = botMatch[2] as TTeamString;
			const remainingLine = botMatch[3]!;
			return;
		}

		const playerPattern = /"(.*?)<(\d+)><(.*?)><(|Unassigned|CT|TERRORIST)>" (.*)$/;
		const playerMatch = line.match(new RegExp(dateTimePattern.source + playerPattern.source));
		if (playerMatch) {
			const name = playerMatch[1]!;
			const ingamePlayerId = playerMatch[2]!;
			const steamId = playerMatch[3]!;
			const teamString = playerMatch[4] as TTeamString;
			const remainingLine = playerMatch[5]!;
			await onPlayerLogLine(match, name, ingamePlayerId, steamId, teamString, remainingLine);
		}

		const mapEndPattern = /Game Over: competitive (.*) score (\d+):(\d+) after (\d+) min$/;
		const mapEndMatch = line.match(new RegExp(dateTimePattern.source + mapEndPattern.source));
		if (mapEndMatch) {
			await onMapEnd(match);
		}

		const roundEndPattern =
			/Team "(CT|TERRORIST)" triggered "([a-zA-Z_]+)" \(CT "(\d+)"\) \(T "(\d+)"\)/;
		const roundEndMatch = line.match(
			new RegExp(dateTimePattern.source + roundEndPattern.source)
		);
		if (roundEndMatch) {
			const winningTeam = roundEndMatch[1]!;
			const winningReason = roundEndMatch[2]!;
			const ctScore = parseInt(roundEndMatch[3]!);
			const tScore = parseInt(roundEndMatch[4]!);
			const currentMatchMap = getCurrentMatchMap(match);
			if (currentMatchMap) {
				await MatchMap.onRoundEnd(
					match,
					currentMatchMap,
					ctScore,
					tScore,
					winningTeam === 'CT' ? 'CT' : 'T'
				);
			}
		}
	} catch (err) {
		match.log('error in onLogLine' + err);
	}
};

const onConsoleLogLine = async (match: Match, remainingLine: string) => {
	const sayMatch = remainingLine.match(/^say(_team)? "(.*)"$/);
	if (sayMatch) {
		const message = sayMatch[2]!;
		await onConsoleSay(match, message);
	}
};

const onPlayerLogLine = async (
	match: Match,
	name: string,
	ingamePlayerId: string,
	steamId: string,
	teamString: TTeamString,
	remainingLine: string
) => {
	let player: IPlayer | undefined = undefined;
	if (steamId !== 'BOT' && steamId !== 'Console') {
		const steamId64 = Player.getSteamID64(steamId);
		player = match.data.players.find((p) => p.steamId64 === steamId64);
		if (!player) {
			player = Player.create(steamId, name);
			match.data.players.push(player);
		}
	}

	//04/21/2023 - 22:36:15: "Yenz<55><STEAM_1:0:8520813><TERRORIST>" disconnected (reason "Disconnect")
	const disconnectMatch = remainingLine.match(/^disconnected/);
	if (disconnectMatch) {
		const players = await GameServer.getPlayers(match);
		if (players.length === 0 && match.data.mode === 'LOOP') {
			await restartElection(match);
		}
	}

	//say "Hello World"
	const sayMatch = remainingLine.match(/^say(_team)? "(.*)"$/);
	if (sayMatch && player) {
		const isTeamChat = sayMatch[1] === '_team';
		const message = sayMatch[2]!;
		await onPlayerSay(match, player, message, isTeamChat, teamString);
	}
};

const onPlayerSay = async (
	match: Match,
	player: IPlayer,
	message: string,
	isTeamChat: boolean,
	teamString: TTeamString
) => {
	message = message.trim();

	Events.onPlayerSay(match, player, message, isTeamChat);

	if (Settings.COMMAND_PREFIXES.includes(message[0]!)) {
		message = message.substring(1);
		const parts = message.split(' ').filter((str) => str.length > 0);
		const commandString = parts.shift()?.toLowerCase();
		if (commandString) {
			const command = commands.getInternalCommandByUserCommand(commandString);
			if (command) {
				await commands.onCommand({
					command: command,
					match: match,
					parameters: parts,
					player: player,
					teamString: teamString,
				});
				await commands.onCommand({
					command: '*',
					match: match,
					parameters: parts,
					player: player,
					teamString: teamString,
				});
			} else {
				await say(match, `COMMAND UNKNOWN`);
			}
		}
	}
};

const onConsoleSay = async (match: Match, message: string) => {
	message = message.trim();
	if (!message.startsWith(Settings.SAY_PREFIX)) {
		Events.onConsoleSay(match, message);
	}
};

export const registerCommandHandlers = () => {
	commands.registerHandler('TEAM', onTeamCommand);
	commands.registerHandler('*', onEveryCommand);
};

const onEveryCommand: commands.CommandHandler = async (e) => {
	if (!e.player.team) {
		return;
	}
	const currentMatchMap = getCurrentMatchMap(e.match);
	const currentCtTeamAB = currentMatchMap
		? getCurrentTeamSideAndRoundSwitch(currentMatchMap).currentCtTeamAB
		: 'TEAM_A';
	const currentTTeamAB = getOtherTeamAB(currentCtTeamAB);
	if (
		(e.teamString === 'TERRORIST' && e.player.team !== currentTTeamAB) ||
		(e.teamString === 'CT' && e.player.team !== currentCtTeamAB)
	) {
		await sayWrongTeamOrSide(e.match, e.player, e.teamString, e.player.team);
	}
};

export const sayNotAssigned = async (match: Match, player: IPlayer) => {
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
	currentTeamAB: TTeamAB
) => {
	const currentTeam = getTeamByAB(match, currentTeamAB);
	const otherTeam = getTeamByAB(match, getOtherTeamAB(currentTeamAB));
	await say(
		match,
		`PLAYER ${escapeRconString(player.name)} IS REGISTERED FOR ${escapeRconString(
			currentTeam.name
		)} BUT CURRENTLY IN ${currentSite} (${escapeRconString(otherTeam.name)})`
	);
	await say(
		match,
		`CHECK SCOREBOARD AND CHANGE TEAM OR TYPE "${Settings.COMMAND_PREFIXES[0]}team ${
			currentTeamAB === 'TEAM_A' ? 'b' : 'a'
		}" TO CHANGE REGISTRATION`
	);
};

const onTeamCommand: commands.CommandHandler = async ({ match, player, parameters }) => {
	const firstParameter = parameters[0]?.toUpperCase();
	if (firstParameter === 'A' || firstParameter === 'B') {
		player.team = firstParameter === 'A' ? 'TEAM_A' : 'TEAM_B';
		const team = getTeamByAB(match, player.team);
		say(
			match,
			`PLAYER ${escapeRconString(player.name)} JOINED TEAM ${escapeRconString(team.name)}`
		);
		match.log(`player ${player.name} joined team ${player.team} (${team.name})`);
	} else {
		const playerTeam = player.team;
		if (playerTeam) {
			say(
				match,
				`YOU ARE IN TEAM ${playerTeam === 'TEAM_A' ? 'A' : 'B'}: ${escapeRconString(
					playerTeam === 'TEAM_A' ? match.data.teamA.name : match.data.teamB.name
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
		const mapNumber = match.data.currentMap + 1;
		await MatchMap.onMapEnd(match, currentMatchMap);

		const winnerTeamAB = MatchMap.getWinner(currentMatchMap);
		if (!winnerTeamAB) {
			await say(match, `${mapNumber}. MAP FINISHED (DRAW)`);
			match.log(`${mapNumber}. map finished (draw)`);
		} else {
			const winnerTeam = getTeamByAB(match, winnerTeamAB);
			await say(
				match,
				`${mapNumber}. MAP FINISHED (WINNER: ${escapeRconString(winnerTeam.name)})`
			);
			match.log(`${mapNumber}. map finished (winner: ${winnerTeam.name})`);
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
		const wonMapsTeamA = getTeamWins(match, 'TEAM_A');
		const wonMapsTeamB = getTeamWins(match, 'TEAM_B');
		if (match.data.matchMaps.length / 2 < Math.max(wonMapsTeamA, wonMapsTeamB)) {
			return true;
		}
	}

	return match.data.matchMaps.reduce((pv, cv) => pv && cv.state === 'FINISHED', true);
};

const getTeamWins = (match: Match, teamAB: TTeamAB) => {
	if (teamAB === 'TEAM_A') {
		return (
			match.data.teamA.advantage +
			match.data.matchMaps.reduce(
				(pv: number, cv) =>
					pv + (cv.state === 'FINISHED' && MatchMap.getWinner(cv) === 'TEAM_A' ? 1 : 0),
				0
			)
		);
	} else {
		return (
			match.data.teamB.advantage +
			match.data.matchMaps.reduce(
				(pv: number, cv) =>
					pv + (cv.state === 'FINISHED' && MatchMap.getWinner(cv) === 'TEAM_B' ? 1 : 0),
				0
			)
		);
	}
};

const onMatchEnd = async (match: Match) => {
	if (match.data.state !== 'FINISHED') {
		match.data.state = 'FINISHED';
		MatchService.scheduleSave(match);
		const wonMapsTeamA = getTeamWins(match, 'TEAM_A');
		const wonMapsTeamB = getTeamWins(match, 'TEAM_B');
		Events.onMatchEnd(match, wonMapsTeamA, wonMapsTeamB);
		await sleep(Settings.MATCH_END_ACTION_DELAY);
		switch (match.data.matchEndAction) {
			case 'KICK_ALL':
				await GameServer.kickAll(match);
				break;
			case 'QUIT_SERVER':
				await execRcon(match, 'quit');
				break;
		}

		if (match.data.mode === 'LOOP') {
			await restartElection(match);
		} else {
			await MatchService.remove(match.data.id); // this will call Match.stop()
		}
	}
};

export const stop = async (match: Match) => {
	match.log(`stop match`);
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
	await ManagedGameServers.free(match.data.gameServer, match.data.id);
};

export const onElectionFinished = async (match: Match) => {
	match.log('election finished');
	Events.onElectionEnd(match);
	match.data.state = 'MATCH_MAP';
	MatchService.scheduleSave(match);
	const currentMatchMap = getCurrentMatchMap(match);
	if (currentMatchMap) {
		await MatchMap.loadMap(match, currentMatchMap);
	}
};

const restartElection = async (match: Match) => {
	match.log('restart election');
	match.data.state = 'ELECTION';
	match.data.election = Election.create(match.data.mapPool, match.data.electionSteps);
	match.data.matchMaps = [];
	match.data.currentMap = 0;
	await Election.auto(match);
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
		await ManagedGameServers.free(match.data.gameServer, match.data.id);
		match.data.gameServer = dto.gameServer;
		match.rconConnection?.end().catch((err) => {
			match.log(`error end rcon connection ${err}`);
		});
		// onRconConnectionEnd will handle automatic reconnect to the (new) game server
	}

	if (dto.passthrough) {
		match.data.passthrough = dto.passthrough;
	}

	if (dto.webhookUrl !== undefined) {
		match.data.webhookUrl = dto.webhookUrl;
	}

	if (dto.logSecret) {
		const previous = match.data.logSecret;
		match.data.logSecret = dto.logSecret;
		try {
			await registerLogAddress(match);
		} catch (err) {
			match.data.logSecret = previous;
			throw err;
		}
	}

	if (dto.tmtLogAddress) {
		const addr = checkAndNormalizeLogAddress(dto.tmtLogAddress);
		if (!addr) {
			throw new ValidateError(
				{
					tmtLogAddress: {
						message: 'invalid url',
					},
				},
				'invalid tmtLogAddress'
			);
		}
		match.data.tmtLogAddress = addr;
		await execRcon(match, 'logaddress_delall_http');
		await registerLogAddress(match);
	}

	if (dto.currentMap !== undefined && dto.currentMap !== match.data.currentMap) {
		const nextMap = match.data.matchMaps[dto.currentMap];
		if (nextMap) {
			match.data.currentMap = dto.currentMap;
			await MatchMap.loadMap(match, nextMap);
		} else {
			throw new ValidateError(
				{
					currentMap: {
						message: 'invalid number',
					},
				},
				'invalid currentMap'
			);
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
		await restartElection(match);
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
