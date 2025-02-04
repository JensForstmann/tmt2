import {
	escapeRconString,
	getCurrentTeamSideAndRoundSwitch,
	getOtherTeamAB,
	IMatchMap,
	IMatchMapUpdateDto,
	sleep,
	TMatchMapSate,
	TTeamAB,
	TTeamSides,
} from '../../common';
import * as commands from './commands';
import * as Events from './events';
import { colors, formatMapName } from './gameServer';
import * as Match from './match';
import * as MatchService from './matchService';
import * as StatsLogger from './statsLogger';

export const create = (
	map: string,
	knifeForSide: boolean,
	startAsCtTeam: TTeamAB = 'TEAM_A'
): IMatchMap => {
	return {
		knifeForSide: knifeForSide,
		knifeRestart: {
			teamA: false,
			teamB: false,
		},
		maxRounds: 30, // only a default, will be set when the match is starting
		name: map,
		overTimeEnabled: true, // only a default, will be set when the match is starting
		overTimeMaxRounds: 6, // only a default, will be set when the match is starting
		readyTeams: {
			teamA: false,
			teamB: false,
		},
		score: {
			teamA: 0,
			teamB: 0,
		},
		startAsCtTeam: startAsCtTeam,
		state: 'PENDING',
	};
};

export const periodicJob = async (match: Match.Match, matchMap: IMatchMap) => {
	if (matchMap.state === 'WARMUP') {
		await Match.execRcon(match, 'mp_warmuptime 600');
		await Match.execRcon(match, 'mp_warmup_pausetimer 1');
		await Match.execRcon(match, 'mp_autokick 0');
	}

	switch (matchMap.state) {
		case 'IN_PROGRESS':
			await refreshOvertimeAndMaxRoundsSettings(match, matchMap);
			return;
		case 'AFTER_KNIFE':
			if (matchMap.knifeWinner) {
				const teamName = Match.getTeamByAB(match, matchMap.knifeWinner).name;
				await Match.say(match, `${escapeRconString(teamName)} WON THE KNIFE`);
				await Match.say(match, `PLEASE CHOOSE A SIDE TO START THE MATCH`);
			}
			break;
		case 'FINISHED':
			break;
		case 'KNIFE':
			await Match.say(match, `KNIFE ROUND IN PROGRESS`);
			break;
		case 'MAP_CHANGE':
			break;
		case 'PAUSED':
			await Match.say(match, `MATCH IS PAUSED`);
			break;
		case 'PENDING':
			break;
		case 'WARMUP':
			await Match.say(match, `MATCH IS IN WARMUP`);
			await Match.sayWhatTeamToJoin(match);
			break;
	}

	await sayAvailableCommands(match, matchMap);
};

const getAvailableCommandsEnums = (state: TMatchMapSate): commands.TCommand[] => {
	switch (state) {
		case 'AFTER_KNIFE':
			return ['RESTART', 'CT', 'T', 'STAY', 'SWITCH'];
		case 'FINISHED':
			return [];
		case 'IN_PROGRESS':
			return ['PAUSE', 'TACTICAL'];
		case 'KNIFE':
			return ['RESTART'];
		case 'MAP_CHANGE':
			return [];
		case 'PAUSED':
			return ['READY', 'UNREADY'];
		case 'PENDING':
			return [];
		case 'WARMUP':
			return ['READY', 'UNREADY'];
	}
};

const getAvailableCommands = (state: TMatchMapSate): string[] => {
	return getAvailableCommandsEnums(state).reduce(
		(pv: string[], cv: commands.TCommand) => [
			...pv,
			...commands.getUserCommandsByInternalCommand(cv),
		],
		[]
	);
};

const sayAvailableCommands = async (match: Match.Match, matchMap: IMatchMap) => {
	const cmds = getAvailableCommands(matchMap.state);
	if (cmds.length > 0) {
		await Match.say(
			match,
			`COMMANDS: ${cmds.map((cmd) => commands.formatIngameCommand(cmd)).join(', ')}`
		);
	}
};

