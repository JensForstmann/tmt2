import { ECommand, getCommands } from './commands';
import { Settings } from './settings';
import { escapeRconString, sleep } from './utils';
import { EMatchMapSate, ETeamAB, getOtherTeamAB, IMatchMap } from './interfaces/matchMap';
import * as Match from './match';
import { ETeamSides } from './interfaces/stuff';
import * as Webhook from './webhook';
import { IPlayer } from './interfaces/player';

export const create = (
	map: string,
	knifeForSide: boolean,
	startAsCtTeam: ETeamAB = ETeamAB.TEAM_A
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
		state: EMatchMapSate.PENDING,
	};
};

export const sayPeriodicMessage = async (match: Match.Match, matchMap: IMatchMap) => {
	if (matchMap.state === EMatchMapSate.WARMUP) {
		await Match.execRcon(match, 'mp_warmuptime 600');
		await Match.execRcon(match, 'mp_warmup_pausetimer 1');
		await Match.execRcon(match, 'mp_autokick 0');
	}

	// TODO: More ingame chat about what must be done (state & commands)
	switch (matchMap.state) {
		case EMatchMapSate.IN_PROGRESS:
			break;
		case EMatchMapSate.AFTER_KNIFE:
		case EMatchMapSate.FINISHED:
		case EMatchMapSate.KNIFE:
		case EMatchMapSate.MAP_CHANGE:
		case EMatchMapSate.PAUSED:
		case EMatchMapSate.PENDING:
		case EMatchMapSate.WARMUP:
			await sayAvailableCommands(match, matchMap);
			break;
	}
};

