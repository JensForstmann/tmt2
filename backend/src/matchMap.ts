import {
	escapeRconString,
	getCurrentTeamSideAndRoundSwitch,
	getOtherTeamAB,
	IMatchMap,
	IMatchMapUpdateDto,
	IPlayer,
	sleep,
	TMatchMapSate,
	TTeamAB,
	TTeamSides,
} from '../../common';
import { ECommand, getCommands } from './commands';
import * as Events from './events';
import * as Match from './match';
import * as MatchService from './matchService';
import { Settings } from './settings';

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

export const sayPeriodicMessage = async (match: Match.Match, matchMap: IMatchMap) => {
	if (matchMap.state === 'WARMUP') {
		await Match.execRcon(match, 'mp_warmuptime 600');
		await Match.execRcon(match, 'mp_warmup_pausetimer 1');
		await Match.execRcon(match, 'mp_autokick 0');
	}

	switch (matchMap.state) {
		case 'IN_PROGRESS':
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
			break;
	}

	await sayAvailableCommands(match, matchMap);
};

const getAvailableCommandsEnums = (state: TMatchMapSate): ECommand[] => {
	switch (state) {
		case 'AFTER_KNIFE':
			return [ECommand.RESTART, ECommand.CT, ECommand.T, ECommand.STAY, ECommand.SWITCH];
		case 'FINISHED':
			return [];
		case 'IN_PROGRESS':
			return [ECommand.PAUSE];
		case 'KNIFE':
			return [ECommand.RESTART];
		case 'MAP_CHANGE':
			return [];
		case 'PAUSED':
			return [ECommand.READY, ECommand.UNREADY];
		case 'PENDING':
			return [];
		case 'WARMUP':
			return [ECommand.READY, ECommand.UNREADY];
	}
};

const getAvailableCommands = (state: TMatchMapSate): string[] => {
	return getAvailableCommandsEnums(state).reduce(
		(pv: string[], cv: ECommand) => [...pv, ...getCommands(cv)],
		[]
	);
};

const sayAvailableCommands = async (match: Match.Match, matchMap: IMatchMap) => {
	const commands = getAvailableCommands(matchMap.state);
	if (commands.length > 0) {
		await Match.say(
			match,
			`COMMANDS: ${commands.map((c) => Settings.COMMAND_PREFIXES[0] + c).join(', ')}`
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
		await sayPeriodicMessage(match, matchMap);
		Events.onKnifeRoundEnd(match, matchMap, winnerTeam);
		return;
	}

	if (matchMap.state === 'IN_PROGRESS' || matchMap.state === 'PAUSED') {
		matchMap.score.teamA = magic.currentCtTeamAB === 'TEAM_A' ? ctScore : tScore;
		matchMap.score.teamB = magic.currentCtTeamAB === 'TEAM_A' ? tScore : ctScore;
		MatchService.scheduleSave(match);
		await Match.say(match, `${escapeRconString(winnerTeam.name)} SCORED (${winnerScore})`);
		await Match.say(match, `${escapeRconString(loserTeam.name)} (${loserScore})`);
		Events.onRoundEnd(match, matchMap, winnerTeam);
		if (magic.isSideSwitchNextRound) {
			await Match.say(match, 'SWITCHING SIDES');
		}
		return;
	}
};

export const loadMap = async (match: Match.Match, matchMap: IMatchMap) => {
	await Match.say(match, `MAP WILL BE CHANGED TO ${matchMap.name} IN 10 SECONDS`);
	const response = await Match.execRcon(match, `maps ${matchMap.name}`);
	if (!response.includes(` ${matchMap.name}.bsp`)) {
		match.log(`Map ${matchMap.name} could not be found on the server`);
		await Match.say(match, `Map ${matchMap.name} could not be found on the server`);
		return;
	}
	match.data.state = 'MATCH_MAP';
	matchMap.state = 'MAP_CHANGE';
	await sleep(10000);

	await Match.setTeamNames(match);
	await Match.execRcon(match, `changelevel ${matchMap.name}`);

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

	await Match.execManyRcon(match, match.data.rconCommands.match);
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

const refreshOvertimeAndMaxRoundsSettings = async (match: Match.Match, matchMap: IMatchMap) => {
	matchMap.overTimeEnabled = (await Match.getConfigVar(match, 'mp_overtime_enable')) === '1';
	matchMap.overTimeMaxRounds = parseInt(await Match.getConfigVar(match, 'mp_overtime_maxrounds'));
	matchMap.maxRounds = parseInt(await Match.getConfigVar(match, 'mp_maxrounds'));
	MatchService.scheduleSave(match);
};

export const onMapEnd = async (match: Match.Match, matchMap: IMatchMap) => {
	if (matchMap.state === 'IN_PROGRESS' || matchMap.state === 'PAUSED') {
		matchMap.state = 'FINISHED';
		MatchService.scheduleSave(match);
		await Match.say(match, 'MAP FINISHED');
		Events.onMapEnd(match, matchMap);
	}
};

const startKnifeRound = async (match: Match.Match, matchMap: IMatchMap) => {
	matchMap.state = 'KNIFE';
	matchMap.knifeRestart.teamA = false;
	matchMap.knifeRestart.teamB = false;
	matchMap.knifeWinner = undefined;
	MatchService.scheduleSave(match);
	await Match.execManyRcon(match, match.data.rconCommands.knife);
	await Match.execRcon(match, 'mp_restartgame 3');
	await sleep(4000);
	await Match.say(match, 'KNIFE FOR SIDE');
	await Match.say(match, 'KNIFE FOR SIDE');
	await Match.say(match, 'KNIFE FOR SIDE');
};

const restartKnifeCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	if (teamAB === 'TEAM_A') {
		matchMap.knifeRestart.teamA = true;
	} else {
		matchMap.knifeRestart.teamB = true;
	}

	if (
		(matchMap.knifeRestart.teamA && matchMap.knifeRestart.teamB) ||
		matchMap.knifeWinner === teamAB
	) {
		await startKnifeRound(match, matchMap);
	} else {
		await Match.say(
			match,
			`${escapeRconString(
				Match.getTeamByAB(match, teamAB).name
			)} WANTS TO RESTART THE KNIFE ROUND`
		);
		await Match.say(match, `AGREE WITH ${getCommands(ECommand.RESTART)}`);
	}

	MatchService.scheduleSave(match);
};

const readyCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	if (teamAB === 'TEAM_A') {
		matchMap.readyTeams.teamA = true;
	} else {
		matchMap.readyTeams.teamB = true;
	}

	await Match.say(match, `${escapeRconString(Match.getTeamByAB(match, teamAB).name)} IS READY`);

	if (matchMap.readyTeams.teamA && matchMap.readyTeams.teamB) {
		if (matchMap.state === 'WARMUP') {
			await Match.execRcon(match, 'mp_warmup_end');
			if (matchMap.knifeForSide) {
				await startKnifeRound(match, matchMap);
			} else {
				await startMatch(match, matchMap);
			}
		} else if (matchMap.state === 'PAUSED') {
			matchMap.readyTeams.teamA = false;
			matchMap.readyTeams.teamB = false;
			await Match.execRcon(match, 'mp_unpause_match');
			await Match.say(match, 'CONTINUE MAP');
			matchMap.state = 'IN_PROGRESS';
		}
	}

	MatchService.scheduleSave(match);
};

const unreadyCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} IS NOT READY`
	);
	if (teamAB === 'TEAM_A') {
		matchMap.readyTeams.teamA = false;
	} else {
		matchMap.readyTeams.teamB = false;
	}
	MatchService.scheduleSave(match);
};

const pauseCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} PAUSED THE MAP`
	);
	matchMap.readyTeams.teamA = false;
	matchMap.readyTeams.teamB = false;
	matchMap.state = 'PAUSED';
	MatchService.scheduleSave(match);
	await Match.execRcon(match, 'mp_pause_match');
};

const stayCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} WANTS TO STAY`
	);
	await startMatch(match, matchMap);
};

const switchCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} WANTS TO SWITCH SIDES`
	);
	await Match.execRcon(match, 'mp_swapteams');
	matchMap.startAsCtTeam = getOtherTeamAB(matchMap.startAsCtTeam);
	MatchService.scheduleSave(match);
	await startMatch(match, matchMap);
};

const ctCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	if (matchMap.startAsCtTeam === teamAB) {
		await stayCommand(match, matchMap, teamAB);
	} else {
		await switchCommand(match, matchMap, teamAB);
	}
};

const tCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: TTeamAB) => {
	if (matchMap.startAsCtTeam === teamAB) {
		await switchCommand(match, matchMap, teamAB);
	} else {
		await stayCommand(match, matchMap, teamAB);
	}
};

export const onCommand = async (
	match: Match.Match,
	matchMap: IMatchMap,
	command: ECommand,
	teamAB: TTeamAB,
	player: IPlayer
) => {
	if (command === ECommand.HELP) {
		await sayAvailableCommands(match, matchMap);
	} else if (!getAvailableCommandsEnums(matchMap.state).includes(command)) {
		await Match.say(match, `COMMAND CURRENTLY NO AVAILABLE`);
		await sayAvailableCommands(match, matchMap);
	} else if (matchMap.state === 'KNIFE') {
		switch (command) {
			case ECommand.RESTART:
				await restartKnifeCommand(match, matchMap, teamAB);
				break;
		}
	} else if (matchMap.state === 'AFTER_KNIFE') {
		if (matchMap.knifeWinner === teamAB) {
			switch (command) {
				case ECommand.STAY:
					await stayCommand(match, matchMap, teamAB);
					break;
				case ECommand.SWITCH:
					await switchCommand(match, matchMap, teamAB);
					break;
				case ECommand.CT:
					await ctCommand(match, matchMap, teamAB);
					break;
				case ECommand.T:
					await tCommand(match, matchMap, teamAB);
					break;
				case ECommand.RESTART:
					await restartKnifeCommand(match, matchMap, teamAB);
					break;
			}
		} else {
			await Match.say(match, `ONLY THE WINNER OF THE KNIFE ROUND CAN CHOOSE THE SIDE!`);
		}
	} else if (matchMap.state === 'WARMUP') {
		switch (command) {
			case ECommand.READY:
				await readyCommand(match, matchMap, teamAB);
				break;
			case ECommand.UNREADY:
				await unreadyCommand(match, matchMap, teamAB);
				break;
		}
	} else if (matchMap.state === 'IN_PROGRESS') {
		switch (command) {
			case ECommand.PAUSE:
				await pauseCommand(match, matchMap, teamAB);
				break;
		}
	} else if (matchMap.state === 'PAUSED') {
		switch (command) {
			case ECommand.READY:
				await readyCommand(match, matchMap, teamAB);
				break;
		}
	}
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
			await loadMap(match, matchMap);
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