export const onRoundEnd = async (
	match: Match.Match,
	matchMap: IMatchMap,
	ctScore: number,
	tScore: number,
	winningTeamSide: TTeamSides
) => {
	/** Contains the state without the new score (without the just finished round). */
	const magic = getCurrentTeamSideAndRoundSwitch(matchMap);
	const currentCtTeam = Match.getTeamByAB(match, magic.currentCtTeamAB);
	const currentTTeam = Match.getTeamByAB(match, getOtherTeamAB(magic.currentCtTeamAB));
	const winnerTeamAB = winningTeamSide === 'CT' ? magic.currentCtTeamAB : magic.currentTTeamAB;
	const winnerTeam = Match.getTeamByAB(match, winnerTeamAB);
	const loserTeam = Match.getTeamByAB(match, getOtherTeamAB(winnerTeamAB));
	const winnerScore = winningTeamSide === 'CT' ? ctScore : tScore;
	const loserScore = winningTeamSide === 'CT' ? tScore : ctScore;

	if (matchMap.state === 'KNIFE') {
		matchMap.knifeWinner = winnerTeamAB;
		matchMap.state = 'AFTER_KNIFE';
		MatchService.scheduleSave(match);
		await Match.execRcon(match, 'mp_pause_match');
		await periodicJob(match, matchMap);
		match.log(`${winnerTeamAB} (${winnerTeam.name}) won the knife`);
		Events.onKnifeRoundEnd(match, matchMap, winnerTeam);
		return;
	}

	if (matchMap.state === 'IN_PROGRESS' || matchMap.state === 'PAUSED') {
		matchMap.score.teamA = magic.currentCtTeamAB === 'TEAM_A' ? ctScore : tScore;
		matchMap.score.teamB = magic.currentCtTeamAB === 'TEAM_A' ? tScore : ctScore;
		MatchService.scheduleSave(match);
		await Match.say(match, `${escapeRconString(winnerTeam.name)} SCORED (${winnerScore})`);
		await Match.say(match, `${escapeRconString(loserTeam.name)} (${loserScore})`);
		match.log(`${winnerTeamAB} (${winnerTeam.name}) scored (CT ${ctScore}:${tScore} T)`);
		Events.onRoundEnd(match, matchMap, winnerTeam);
		if (magic.isSideSwitchNextRound) {
			match.log('Switching sides');
			await Match.say(match, 'SWITCHING SIDES');
		}
		await StatsLogger.updateRoundCount(match.data, matchMap);
		return;
	}
};

export const loadMap = async (match: Match.Match, matchMap: IMatchMap, useDefaultDelay = false) => {
	const internalMapName = parseMapParts(matchMap.name).internal;

	const delayInSeconds =
		useDefaultDelay || match.data.currentMap === 0
			? 15
			: Math.max(15, await Match.getMapEndDelayInSeconds(match, 15));

	await Match.say(
		match,
		`MAP WILL BE CHANGED TO ${formatMapName(matchMap.name)} IN ${delayInSeconds} SECONDS`
	);
	match.log(`Change map to ${matchMap.name} (in ${delayInSeconds} seconds)`);
	match.data.state = 'MATCH_MAP';
	matchMap.state = 'MAP_CHANGE';
	MatchService.scheduleSave(match);
	await sleep(delayInSeconds * 1000);

	await Match.setTeamNames(match);

	if (/^\d+$/.test(internalMapName)) {
		// map name consists of numbers only -> assume it's a workshop id
		await Match.execRcon(match, `host_workshop_map ${internalMapName}`);
	} else {
		const response = await Match.execRcon(match, `changelevel ${internalMapName}`);
		if (response.includes('invalid map name')) {
			match.log(`Map ${matchMap.name} could not be found on the server`);
			await Match.say(
				match,
				`${colors.red}MAP ${
					formatMapName(matchMap.name) + colors.red
				} COULD NOT BE FOUND ON THE SERVER`
			);
		}
	}

	matchMap.state = 'WARMUP';
	matchMap.readyTeams.teamA = false;
	matchMap.readyTeams.teamB = false;
	matchMap.knifeRestart.teamA = false;
	matchMap.knifeRestart.teamB = false;
	matchMap.score.teamA = 0;
	matchMap.score.teamB = 0;
	matchMap.knifeWinner = undefined;

	MatchService.scheduleSave(match);
};

