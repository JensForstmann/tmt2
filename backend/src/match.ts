import { ValidateError } from '@tsoa/runtime';
import { generate as shortUuid } from 'short-uuid';
import { COMMIT_SHA, IMAGE_BUILD_TIMESTAMP, TMT_LOG_ADDRESS, VERSION } from '.';
import {
	IMatch,
	IMatchCreateDto,
	IMatchUpdateDto,
	IPlayer,
	ITeam,
	TTeamAB,
	TTeamString,
	escapeRconSayString,
	escapeRconString,
	getCurrentTeamSideAndRoundSwitch,
	getOtherTeamAB,
	sleep,
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
import * as StatsLogger from './statsLogger';

const STORAGE_LOGS_PREFIX = 'logs_';
const STORAGE_LOGS_SUFFIX = '.jsonl';
const SAY_PREFIX = GameServer.colors.green + Settings.SAY_PREFIX + GameServer.colors.white;

export interface Match {
	data: IMatch;
	rconConnection?: Rcon;
	periodicJobTimer?: NodeJS.Timeout;
	periodicJobCounter: number;
	logBuffer: string[];
	log: (msg: string) => void;
	warnAboutWrongTeam: boolean;
}

export class GameServerInUseError extends Error {}

export const createFromData = async (data: IMatch, logMessage?: string) => {
	const match: Match = {
		data: data,
		periodicJobCounter: 0,
		logBuffer: [],
		log: () => {},
		warnAboutWrongTeam: true,
	};
	match.data = addChangeListener(data, createOnDataChangeHandler(match));
	match.log = createLogger(match);
	if (logMessage) {
		match.log(logMessage);
	}

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

	const otherMatches = MatchService.getLiveMatchesByGameServer(data.gameServer);
	if (otherMatches.length > 0) {
		throw new GameServerInUseError(
			'game server already in use by ' + otherMatches.map((match) => match.id).join(', ')
		);
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
		lastSavedAt: 0,
		webhookUrl: dto.webhookUrl ?? null,
		webhookHeaders: dto.webhookHeaders ?? null,
		mode: dto.mode ?? 'SINGLE',
	};
	try {
		const match = await createFromData(data, 'Create new match');
		return match;
	} catch (err) {
		if (!dto.gameServer) {
			await ManagedGameServers.free(gameServer, id);
			await ManagedGameServers.update({ ...gameServer, canBeUsed: false });
		}
		throw err;
	}
};

const createLogger = (match: Match) => (msg: string) => {
	const ds = new Date().toISOString();
	msg = GameServer.removeColors(msg);
	Storage.appendLineJson(
		STORAGE_LOGS_PREFIX + match.data.id + STORAGE_LOGS_SUFFIX,
		`${ds} | ${msg}`
	);
	console.info(`${ds} [${match.data.id}] ${msg}`);
	Events.onLog(match, msg);
};

const createOnDataChangeHandler = (match: Match) => (path: Array<string | number>, value: any) => {
	Events.onMatchUpdate(match, path, value);
};

export const getLogsTail = async (matchId: string, numberOfLines = 1000): Promise<string[]> => {
	return await Storage.readLinesJson(
		STORAGE_LOGS_PREFIX + matchId + STORAGE_LOGS_SUFFIX,
		[],
		numberOfLines
	);
};

const connectToGameServer = async (match: Match): Promise<void> => {
	const addr = `${match.data.gameServer.ip}:${match.data.gameServer.port}`;
	match.log(`Connect rcon ${addr}`);
	const gameServer = await GameServer.create(match.data.gameServer, match.log);
	gameServer.on('end', () => onRconConnectionEnd(match));
	const previous = match.rconConnection;
	match.rconConnection = gameServer;
	previous?.end().catch(() => {});
	match.log(`Connect rcon successful ${addr}`);
	await setup(match);
	await init(match);
	await ensureLogAddressIsRegistered(match);
	resetPeriodicJobTimer(match);
};

const init = async (match: Match) => {
	const aliasKey = 'TMT_MATCH_ID';
	const aliasResponse = await execRcon(match, 'alias');
	const aliasMatchId = aliasResponse
		.trim()
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.startsWith(`${aliasKey} : `))
		?.substring(aliasKey.length + 3); // 3 for " : "
	if (aliasMatchId !== match.data.id) {
		// server was restarted or TMT was never connected before
		await execRcon(match, `alias ${aliasKey} ${match.data.id}`);
		await execRconCommands(match, 'init');

		// if match is already in progress (server crashed) -> load match map
		const currentMatchMap = getCurrentMatchMap(match);
		if (currentMatchMap) {
			match.log(
				`Match is already in progress (assume server crash): load match map ${currentMatchMap.name}`
			);
			await MatchMap.loadMap(match, currentMatchMap, true);
		}
	}
};