const getAvailableCommands = (state: EMatchMapSate): string[] => {
	switch (state) {
		case EMatchMapSate.AFTER_KNIFE:
			return [
				...getCommands(ECommand.RESTART),
				...getCommands(ECommand.CT),
				...getCommands(ECommand.T),
				...getCommands(ECommand.STAY),
				...getCommands(ECommand.SWITCH),
			];
		case EMatchMapSate.FINISHED:
			return [];
		case EMatchMapSate.IN_PROGRESS:
			return getCommands(ECommand.PAUSE);
		case EMatchMapSate.KNIFE:
			return getCommands(ECommand.RESTART);
		case EMatchMapSate.MAP_CHANGE:
			return [];
		case EMatchMapSate.PAUSED:
			return [...getCommands(ECommand.READY), ...getCommands(ECommand.UNREADY)];
		case EMatchMapSate.PENDING:
			return [];
		case EMatchMapSate.WARMUP:
			return [...getCommands(ECommand.READY), ...getCommands(ECommand.UNREADY)];
	}
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

export const getCurrentTeamSideAndRoundSwitch = (matchMap: IMatchMap) => {
	const roundsPlayed = matchMap.score.teamA + matchMap.score.teamB;
	const maxRounds = matchMap.maxRounds;
	const overTimeEnabled = matchMap.overTimeEnabled;
	const overTimeMaxRounds = matchMap.overTimeMaxRounds;

	let currentCtTeamAB = matchMap.startAsCtTeam;
	let isSideSwitchRound = false;

	for (let roundCounter = 1; roundCounter <= roundsPlayed; roundCounter++) {
		isSideSwitchRound = isSideSwitch(
			roundCounter,
			maxRounds,
			overTimeEnabled,
			overTimeMaxRounds
		);
		if (isSideSwitchRound) {
			currentCtTeamAB = getOtherTeamAB(currentCtTeamAB);
		}
	}

	let isSideSwitchNextRound = isSideSwitch(
		roundsPlayed + 1,
		maxRounds,
		overTimeEnabled,
		overTimeMaxRounds
	);

	return {
		currentCtTeamAB: currentCtTeamAB,
		currentTTeamAB: getOtherTeamAB(currentCtTeamAB),
		// isSideSwitchRound: isSideSwitchRound,
		isSideSwitchNextRound: isSideSwitchNextRound,
	};
};

const isSideSwitch = (
	roundsPlayed: number,
	maxRounds: number,
	overTimeEnabled: boolean,
	overTimeMaxRounds: number
) => {
	const overtimeNumber = getOvertimeNumber(
		roundsPlayed,
		maxRounds,
		overTimeEnabled,
		overTimeMaxRounds
	);
	const otHalftime = maxRounds + (Math.max(1, overtimeNumber) - 0.5) * overTimeMaxRounds;
	return roundsPlayed === maxRounds / 2 || roundsPlayed === Math.floor(otHalftime);
};

const getOvertimeNumber = (
	roundsPlayed: number,
	maxRounds: number,
	overTimeEnabled: boolean,
	overTimeMaxRounds: number
) => {
	if (overTimeMaxRounds <= 0 || overTimeEnabled === false) {
		return 0;
	}
	return Math.max(0, Math.ceil((roundsPlayed - maxRounds) / overTimeMaxRounds));
};

export const onRoundEnd = async (
	match: Match.Match,
	matchMap: IMatchMap,
	ctScore: number,
	tScore: number,
	winningTeamSide: ETeamSides
) => {
	/** Contains the state without the new score (without the just finished round). */
	const magic = getCurrentTeamSideAndRoundSwitch(matchMap);
	const currentCtTeam = Match.getTeamByAB(match, magic.currentCtTeamAB);
	const currentTTeam = Match.getOtherTeam(match, currentCtTeam);
	const winnerTeamAB =
		winningTeamSide === ETeamSides.CT ? magic.currentCtTeamAB : magic.currentTTeamAB;
	const winnerTeam = Match.getTeamByAB(match, winnerTeamAB);
	const loserTeam = Match.getOtherTeam(match, winnerTeam);
	const winnerScore = winningTeamSide === ETeamSides.CT ? ctScore : tScore;
	const loserScore = winningTeamSide === ETeamSides.CT ? tScore : ctScore;

	if (matchMap.state === EMatchMapSate.KNIFE) {
		matchMap.knifeWinner = winnerTeamAB;
		matchMap.state = EMatchMapSate.AFTER_KNIFE;
		await Match.execRcon(match, 'mp_pause_match');
		await Match.say(match, `${escapeRconString(winnerTeam.name)} WON THE KNIFE`);
		await sayPeriodicMessage(match, matchMap);
		Webhook.onKnifeRoundEnd(match, matchMap, winnerTeam);
		return;
	}

	if (matchMap.state === EMatchMapSate.IN_PROGRESS || matchMap.state === EMatchMapSate.PAUSED) {
		matchMap.score.teamA = magic.currentCtTeamAB === ETeamAB.TEAM_A ? ctScore : tScore;
		matchMap.score.teamB = magic.currentCtTeamAB === ETeamAB.TEAM_A ? tScore : ctScore;

		await Match.say(match, `${escapeRconString(winnerTeam.name)} SCORED (${winnerScore})`);
		await Match.say(match, `${escapeRconString(loserTeam.name)} (${loserScore})`);
		Webhook.onRoundEnd(match, matchMap, winnerTeam);
		if (magic.isSideSwitchNextRound) {
			await Match.say(match, 'SWITCHING SIDES');
		}
		return;
	}
};

export const loadMap = async (match: Match.Match, matchMap: IMatchMap) => {
	await Match.say(match, `MAP WILL BE CHANGED TO ${matchMap.name} IN 10 SECONDS`);
	matchMap.state = EMatchMapSate.MAP_CHANGE;
	await sleep(10000);

	await setTeamNames(match, matchMap);
	await Match.execRcon(match, `changelevel ${matchMap.name}`);
	matchMap.state = EMatchMapSate.WARMUP;

	matchMap.readyTeams.teamA = false;
	matchMap.readyTeams.teamB = false;
	matchMap.knifeRestart.teamA = false;
	matchMap.knifeRestart.teamB = false;
	matchMap.score.teamA = 0;
	matchMap.score.teamB = 0;

	matchMap.knifeWinner = undefined;
};

// TODO: duplicate code here and in match
const setTeamNames = async (match: Match.Match, matchMap: IMatchMap) => {
	const team1 = Match.getTeamByAB(match, matchMap.startAsCtTeam);
	const team2 = Match.getOtherTeam(match, team1);
	await Match.execRcon(match, `mp_teamname_1 "${escapeRconString(team1.name)}"`);
	await Match.execRcon(match, `mp_teamname_2 "${escapeRconString(team2.name)}"`);
};

const startMatch = async (match: Match.Match, matchMap: IMatchMap) => {
	matchMap.state = EMatchMapSate.IN_PROGRESS;
	await Match.execManyRcon(match, match.data.rconCommands?.match);
	await Match.execRcon(match, 'mp_unpause_match');
	await Match.execRcon(match, 'mp_restartgame 10');

	await refreshOvertimeAndMaxRoundsSettings(match, matchMap);
	await Match.say(match, 'THE MAP IS LIVE AFTER THE NEXT RESTART!');
	await Match.say(match, 'GL & HF EVERYBODY');

	await sleep(11000);
	await Match.say(match, 'MAP IS LIVE!');
	await Match.say(match, 'MAP IS LIVE!');
	await Match.say(match, 'MAP IS LIVE!');
};

const refreshOvertimeAndMaxRoundsSettings = async (match: Match.Match, matchMap: IMatchMap) => {
	matchMap.overTimeEnabled = (await getConfigVar(match, 'mp_overtime_enable')) === '1';
	matchMap.overTimeMaxRounds = parseInt(await getConfigVar(match, 'mp_overtime_maxrounds'));
	matchMap.maxRounds = parseInt(await getConfigVar(match, 'mp_maxrounds'));
};

const getConfigVar = async (match: Match.Match, configVar: string): Promise<string> => {
	const response = await Match.execRcon(match, configVar);
	const configVarPattern = new RegExp(`^"${configVar}" = "(.*?)"`);
	const configVarMatch = response.match(configVarPattern);
	if (configVarMatch) {
		return configVarMatch[1];
	}
	return '';
};

export const onMapEnd = async (match: Match.Match, matchMap: IMatchMap) => {
	if (matchMap.state === EMatchMapSate.IN_PROGRESS) {
		matchMap.state = EMatchMapSate.FINISHED;
		await Match.say(match, 'MAP FINISHED');
		Webhook.onMapEnd(match, matchMap);
	} else if (matchMap.state === EMatchMapSate.PAUSED) {
		// TODO: What to do if !pause was called on last round?
	}
};

const startKnifeRound = async (match: Match.Match, matchMap: IMatchMap) => {
	matchMap.state = EMatchMapSate.KNIFE;
	matchMap.knifeRestart.teamA = false;
	matchMap.knifeRestart.teamB = false;
	matchMap.knifeWinner = undefined;
	await Match.execManyRcon(match, match.data.rconCommands?.knife);
	await Match.execRcon(match, 'mp_restartgame 3');
	await sleep(4000);
	await Match.say(match, 'KNIFE FOR SIDE');
	await Match.say(match, 'KNIFE FOR SIDE');
	await Match.say(match, 'KNIFE FOR SIDE');
};

const restartKnifeCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
	if (teamAB === ETeamAB.TEAM_A) {
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
};

const readyCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
	if (teamAB === ETeamAB.TEAM_A) {
		matchMap.readyTeams.teamA = true;
	} else {
		matchMap.readyTeams.teamB = true;
	}

	await Match.say(match, `${escapeRconString(Match.getTeamByAB(match, teamAB).name)} IS READY`);

	if (matchMap.readyTeams.teamA && matchMap.readyTeams.teamB) {
		if (matchMap.state === EMatchMapSate.WARMUP) {
			await Match.execRcon(match, 'mp_warmup_end');
			if (matchMap.knifeForSide) {
				await startKnifeRound(match, matchMap);
			} else {
				await startMatch(match, matchMap);
			}
		} else if (matchMap.state === EMatchMapSate.PAUSED) {
			matchMap.readyTeams.teamA = false;
			matchMap.readyTeams.teamB = false;
			await Match.execRcon(match, 'mp_unpause_match');
			await Match.say(match, 'CONTINUE MAP');
			matchMap.state = EMatchMapSate.IN_PROGRESS;
		}
	}
};

const unreadyCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} IS NOT READY`
	);
	if (teamAB === ETeamAB.TEAM_A) {
		matchMap.readyTeams.teamA = false;
	} else {
		matchMap.readyTeams.teamB = false;
	}
};

const pauseCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} PAUSED THE MAP`
	);
	matchMap.readyTeams.teamA = false;
	matchMap.readyTeams.teamB = false;
	matchMap.state = EMatchMapSate.PAUSED;
	await Match.execRcon(match, 'mp_pause_match');
};

const stayCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} WANTS TO STAY`
	);
	await startMatch(match, matchMap);
};

const switchCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
	await Match.say(
		match,
		`${escapeRconString(Match.getTeamByAB(match, teamAB).name)} WANTS TO SWITCH SIDES`
	);
	await Match.execRcon(match, 'mp_swapteams');
	matchMap.startAsCtTeam = getOtherTeamAB(matchMap.startAsCtTeam);
	await startMatch(match, matchMap);
};

const ctCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
	if (matchMap.startAsCtTeam === teamAB) {
		await stayCommand(match, matchMap, teamAB);
	} else {
		await switchCommand(match, matchMap, teamAB);
	}
};

const tCommand = async (match: Match.Match, matchMap: IMatchMap, teamAB: ETeamAB) => {
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
	teamAB: ETeamAB,
	player: IPlayer
) => {
	if (command === ECommand.HELP) {
		await sayAvailableCommands(match, matchMap);
	} else if (matchMap.state === EMatchMapSate.KNIFE) {
		switch (command) {
			case ECommand.RESTART:
				await restartKnifeCommand(match, matchMap, teamAB);
				break;
		}
	} else if (matchMap.state === EMatchMapSate.AFTER_KNIFE) {
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
			await Match.say(match, `ONLY THE WINNER OF THE KNIFE ROUND CAN CHOSE THE SIDE!`);
		}
	} else if (matchMap.state === EMatchMapSate.WARMUP) {
		switch (command) {
			case ECommand.READY:
				await readyCommand(match, matchMap, teamAB);
				break;
			case ECommand.UNREADY:
				await unreadyCommand(match, matchMap, teamAB);
				break;
		}
	} else if (matchMap.state === EMatchMapSate.IN_PROGRESS) {
		switch (command) {
			case ECommand.PAUSE:
				await pauseCommand(match, matchMap, teamAB);
				break;
		}
	} else if (matchMap.state === EMatchMapSate.PAUSED) {
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
	if (matchMap.state !== EMatchMapSate.FINISHED) {
		return undefined;
	}
	if (matchMap.score.teamA === matchMap.score.teamB) {
		return null;
	}
	return matchMap.score.teamA > matchMap.score.teamB ? ETeamAB.TEAM_A : ETeamAB.TEAM_B;
};

// TODO: Implement match map change handler

/*
function change(change: IMatchMapChange) {
	if (change.name && change.name !== this.name) {
		this.name = change.name;
		if (this.match.getCurrentMatchMap() === this) {
			this.loadMap();
		}
	}

	if (typeof change.knifeForSide === 'boolean') {
		this.knifeForSide = change.knifeForSide;
	}

	if (change.startAsCtTeam) {
		if (change.startAsCtTeam === 'teamA') {
			this.startAsCtTeam = this.match.teamA;
			this.startAsTTeam = this.match.teamB;
		} else {
			this.startAsCtTeam = this.match.teamB;
			this.startAsTTeam = this.match.teamA;
		}
	}

	if (change.state && change.state !== this.state) {
		this.state = change.state; // TODO what else to do?
	}

	if (change.knifeWinner) {
		if (change.knifeWinner === 'teamA') {
			this.knifeWinner = this.match.teamA;
		} else {
			this.knifeWinner = this.match.teamB;
		}
	}

	if (change.score) {
		if (change.score.teamA) {
			this.score.teamA = change.score.teamA;
		}
		if (change.score.teamB) {
			this.score.teamB = change.score.teamB;
		}
	}

	if (change.refreshOvertimeAndMaxRoundsSettings) {
		this.refreshOvertimeAndMaxRoundsSettings();
	}
}
*/