const startMatch = async (match: Match.Match, matchMap: IMatchMap) => {
	matchMap.state = 'IN_PROGRESS';
	MatchService.scheduleSave(match);

	match.log('Start match');

	await Match.execRconCommands(match, 'match');
	await Match.execRcon(match, 'mp_unpause_match');
	await Match.execRcon(match, 'mp_restartgame 10');

	await refreshOvertimeAndMaxRoundsSettings(match, matchMap);
	await Match.say(match, 'THE MAP IS LIVE AFTER THE NEXT RESTART!');
	await Match.say(match, 'GL & HF EVERYBODY');

	await sleep(11000);
	await Match.say(match, 'MAP IS LIVE!');
	await Match.say(match, 'MAP IS LIVE!');
	await Match.say(match, 'MAP IS LIVE!');

	Events.onMapStart(match, matchMap);
};

export const parseMapParts = (mapName: string) => {
	if (mapName.indexOf('/') === -1) {
		mapName = mapName + '/' + mapName;
	}
	const parts = mapName.split('/', 2);
	return {
		internal: parts[0] ?? '',
		external: parts[1] ?? '',
	};
};

const refreshOvertimeAndMaxRoundsSettings = async (match: Match.Match, matchMap: IMatchMap) => {
	const overTimeEnabled = (await Match.getConfigVar(match, 'mp_overtime_enable')) === 'true';
	const overTimeMaxRounds = parseInt(await Match.getConfigVar(match, 'mp_overtime_maxrounds'));
	const maxRounds = parseInt(await Match.getConfigVar(match, 'mp_maxrounds'));
	if (
		matchMap.overTimeEnabled !== overTimeEnabled ||
		matchMap.overTimeMaxRounds !== overTimeMaxRounds ||
		matchMap.maxRounds !== maxRounds
	) {
		matchMap.overTimeEnabled = overTimeEnabled;
		matchMap.overTimeMaxRounds = overTimeMaxRounds;
		matchMap.maxRounds = maxRounds;
		match.log(
			`OverTime:${matchMap.overTimeEnabled ? 'on' : 'off'} OverTimeMaxRounds:${
				matchMap.overTimeMaxRounds
			} MaxRounds:${matchMap.maxRounds}`
		);
		MatchService.scheduleSave(match);
	}
};

export const onMapEnd = async (match: Match.Match, matchMap: IMatchMap) => {
	if (matchMap.state !== 'IN_PROGRESS' && matchMap.state !== 'PAUSED') {
		return;
	}

	matchMap.state = 'FINISHED';
	MatchService.scheduleSave(match);
	Events.onMapEnd(match, matchMap);
	const mapNumber = match.data.currentMap + 1;
	const winnerTeamAB = getWinner(matchMap);
	if (!winnerTeamAB) {
		await Match.say(match, `${mapNumber}. MAP FINISHED (DRAW)`);
		match.log(`${mapNumber}. map finished (draw)`);
	} else {
		const winnerTeam = Match.getTeamByAB(match, winnerTeamAB);
		await Match.say(
			match,
			`${mapNumber}. MAP FINISHED (WINNER: ${escapeRconString(winnerTeam.name)})`
		);
		match.log(`${mapNumber}. map finished (winner: ${winnerTeam.name})`);
	}
};