const onRconConnectionEnd = async (match: Match) => {
	const addr = `${match.rconConnection?.config.host}:${match.rconConnection?.config.port}`;
	match.log(`Rcon connection lost: ${addr}`);

	match.data.players.forEach((player) => (player.online = false)); // assume server restart or server change
	MatchService.scheduleSave(match);

	while (true) {
		try {
			await sleep(10000);
			if (match.data.isStopped) {
				return;
			}
			await connectToGameServer(match);
			return;
		} catch (err) {
			match.log(`Reconnect rcon failed ${addr}: ${err}`);
		}
	}
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
	await execRcon(match, 'mp_logdetail 1');
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

const ensureLogAddressIsRegistered = async (match: Match) => {
	const logAddress = `${match.data.tmtLogAddress || TMT_LOG_ADDRESS}/api/matches/${
		match.data.id
	}/server/log/${match.data.logSecret}`;

	let logAddressList: string;
	try {
		logAddressList = await GameServer.exec(match, 'logaddress_list_http', false);
	} catch (err) {
		return;
	}

	const existing = logAddressList
		.trim()
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.startsWith(logAddress));

	if (!existing) {
		match.data.parseIncomingLogs = false;
		MatchService.scheduleSave(match);
		match.log('Register log address');
		await execRcon(match, 'logaddress_delall_http');
		await execRcon(match, `logaddress_add_http "${logAddress}"`);
	}

	// delay parsing of incoming log lines (because we don't care about the initial big batch)
	sleep(2000)
		.then(async () => {
			if (!match.data.parseIncomingLogs) {
				match.log('Enable parsing of incoming log');
				match.data.parseIncomingLogs = true;
				MatchService.scheduleSave(match);
				await say(match, 'TMT IS ONLINE');
				if (match.data.state === 'ELECTION') {
					await Election.auto(match);
				}
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

export const execRconCommands = async (match: Match, key: keyof IMatch['rconCommands']) => {
	match.log(`Execute rcon commands (${key})`);
	await execManyRcon(match, match.data.rconCommands[key]);
};

export const say = async (match: Match, message: string) => {
	message = escapeRconSayString(SAY_PREFIX + message);
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

export const resetPeriodicJobTimer = (match: Match) => {
	if (match.periodicJobTimer) {
		clearTimeout(match.periodicJobTimer);
	}

	match.periodicJobTimer = match.data.isStopped
		? undefined
		: setTimeout(async () => {
				try {
					await periodicJob(match);
				} catch (err) {
					match.log(`Error in periodicJob: ${err}`);
				}
			}, Settings.PERIODIC_JOB_FREQUENCY);
};

const periodicJob = async (match: Match) => {
	resetPeriodicJobTimer(match);
	match.periodicJobCounter = match.periodicJobCounter + 1;

	await ensureLogAddressIsRegistered(match);

	const sv_password = await getConfigVar(match, 'sv_password');
	if (sv_password !== match.data.serverPassword) {
		match.log('Server password updated');
		match.data.serverPassword = sv_password;
	}

	if (match.data.state === 'ELECTION') {
		await Election.periodicJob(match);
	} else if (match.data.state === 'MATCH_MAP') {
		const matchMap = getCurrentMatchMap(match);
		if (matchMap) {
			await MatchMap.periodicJob(match, matchMap);
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
	await execRcon(match, 'mp_warmup_end'); // CS2 could be stuck (frozen cam, no timer, no pause indication) if game was currently in warmup
	await execRcon(match, 'mp_backup_restore_load_autopause 1');
	await execRcon(match, 'mp_pause_match'); // mp_backup_restore_load_autopause doesn't work currently in CS2
	await execRconCommands(match, 'match');
	const response = await execRcon(match, `mp_backup_restore_load_file "${file}"`);
	if (response.includes('Failed to load file:')) {
		match.log(`Error loading round backup: ${response}`);
		return false;
	} else {
		match.log(`Load round backup ${file}`);
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
			try {
				await onLogLine(match, oldestLine);
			} catch (err) {
				match.log(`Error processing incoming log line from game server: ${oldestLine}`);
				match.log(`Failed line: ${oldestLine}`);
				match.log(`Message: ${err}`);
			}
			match.logBuffer.splice(0, 1);
		}
	}
};

const onLogLine = async (match: Match, line: string) => {
	if (!line) {
		return;
	}

	try {
		//09/14/2020 - 15:11:58.307 - "PlayerName<2><[U:1:12345678]><TERRORIST>" say "Hello World"
		// console.debug('line:', line);
		const dateTimePattern = /^\d\d\/\d\d\/\d\d\d\d - \d\d:\d\d:\d\d\.\d\d\d - /;

		const consolePattern = /"Console<0>" (.*)$/;
		const consoleMatch = line.match(new RegExp(dateTimePattern.source + consolePattern.source));
		if (consoleMatch) {
			const remainingLine = consoleMatch[1]!;
			await onConsoleLogLine(match, remainingLine);
			return;
		}

		const rconPattern = /rcon from "(.*?)": (.*)$/;
		const rconMatch = line.match(new RegExp(dateTimePattern.source + rconPattern.source));
		if (rconMatch) {
			return;
		}

		// "Mae<9><BOT><CT>" [622 2164 -97] killed "Nickname<0><[U:1:12345678]><TERRORIST>" [1287 2165 1] with "hkp2000"
		// "Nickname<0><[U:1:12345678]><TERRORIST>" say "Hello there"
		// "Nickname<0><[U:1:12345678]>" switched from team <CT> to <TERRORIST>
		const playerPattern =
			/"(.*?)<(\d+)><(.*?)>(?:<(|Unassigned|CT|TERRORIST|Spectator)>)?" (.*)$/;
		const playerMatch = line.match(new RegExp(dateTimePattern.source + playerPattern.source));
		if (playerMatch) {
			const name = playerMatch[1]!;
			const ingamePlayerId = playerMatch[2]!;
			const steamId = playerMatch[3]!;
			const teamString = (playerMatch[4] ?? '') as TTeamString; // playerMatch[4] may be undefined
			const remainingLine = playerMatch[5]!;
			await onPlayerLogLine(match, name, ingamePlayerId, steamId, teamString, remainingLine);
			return;
		}

		// Game Over: competitive  de_overpass score 13:0 after 3 min
		// Game Over: scrimcomp2v2  de_overpass score 9:0 after 3 min
		// Game Over: competitive mg_active fy_pool_day score 0:13 after 4 min
		const mapEndPattern = /Game Over: .*? score (\d+):(\d+)/;
		const mapEndMatch = line.match(new RegExp(dateTimePattern.source + mapEndPattern.source));
		if (mapEndMatch) {
			await onMapEnd(match);
			return;
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
			return;
		}

		// World triggered "Match_Start" on "de_dust2"
		const matchStartPattern = /World triggered "Match_Start" on .*/;
		const matchStartMatch = line.match(
			new RegExp(dateTimePattern.source + matchStartPattern.source)
		);
		if (matchStartMatch) {
			match.warnAboutWrongTeam = true;
			return;
		}
	} catch (err) {
		match.log('Error in onLogLine' + err);
	}
};

const onConsoleLogLine = async (match: Match, remainingLine: string) => {
	const sayMatch = remainingLine.match(/^say(_team)? "(.*)"$/);
	if (sayMatch) {
		const message = sayMatch[2]!;
		await onConsoleSay(match, message);
	}
};

const updatePlayerSide = (
	match: Match,
	player: IPlayer,
	toTeam: TTeamString,
	log = false,
	force = false
) => {
	if (toTeam === '' && !force) {
		// some log lines does not contain the correct team string although player is assigned
		return;
	}
	const side = Player.getSideFromTeamString(toTeam);
	if (player.side !== side) {
		if (log) {
			match.log(
				`Player ${player.steamId64} (${player.name}) changed side from '${
					player.side ?? ''
				}' to '${side ?? ''}' (based on event other than "switch team")`
			);
		}
		player.side = side;
		MatchService.scheduleSave(match);
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
			player = Player.create(match, steamId, name);
			const playerExists =
				(
					(await Storage.queryDB(
						`SELECT * FROM ${StatsLogger.PLAYERS_TABLE} WHERE steamId = '${player.steamId64}'`
					)) as any[]
				).length > 0;
			if (!playerExists) {
				await Storage.insertDB(
					StatsLogger.PLAYERS_TABLE,
					new Map<string, string | number>([
						['steamId', player.steamId64],
						['name', player.name],
						['tKills', 0],
						['tDeaths', 0],
						['tAssists', 0],
						['tDiff', 0],
						['tHits', 0],
						['tHeadshots', 0],
						['tHsPct', 0],
						['tRounds', 0],
						['tDamages', 0],
						['tAdr', 0],
					])
				);
			}
			await Storage.insertDB(
				StatsLogger.PLAYERS_TABLE,
				new Map<string, string | number>([
					['steamId', player.steamId64],
					['matchId', match.data.id],
					['kills', 0],
					['deaths', 0],
					['assists', 0],
					['diff', 0],
					['hits', 0],
					['headshots', 0],
					['hsPct', 0],
					['rounds', 0],
					['damages', 0],
					['adr', 0],
				])
			);
			match.log(`Player ${player.steamId64} (${name}) created`);
			match.data.players.push(player);
			player = match.data.players[match.data.players.length - 1]!; // re-assign to work nicely with changeListener (ProxyHandler)
			MatchService.scheduleSave(match);
		}
		if (player.name !== name) {
			match.log(`Player ${player.steamId64} (${player.name}) renamed to: ${name}`);
			player.name = name;
			MatchService.scheduleSave(match);
		}
	}

	if (!player) {
		// Console or BOT
		return;
	}

	if (player.online !== true && !remainingLine.includes('committed suicide with "world"')) {
		// "committed suicide" log line comes after "disconnected"
		player.online = true;
		MatchService.scheduleSave(match);
	}

	//switched from team <CT> to <TERRORIST>
	const switchTeamMatch = remainingLine.match(
		/^switched from team <(|Unassigned|CT|TERRORIST|Spectator)> to <(|Unassigned|CT|TERRORIST|Spectator)>/
	);
	if (switchTeamMatch) {
		const fromTeam = switchTeamMatch[1] as TTeamString;
		const toTeam = switchTeamMatch[2] as TTeamString;
		match.log(
			`Player ${player.steamId64} (${player.name}) changed side from '${fromTeam}' to '${toTeam}'`
		);
		updatePlayerSide(match, player, toTeam, false, true);
		teamString = toTeam;
		await checkPlayerTeamAssignment(match, player, teamString);
		return;
	}

	updatePlayerSide(match, player, teamString, true); // update player side in case no "switched from team" log line was received

	//connected, address "127.0.0.1:56202"
	const connectMatch = remainingLine.match(/^connected/);
	if (connectMatch) {
		match.log(`Player ${player.steamId64} (${player.name}) connected`);
		player.online = true;
		MatchService.scheduleSave(match);
		return;
	}

	//disconnected (reason "Disconnect")
	const disconnectMatch = remainingLine.match(/^disconnected/);
	if (disconnectMatch) {
		match.log(`Player ${player.steamId64} (${player.name}) disconnected`);
		player.online = false;
		MatchService.scheduleSave(match);
		if (match.data.mode === 'LOOP') {
			const players = await GameServer.getPlayers(match);
			if (players.length === 0) {
				await loopMatch(match);
			}
		}
		return;
	}

	//say "Hello World"
	const sayMatch = remainingLine.match(/^say(_team)? "(.*)"$/);
	if (sayMatch) {
		const isTeamChat = sayMatch[1] === '_team';
		const message = sayMatch[2]!;
		await onPlayerSay(match, player, message, isTeamChat, teamString);
		return;
	}

	//attacked "PlayerName<1><U:1:12345678><CT>" [2397 2079 133] with "glock" (damage "117") (damage_armor "0") (health "0") (armor "0") (hitgroup "head")
	const damageMatch = remainingLine.match(
		/^attacked ".+<\d+><([\[\]\w:]+)><(?:TERRORIST|CT)>" \[-?\d+ -?\d+ -?\d+\] with "\w+" \(damage "(\d+)"\) \(damage_armor "(\d+)"\) \(health "(\d+)"\) \(armor "(\d+)"\) \(hitgroup "([\w ]+)"\)$/
	);
	if (damageMatch) {
		const victimId = damageMatch[1]!;
		const damage = Number(damageMatch[2]);
		const damageArmor = Number(damageMatch[3]);
		const headshot = damageMatch[4] == 'head';
		await StatsLogger.onDamage(match.data.id, steamId, victimId, damage, damageArmor, headshot);
		return;
	}

	//killed "PlayerName<2><STEAM_1:1:12345678><TERRORIST>" [-100 150 60] with "ak47" (headshot)
	const killMatch = remainingLine.match(
		/^killed ".+<\d+><([\[\]\w:]+)><(?:|Unassigned|TERRORIST|CT)>" \[-?\d+ -?\d+ -?\d+\] with "\w+" ?\(?(headshot|penetrated|headshot penetrated)?\)?$/
	);
	if (killMatch) {
		const victimId = killMatch[1]!;
		await StatsLogger.onKill(match.data.id, steamId, victimId);
		return;
	}

	//assisted killing "PlayerName2<3><STEAM_1:1:87654321><CT>"
	const assistMatch = remainingLine.match(/^assisted killing/);
	if (assistMatch) {
		await StatsLogger.onAssist(match.data.id, steamId);
		return;
	}

	//committed suicide with "world"
	//was killed by the bomb
	const bombKillMatch = remainingLine.match(/^(?:was killed by the bomb|committed suicide with)/);
	if (bombKillMatch) {
		await StatsLogger.onOtherDeath(match.data.id, steamId);
		return;
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

	Events.onPlayerSay(match, player, message, isTeamChat, teamString);

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
	if (!message.startsWith(SAY_PREFIX)) {
		message = GameServer.removeColors(message);
		Events.onConsoleSay(match, message);
	}
};

export const registerCommandHandlers = () => {
	commands.registerHandler('TEAM', onTeamCommand);
	commands.registerHandler('VERSION', onVersionCommand);
	commands.registerHandler('*', onEveryCommand);
};

const onVersionCommand: commands.CommandHandler = async (e) => {
	await say(
		e.match,
		`TMT: version ${VERSION ?? 'unknown'}, commit ${COMMIT_SHA ?? 'unknown'}, build timestamp ${IMAGE_BUILD_TIMESTAMP ?? 'unknown'}`
	);
};

const onEveryCommand: commands.CommandHandler = async (e) => {
	await checkPlayerTeamAssignment(e.match, e.player, e.teamString);
};

const checkPlayerTeamAssignment = async (
	match: Match,
	player: IPlayer,
	teamString: TTeamString
) => {
	if (!player.team) {
		return;
	}
	const currentMatchMap = getCurrentMatchMap(match);
	const currentCtTeamAB = currentMatchMap
		? getCurrentTeamSideAndRoundSwitch(currentMatchMap).currentCtTeamAB
		: 'TEAM_A';
	const currentTTeamAB = getOtherTeamAB(currentCtTeamAB);
	if (
		(teamString === 'TERRORIST' && player.team !== currentTTeamAB) ||
		(teamString === 'CT' && player.team !== currentCtTeamAB)
	) {
		await sayWrongTeamOrSide(match, player, teamString, player.team);
	}
};

export const sayNotAssigned = async (match: Match, player: IPlayer) => {
	await say(match, `PLAYER ${escapeRconString(player.name)} NOT ASSIGNED!`);
	await say(
		match,
		`TYPE ${commands.formatFirstIngameCommand('TEAM', 'a')} TO JOIN ${escapeRconString(
			match.data.teamA.name
		)}`
	);
	await say(
		match,
		`TYPE ${commands.formatFirstIngameCommand('TEAM', 'b')} TO JOIN ${escapeRconString(
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
	if (!match.warnAboutWrongTeam) {
		return;
	}
	const currentTeam = getTeamByAB(match, currentTeamAB);
	const otherTeam = getTeamByAB(match, getOtherTeamAB(currentTeamAB));
	await say(
		match,
		`PLAYER ${GameServer.colors.lightRed}${escapeRconString(player.name)}${
			GameServer.colors.white
		} IS REGISTERED FOR ${escapeRconString(
			currentTeam.name
		)} BUT CURRENTLY IN ${currentSite} (${escapeRconString(otherTeam.name)})`
	);
	await say(
		match,
		`CHECK SCOREBOARD AND CHANGE TEAM OR TYPE ${commands.formatFirstIngameCommand(
			'TEAM',
			currentTeamAB === 'TEAM_A' ? 'b' : 'a'
		)} TO CHANGE REGISTRATION`
	);
};

export const sayWhatTeamToJoin = async (match: Match) => {
	const currentMatchMap = getCurrentMatchMap(match);
	const currentCtTeamAB = currentMatchMap
		? getCurrentTeamSideAndRoundSwitch(currentMatchMap).currentCtTeamAB
		: 'TEAM_A';
	if (currentCtTeamAB === 'TEAM_A') {
		await say(
			match,
			`${escapeRconString(
				match.data.teamA.name
			)} MUST JOIN CT AND TYPE ${commands.formatFirstIngameCommand('TEAM', 'a')}`
		);
		await say(
			match,
			`${escapeRconString(
				match.data.teamB.name
			)} MUST JOIN T AND TYPE ${commands.formatFirstIngameCommand('TEAM', 'b')}`
		);
	} else {
		await say(
			match,
			`${escapeRconString(
				match.data.teamB.name
			)} MUST JOIN CT AND TYPE ${commands.formatFirstIngameCommand('TEAM', 'b')}`
		);
		await say(
			match,
			`${escapeRconString(
				match.data.teamA.name
			)} MUST JOIN T AND TYPE ${commands.formatFirstIngameCommand('TEAM', 'a')}`
		);
	}
};

const onTeamCommand: commands.CommandHandler = async ({ match, player, parameters }) => {
	const firstParameter = parameters[0]?.toUpperCase();
	if (firstParameter === 'A' || firstParameter === 'B') {
		const forcedTeam = Player.getForcedTeam(match, player.steamId64);
		const wantedTeam: TTeamAB = firstParameter === 'A' ? 'TEAM_A' : 'TEAM_B';
		if (forcedTeam && forcedTeam !== wantedTeam) {
			await say(match, `PLAYER ${escapeRconString(player.name)} CANNOT CHANGE THEIR TEAM`);
			return;
		}
		player.team = wantedTeam;
		MatchService.scheduleSave(match);
		const team = getTeamByAB(match, player.team);
		await say(
			match,
			`PLAYER ${escapeRconString(player.name)} JOINED TEAM ${escapeRconString(team.name)}`
		);
		match.log(`Player ${player.name} joined team ${player.team} (${team.name})`);
	} else {
		const playerTeam = player.team;
		if (playerTeam) {
			await say(
				match,
				`PLAYER ${escapeRconString(player.name)} IS IN TEAM ${playerTeam === 'TEAM_A' ? 'A' : 'B'}: ${escapeRconString(
					playerTeam === 'TEAM_A' ? match.data.teamA.name : match.data.teamB.name
				)}`
			);
		} else {
			await say(match, `PLAYER ${escapeRconString(player.name)} HAS NO TEAM`);
		}
	}
};

const onMapEnd = async (match: Match) => {
	if (match.data.state !== 'MATCH_MAP') {
		return;
	}

	const currentMatchMap = getCurrentMatchMap(match);
	if (currentMatchMap) {
		await MatchMap.onMapEnd(match, currentMatchMap);
		if (isMatchEnd(match)) {
			match.log('Match finished');
			await onMatchEnd(match);
		} else {
			match.data.currentMap++;
			MatchService.scheduleSave(match);
			const nextMap = getCurrentMatchMap(match);
			if (nextMap) {
				await MatchMap.loadMap(match, nextMap);
			} else {
				match.log('No more maps to play, finish match');
				await onMatchEnd(match);
			}
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

		await say(match, 'MATCH IS FINISHED');

		const seconds = Math.round(Settings.MATCH_END_ACTION_DELAY / 1000);
		const delayInSeconds = Math.max(seconds, await getMapEndDelayInSeconds(match, seconds));

		// tell players what will happen next
		switch (match.data.matchEndAction) {
			case 'KICK_ALL':
				await say(match, `IN ${delayInSeconds} SECONDS ALL PLAYERS GET KICKED`);
				break;
			case 'QUIT_SERVER':
				await say(match, `IN ${delayInSeconds} SECONDS THE SERVER SHUTS DOWN`);
				break;
		}

		await sleep(delayInSeconds * 1000);

		switch (match.data.matchEndAction) {
			case 'KICK_ALL':
				await GameServer.kickAll(match);
				break;
			case 'QUIT_SERVER':
				await execRcon(match, 'quit');
				break;
		}

		if (match.data.mode === 'LOOP') {
			await loopMatch(match);
		} else {
			await MatchService.remove(match.data.id); // this will call Match.stop()
		}
	}
};

export const stop = async (match: Match) => {
	match.log(`Stop match`);
	match.data.isStopped = true;
	MatchService.scheduleSave(match);
	if (match.periodicJobTimer) {
		clearTimeout(match.periodicJobTimer);
	}
	await execRconCommands(match, 'end').catch((err) => {
		match.log(`Error executing match end rcon commands: ${err}`);
	});
	await say(match, `TMT IS OFFLINE`).catch(() => {});
	await GameServer.disconnect(match);
	await ManagedGameServers.free(match.data.gameServer, match.data.id);
	Events.onMatchStop(match);
};

export const onElectionFinished = async (match: Match) => {
	const result = match.data.matchMaps
		.map((matchMap) => {
			const side = matchMap.knifeForSide
				? '(Knife)'
				: `(CT: ${getTeamByAB(match, matchMap.startAsCtTeam).name}, T: ${
						getTeamByAB(match, getOtherTeamAB(matchMap.startAsCtTeam)).name
					})`;
			return `${matchMap.name} ${side}`;
		})
		.join(', ');
	match.log(`Election finished, result: ${result}`);
	Events.onElectionEnd(match);
	match.data.state = 'MATCH_MAP';
	MatchService.scheduleSave(match);
	const currentMatchMap = getCurrentMatchMap(match);
	if (currentMatchMap) {
		await MatchMap.loadMap(match, currentMatchMap);
	}
};

const restartElection = async (match: Match) => {
	match.log('Restart election');
	match.data.state = 'ELECTION';
	match.data.election = Election.create(match.data.mapPool, match.data.electionSteps);
	match.data.matchMaps = [];
	match.data.currentMap = 0;
	await Election.auto(match);
};

const loopMatch = async (match: Match) => {
	match.log('Loop mode is set, restart match');
	await restartElection(match);
	sleep(1000)
		.then(() => {
			// delay, because there might still be events left
			match.log('Clear player list');
			match.data.players = [];
		})
		.catch(() => {
			// shouldn't throw
		});
};

/**
 * Returns the number of seconds it should delay actions after a map ends (before changelevel or match end actions)
 * @param match Match
 * @param fallback
 */
export const getMapEndDelayInSeconds = async (match: Match, fallback: number): Promise<number> => {
	let delayInSeconds: number | undefined;
	const cVar = await getConfigVar(match, 'mp_match_restart_delay');
	if (/^\d+$/.test(cVar)) {
		delayInSeconds = parseInt(cVar);
	} else {
		match.log('Config var mp_match_restart_delay cannot be parsed to number: ' + cVar);
	}
	if (!delayInSeconds || isNaN(delayInSeconds)) {
		delayInSeconds = fallback;
	}
	return delayInSeconds;
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
		Player.forcePlayerIntoTeams(match);
		await setTeamNames(match);
	}

	if (dto.electionSteps) {
		Election.checkValidConfiguration(match.data.mapPool, dto.electionSteps);
		match.data.electionSteps = dto.electionSteps;
	}

	if (dto.gameServer) {
		await ManagedGameServers.free(match.data.gameServer, match.data.id);
		match.data.gameServer = dto.gameServer;
		match.rconConnection?.end().catch((err) => {
			match.log(`Error end rcon connection ${err}`);
		});
		// onRconConnectionEnd will handle automatic reconnect to the (new) game server
	}

	if (dto.passthrough) {
		match.data.passthrough = dto.passthrough;
	}

	if (dto.webhookUrl !== undefined) {
		match.data.webhookUrl = dto.webhookUrl;
	}

	if (dto.webhookHeaders !== undefined) {
		match.data.webhookHeaders = dto.webhookHeaders;
	}

	if (dto.logSecret) {
		const previous = match.data.logSecret;
		match.data.logSecret = dto.logSecret;
		try {
			await ensureLogAddressIsRegistered(match);
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
		await ensureLogAddressIsRegistered(match);
	}

	if (dto.currentMap !== undefined && dto.currentMap !== match.data.currentMap) {
		const nextMap = match.data.matchMaps[dto.currentMap];
		if (nextMap) {
			match.data.currentMap = dto.currentMap;
			await MatchMap.loadMap(match, nextMap, true);
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

	if (dto._execRconCommandsInit) {
		await execRconCommands(match, 'init');
	}

	if (dto._execRconCommandsKnife) {
		await execRconCommands(match, 'knife');
	}

	if (dto._execRconCommandsMatch) {
		await execRconCommands(match, 'match');
	}

	if (dto._execRconCommandsEnd) {
		await execRconCommands(match, 'end');
	}

	MatchService.scheduleSave(match);
};