const startKnifeRound = async (match: Match.Match, matchMap: IMatchMap) => {
	matchMap.state = 'KNIFE';
	matchMap.knifeRestart.teamA = false;
	matchMap.knifeRestart.teamB = false;
	matchMap.knifeWinner = undefined;
	MatchService.scheduleSave(match);
	match.log('Start knife round');
	await Match.execRconCommands(match, 'knife');
	await Match.execRcon(match, 'mp_unpause_match');
	await Match.execRcon(match, 'mp_restartgame 3');
	await sleep(4000);
	await Match.say(match, 'KNIFE FOR SIDE');
	await Match.say(match, 'KNIFE FOR SIDE');
	await Match.say(match, 'KNIFE FOR SIDE');
};

const onHelpCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	await sayAvailableCommands(e.match, enrichedEvent.matchMap);
};

const onRestartCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	if (
		enrichedEvent.matchMap.state !== 'KNIFE' &&
		enrichedEvent.matchMap.state !== 'AFTER_KNIFE'
	) {
		return;
	}
	const { match, matchMap, teamAB, player } = enrichedEvent;
	if (teamAB === 'TEAM_A') {
		matchMap.knifeRestart.teamA = true;
	} else {
		matchMap.knifeRestart.teamB = true;
	}

	const team = Match.getTeamByAB(match, teamAB);

	if (
		(matchMap.knifeRestart.teamA && matchMap.knifeRestart.teamB) ||
		matchMap.knifeWinner === teamAB
	) {
		await startKnifeRound(match, matchMap);
	} else {
		await Match.say(match, `${escapeRconString(team.name)} WANTS TO RESTART THE KNIFE ROUND`);
		match.log(`${teamAB} (${team.name} - ${player.name}) wants to restart the knife round`);
		await Match.say(match, `AGREE WITH ${commands.formatFirstIngameCommand('RESTART')}`);
	}

	MatchService.scheduleSave(match);
};

const onReadyCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	if (enrichedEvent.matchMap.state !== 'WARMUP' && enrichedEvent.matchMap.state !== 'PAUSED') {
		return;
	}
	const { match, teamAB, matchMap, player } = enrichedEvent;
	const team = Match.getTeamByAB(match, teamAB);

	if (teamAB === 'TEAM_A') {
		matchMap.readyTeams.teamA = true;
	} else {
		matchMap.readyTeams.teamB = true;
	}

	await Match.say(match, `${escapeRconString(team.name)} IS READY`);
	match.log(`${teamAB} (${team.name} - ${player.name}) is ready`);

	if (matchMap.readyTeams.teamA && matchMap.readyTeams.teamB) {
		if (matchMap.state === 'WARMUP') {
			match.log('End warmup');
			await Match.execRcon(match, 'mp_warmup_end');
			if (matchMap.knifeForSide) {
				await startKnifeRound(match, matchMap);
			} else {
				await startMatch(match, matchMap);
			}
		} else if (matchMap.state === 'PAUSED') {
			match.log('Continue map');
			matchMap.readyTeams.teamA = false;
			matchMap.readyTeams.teamB = false;
			await Match.execRcon(match, 'mp_unpause_match');
			await Match.say(match, 'CONTINUE MAP');
			matchMap.state = 'IN_PROGRESS';
		}
	}

	MatchService.scheduleSave(match);
};

const onUnreadyCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	if (enrichedEvent.matchMap.state !== 'WARMUP' && enrichedEvent.matchMap.state !== 'PAUSED') {
		return;
	}
	const { match, teamAB, matchMap, player } = enrichedEvent;
	const team = Match.getTeamByAB(match, teamAB);
	await Match.say(match, `${escapeRconString(team.name)} IS NOT READY`);
	match.log(`${teamAB} (${team.name} - ${player.name}) is not ready`);
	if (teamAB === 'TEAM_A') {
		matchMap.readyTeams.teamA = false;
	} else {
		matchMap.readyTeams.teamB = false;
	}
	MatchService.scheduleSave(match);
};

const onPauseCommand: commands.CommandHandler = async (e) => {
	const matchMap = Match.getCurrentMatchMap(e.match);
	if (!matchMap || e.match.data.state !== 'MATCH_MAP' || matchMap.state !== 'IN_PROGRESS') {
		return;
	}
	const { match, player } = e;
	if (player.team) {
		const team = Match.getTeamByAB(match, player.team);
		await Match.say(match, `${escapeRconString(team.name)} PAUSED THE MAP`);
		match.log(`${player.team} (${team.name} - ${player.name}) paused the match`);
	} else {
		await Match.say(match, `${escapeRconString(player.name)} PAUSED THE MAP`);
		match.log(`${player.name} paused the match`);
	}
	matchMap.readyTeams.teamA = false;
	matchMap.readyTeams.teamB = false;
	matchMap.state = 'PAUSED';
	MatchService.scheduleSave(match);
	await Match.execRcon(match, 'mp_pause_match');
};

const onTacticalCommand: commands.CommandHandler = async (e) => {
	const matchMap = Match.getCurrentMatchMap(e.match);
	if (!matchMap || e.match.data.state !== 'MATCH_MAP' || matchMap.state !== 'IN_PROGRESS') {
		return;
	}
	const { match, player } = e;
	if (e.teamString !== 'CT' && e.teamString !== 'TERRORIST') {
		await Match.say(
			match,
			`${escapeRconString(player.name)} NEEDS TO BE IN A TEAM TO TAKE A TACTICAL TIMEOUT`
		);
		match.log(`${player.name} needs to be in a team to take a tactical timeout`);
		return;
	}
	const command = e.teamString === 'CT' ? 'timeout_ct_start' : 'timeout_terrorist_start';
	const response = await Match.execRcon(match, command);
	if (response.trim().indexOf('Match pause is enabled') === -1) {
		// could not take tactical pause
		// either one is already requested, or one is in progress or no timeouts are left
		return;
	}
	if (player.team) {
		const team = Match.getTeamByAB(match, player.team);
		await Match.say(match, `${escapeRconString(team.name)} TOOK A TACTICAL TIMEOUT`);
		match.log(`${player.team} (${team.name} - ${player.name}) took a tactical timeout`);
	} else {
		await Match.say(match, `${escapeRconString(player.name)} TOOK A TACTICAL TIMEOUT`);
		match.log(`${player.name} took a tactical timeout`);
	}
};

const onStayCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	const { match, teamAB, matchMap, player } = enrichedEvent;
	if (matchMap.state !== 'AFTER_KNIFE') {
		return;
	}
	if (matchMap.knifeWinner !== teamAB) {
		await sayOnlyKnifeWinner(e.match);
		return;
	}
	const team = Match.getTeamByAB(match, teamAB);
	await Match.say(match, `${escapeRconString(team.name)} WANTS TO STAY`);
	match.log(`${teamAB} (${team.name} - ${player.name}) wants to stay`);
	await startMatch(match, matchMap);
};

const onSwitchCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	const { match, teamAB, matchMap, player } = enrichedEvent;
	if (matchMap.state !== 'AFTER_KNIFE') {
		return;
	}
	if (matchMap.knifeWinner !== teamAB) {
		await sayOnlyKnifeWinner(e.match);
		return;
	}
	const team = Match.getTeamByAB(match, teamAB);
	await Match.say(match, `${escapeRconString(team.name)} WANTS TO SWITCH SIDES`);
	match.log(`${teamAB} (${team.name} - ${player.name}) wants to switch sides`);
	await Match.execRcon(match, 'mp_swapteams');
	match.warnAboutWrongTeam = false; // temporarily disable warning about wrong team, will be set to true again after match start
	matchMap.startAsCtTeam = getOtherTeamAB(matchMap.startAsCtTeam);
	MatchService.scheduleSave(match);
	await startMatch(match, matchMap);
};

const onCtCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	const { teamAB, matchMap } = enrichedEvent;
	if (matchMap.state !== 'AFTER_KNIFE') {
		return;
	}
	if (matchMap.knifeWinner !== teamAB) {
		await sayOnlyKnifeWinner(e.match);
		return;
	}
	if (matchMap.startAsCtTeam === teamAB) {
		await onStayCommand(e);
	} else {
		await onSwitchCommand(e);
	}
};

const onTCommand: commands.CommandHandler = async (e) => {
	const enrichedEvent = await enrichEvent(e);
	if (!enrichedEvent) {
		return;
	}
	const { teamAB, matchMap } = enrichedEvent;
	if (matchMap.state !== 'AFTER_KNIFE') {
		return;
	}
	if (matchMap.knifeWinner !== teamAB) {
		await sayOnlyKnifeWinner(e.match);
		return;
	}
	if (matchMap.startAsCtTeam === teamAB) {
		await onSwitchCommand(e);
	} else {
		await onStayCommand(e);
	}
};

export const registerCommandHandlers = () => {
	commands.registerHandler('HELP', onHelpCommand);
	commands.registerHandler('RESTART', onRestartCommand);
	commands.registerHandler('STAY', onStayCommand);
	commands.registerHandler('SWITCH', onSwitchCommand);
	commands.registerHandler('CT', onCtCommand);
	commands.registerHandler('T', onTCommand);
	commands.registerHandler('READY', onReadyCommand);
	commands.registerHandler('UNREADY', onUnreadyCommand);
	commands.registerHandler('PAUSE', onPauseCommand);
	commands.registerHandler('TACTICAL', onTacticalCommand);
};

const enrichEvent = async (e: commands.CommandEvent) => {
	const currentMatchMap = Match.getCurrentMatchMap(e.match);
	if (!currentMatchMap || e.match.data.state !== 'MATCH_MAP') {
		return;
	}
	if (!e.player.team) {
		await Match.sayNotAssigned(e.match, e.player);
		return;
	}
	return {
		...e,
		matchMap: currentMatchMap,
		teamAB: e.player.team,
	};
};

const sayOnlyKnifeWinner = async (match: Match.Match) => {
	await Match.say(match, 'ONLY THE WINNER OF THE KNIFE ROUND CAN CHOOSE THE SIDE!');
};

/**
 * Returns the winner of a match map.
 * Returns null if map is a draw.
 * Returns undefined if map is no finished, yet.
 */
export const getWinner = (matchMap: IMatchMap) => {
	if (matchMap.state !== 'FINISHED') {
		return undefined;
	}
	if (matchMap.score.teamA === matchMap.score.teamB) {
		return null;
	}
	return matchMap.score.teamA > matchMap.score.teamB ? 'TEAM_A' : 'TEAM_B';
};

export const update = async (
	match: Match.Match,
	matchMap: IMatchMap,
	dto: IMatchMapUpdateDto,
	mapNumber: number
) => {
	if (dto.state && matchMap.state !== dto.state) {
		matchMap.state = dto.state;
		if (matchMap.state === 'PAUSED') {
			matchMap.readyTeams.teamA = false;
			matchMap.readyTeams.teamB = false;
			await Match.execRcon(match, 'mp_pause_match');
		}
	}

	if (dto.name && matchMap.name !== dto.name) {
		matchMap.name = dto.name;
		if (match.data.currentMap === mapNumber) {
			await loadMap(match, matchMap, true);
		}
	}

	if (dto.knifeForSide !== undefined) {
		matchMap.knifeForSide = dto.knifeForSide;
	}

	if (dto.startAsCtTeam) {
		matchMap.startAsCtTeam = dto.startAsCtTeam;
	}

	if (dto.score) {
		matchMap.score = dto.score;
	}

	if (dto._refreshOvertimeAndMaxRoundsSettings) {
		await refreshOvertimeAndMaxRoundsSettings(match, matchMap);
	}

	if (dto._switchTeamInternals) {
		matchMap.startAsCtTeam = getOtherTeamAB(matchMap.startAsCtTeam);
		matchMap.score = {
			teamA: matchMap.score.teamB,
			teamB: matchMap.score.teamA,
		};
		await Match.setTeamNames(match);
	}

	MatchService.scheduleSave(match);
};
