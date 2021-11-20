import { getCommands, ECommand } from './commands';
import * as MatchMap from './matchMap';
import * as Match from './match';
import * as MatchService from './matchService';
import { escapeRconString } from './utils';
import { EElectionState, EStep, IElection } from './interfaces/election';
import { Settings } from './settings';
import {
	EMapMode,
	ESideFixed,
	ESideMode,
	EWho,
	IElectionStep,
	IElectionStepAdd,
	IElectionStepSkip,
	isElectionStepAdd,
	isElectionStepSkip,
} from './interfaces/electionStep';
import { ETeamAB, getOtherTeamAB } from './interfaces/matchMap';
import { EMatchSate } from './interfaces/match';

/**
 * @throws if configuration is invalid
 */
export const create = (
	mapPool: string[],
	steps: Array<IElectionStepAdd | IElectionStepSkip>
): IElection => {
	if (!isValidConfiguration(mapPool, steps)) {
		throw 'Combination of map pool and election steps is invalid (too few maps in map pool for these election steps).';
	}
	return {
		state: EElectionState.NOT_STARTED,
		currentStep: 0,
		currentSubStep: EStep.MAP,
		teamX: undefined,
		teamY: undefined,
		remainingMaps: mapPool.map((map) => map.toLowerCase()),
		currentStepMap: undefined,
		currentAgree: {
			teamA: null,
			teamB: null,
		},
		currentRestart: {
			teamA: false,
			teamB: false,
		},
	};
};

const isValidConfiguration = (
	mapPool: string[],
	steps: Array<IElectionStepAdd | IElectionStepSkip>
): boolean => {
	const stepsWhichRemovesAMapFromMapPool = steps.filter((step): boolean => {
		switch (step.map.mode) {
			case EMapMode.PICK:
			case EMapMode.RANDOM_PICK:
			case EMapMode.AGREE:
			case EMapMode.BAN:
			case EMapMode.RANDOM_BAN:
				return true;
			case EMapMode.FIXED:
				return false;
		}
	});

	return stepsWhichRemovesAMapFromMapPool.length <= mapPool.length;
};

const getAvailableCommands = (match: Match.Match, currentElectionStep: IElectionStep): string[] => {
	if (match.data.election.state === EElectionState.FINISHED) {
		return [];
	}
	if (match.data.election.currentSubStep === EStep.MAP) {
		switch (currentElectionStep.map.mode) {
			case EMapMode.AGREE:
				return [
					...getCommands(ECommand.AGREE),
					...getCommands(ECommand.PICK),
					...getCommands(ECommand.RESTART),
				];
			case EMapMode.BAN:
				return [...getCommands(ECommand.BAN), ...getCommands(ECommand.RESTART)];
			case EMapMode.PICK:
				return [...getCommands(ECommand.PICK), ...getCommands(ECommand.RESTART)];
		}
	}
	if (
		match.data.election.currentSubStep === EStep.SIDE &&
		isElectionStepAdd(currentElectionStep)
	) {
		switch (currentElectionStep.side.mode) {
			case ESideMode.PICK:
				return [
					...getCommands(ECommand.T),
					...getCommands(ECommand.CT),
					...getCommands(ECommand.RESTART),
				];
		}
	}
	return [];
};

const getCurrentElectionStep = (match: Match.Match): IElectionStep | undefined => {
	return match.data.electionSteps[match.data.election.currentStep];
};

export const sayPeriodicMessage = async (match: Match.Match) => {
	await Match.execRcon(match, 'mp_warmuptime 600');
	await Match.execRcon(match, 'mp_warmup_pausetimer 1');
	await Match.execRcon(match, 'mp_autokick 0');

	if (
		match.data.election.state === EElectionState.IN_PROGRESS ||
		match.data.election.state === EElectionState.NOT_STARTED
	) {
		const currentElectionStep = getCurrentElectionStep(match);
		if (!currentElectionStep) {
			await Match.say(match, `ELECTION PROCESS BROKEN?`);
			match.log(`Error: No currentElectionStep, election process broken?`);
		} else {
			await sayAvailableCommands(match, currentElectionStep);
			await sayWhatIsUp(match);
		}
	}
};

const sayAvailableCommands = async (match: Match.Match, currentElectionStep: IElectionStep) => {
	const commands = getAvailableCommands(match, currentElectionStep);
	if (commands.length > 0) {
		await Match.say(
			match,
			`COMMANDS: ${commands.map((c) => Settings.COMMAND_PREFIXES[0] + c).join(', ')}`
		);
	}
};

const sayWhatIsUp = async (match: Match.Match) => {
	const currentElectionStep = getCurrentElectionStep(match);
	if (!currentElectionStep) return;

	if (match.data.election.currentSubStep === EStep.MAP) {
		if (currentElectionStep.map.mode === EMapMode.AGREE) {
			await Match.say(
				match,
				`BOTH TEAMS MUST ${Settings.COMMAND_PREFIXES[0]}${getCommands(
					ECommand.AGREE
				)} ON THE SAME MAP`
			);
			if (match.data.election.currentAgree.teamA)
				await Match.say(
					match,
					`TEAM ${escapeRconString(match.data.teamA.name)} WANTS TO PLAY ${
						match.data.election.currentAgree.teamA
					}`
				);
			if (match.data.election.currentAgree.teamB)
				await Match.say(
					match,
					`TEAM ${escapeRconString(match.data.teamB.name)} WANTS TO PLAY ${
						match.data.election.currentAgree.teamB
					}`
				);
			await sayAvailableMaps(match);
		} else if (currentElectionStep.map.mode === EMapMode.BAN) {
			const validTeam = getValidTeamAB(match, currentElectionStep.map.who);
			if (validTeam)
				await Match.say(
					match,
					`TEAM ${escapeRconString(Match.getTeamByAB(match, validTeam).name)} MUST ${
						Settings.COMMAND_PREFIXES[0]
					}${getCommands(ECommand.BAN)} A MAP`
				);
			if (!validTeam)
				await Match.say(
					match,
					`BOTH TEAMS CAN START TO ${Settings.COMMAND_PREFIXES[0]}${getCommands(
						ECommand.BAN
					)} A MAP`
				);
			await sayAvailableMaps(match);
		} else if (currentElectionStep.map.mode === EMapMode.PICK) {
			const validTeam = getValidTeamAB(match, currentElectionStep.map.who);
			if (validTeam)
				await Match.say(
					match,
					`TEAM ${escapeRconString(Match.getTeamByAB(match, validTeam).name)} MUST ${
						Settings.COMMAND_PREFIXES[0]
					}${getCommands(ECommand.PICK)} A MAP`
				);
			if (!validTeam)
				await Match.say(
					match,
					`BOTH TEAMS CAN START TO ${Settings.COMMAND_PREFIXES[0]}${getCommands(
						ECommand.PICK
					)} A MAP`
				);
			await sayAvailableMaps(match);
		}
	} else {
		if (
			isElectionStepAdd(currentElectionStep) &&
			currentElectionStep.side.mode === ESideMode.PICK
		) {
			const validTeam = getValidTeamAB(match, currentElectionStep.side.who);
			if (validTeam)
				await Match.say(
					match,
					`TEAM ${escapeRconString(
						Match.getTeamByAB(match, validTeam).name
					)} MUST CHOOSE A SIDE FOR MAP ${match.data.election.currentStepMap} (${
						Settings.COMMAND_PREFIXES[0]
					}${getCommands(ECommand.CT)[0]}, ${Settings.COMMAND_PREFIXES[0]}${
						getCommands(ECommand.T)[0]
					})`
				);
			if (!validTeam)
				await Match.say(
					match,
					`BOTH TEAMS CAN START TO CHOOSE A SIDE FOR MAP ${
						match.data.election.currentStepMap
					} (${Settings.COMMAND_PREFIXES[0]}${getCommands(ECommand.CT)[0]}, ${
						Settings.COMMAND_PREFIXES[0]
					}${getCommands(ECommand.T)[0]})`
				);
		}
	}
};

const sayAvailableMaps = async (match: Match.Match) => {
	await Match.say(match, `AVAILABLE MAPS: ${match.data.election.remainingMaps.join(', ')}`);
};

export const onCommand = async (
	match: Match.Match,
	command: ECommand,
	teamAB: ETeamAB,
	parameters: string[]
) => {
	if (
		match.data.state === EMatchSate.ELECTION &&
		(match.data.election.state === EElectionState.IN_PROGRESS ||
			match.data.election.state === EElectionState.NOT_STARTED)
	) {
		const map = (parameters[0] || '').toLowerCase();
		const currentElectionStep = getCurrentElectionStep(match);
		if (currentElectionStep) {
			switch (command) {
				case ECommand.AGREE:
					await agreeCommand(match, currentElectionStep, teamAB, map);
					break;
				case ECommand.BAN:
					await banCommand(match, currentElectionStep, teamAB, map);
					break;
				case ECommand.PICK:
					await pickCommand(match, currentElectionStep, teamAB, map);
					break;
				case ECommand.CT:
					await ctCommand(match, currentElectionStep, teamAB);
					break;
				case ECommand.T:
					await tCommand(match, currentElectionStep, teamAB);
					break;
				case ECommand.RESTART:
					await restartCommand(match, currentElectionStep, teamAB);
					break;
				case ECommand.HELP:
					await sayAvailableCommands(match, currentElectionStep);
					await sayWhatIsUp(match);
					break;
			}
		}
	}
};

const ensureTeamXY = (match: Match.Match, who: EWho, teamAB: ETeamAB) => {
	if (!match.data.election.teamX && !match.data.election.teamY) {
		if (who === EWho.TEAM_X) {
			match.data.election.teamX = teamAB;
			match.data.election.teamY = getOtherTeamAB(teamAB);
		}
		if (who === EWho.TEAM_Y) {
			match.data.election.teamX = getOtherTeamAB(teamAB);
			match.data.election.teamY = teamAB;
		}
		MatchService.scheduleSave(match);
	}
};

/**
 * returns undefined if both teams are valid
 */
const getValidTeamAB = (match: Match.Match, who: EWho): ETeamAB | undefined => {
	if (who === EWho.TEAM_A) return ETeamAB.TEAM_A;
	if (who === EWho.TEAM_B) return ETeamAB.TEAM_B;
	if (who === EWho.TEAM_X) return match.data.election.teamX;
	if (who === EWho.TEAM_Y) return match.data.election.teamY;
};

const isValidTeam = (match: Match.Match, who: EWho, teamAB: ETeamAB) => {
	const validTeam = getValidTeamAB(match, who);
	return validTeam === teamAB || validTeam === undefined;
};

const agreeCommand = async (
	match: Match.Match,
	currentElectionStep: IElectionStep,
	teamAB: ETeamAB,
	map: string
) => {
	if (
		match.data.election.currentSubStep === EStep.MAP &&
		currentElectionStep.map.mode === EMapMode.AGREE
	) {
		const matchMap = match.data.election.remainingMaps.findIndex((mapName) => mapName === map);
		if (matchMap > -1) {
			match.data.election.state = EElectionState.IN_PROGRESS;
			if (teamAB === ETeamAB.TEAM_A) {
				match.data.election.currentAgree.teamA = map;
			} else {
				match.data.election.currentAgree.teamB = map;
			}
			if (
				match.data.election.currentAgree.teamA !== null &&
				match.data.election.currentAgree.teamB !== null &&
				match.data.election.currentAgree.teamA === match.data.election.currentAgree.teamB
			) {
				match.data.election.currentStepMap = match.data.election.remainingMaps[matchMap];
				match.data.election.currentAgree.teamA = null;
				match.data.election.currentAgree.teamB = null;
				match.data.election.remainingMaps.splice(matchMap, 1);
				await next(match);
			} else {
				await Match.say(
					match,
					`MAP ${map} SUGGESTED BY ${escapeRconString(
						Match.getTeamByAB(match, teamAB).name
					)}`
				);
				await Match.say(
					match,
					`AGREE WITH ${Settings.COMMAND_PREFIXES[0]}${getCommands(
						ECommand.AGREE
					)[0].toLowerCase()}`
				);
			}
			MatchService.scheduleSave(match);
		} else {
			await Match.say(match, `INVALID MAP: ${map}`);
			await sayAvailableMaps(match);
		}
	}
};

const banCommand = async (
	match: Match.Match,
	currentElectionStep: IElectionStep,
	teamAB: ETeamAB,
	map: string
) => {
	if (
		match.data.election.currentSubStep === EStep.MAP &&
		currentElectionStep.map.mode === EMapMode.BAN
	) {
		if (isValidTeam(match, currentElectionStep.map.who, teamAB)) {
			const matchMap = match.data.election.remainingMaps.findIndex(
				(mapName) => mapName === map
			);
			if (matchMap > -1) {
				ensureTeamXY(match, currentElectionStep.map.who, teamAB);
				match.data.election.state = EElectionState.IN_PROGRESS;
				await Match.say(match, `MAP ${match.data.election.remainingMaps[matchMap]} BANNED`);
				match.data.election.remainingMaps.splice(matchMap, 1);
				MatchService.scheduleSave(match);
				await next(match);
				await sayWhatIsUp(match);
			} else {
				await Match.say(match, `INVALID MAP: ${map}`);
				await sayAvailableMaps(match);
			}
		} else {
			await Match.say(match, `NOT YOUR TURN!`);
		}
	}
};

const pickCommand = async (
	match: Match.Match,
	currentElectionStep: IElectionStep,
	teamAB: ETeamAB,
	map: string
) => {
	if (
		match.data.election.currentSubStep === EStep.MAP &&
		currentElectionStep.map.mode === EMapMode.PICK
	) {
		if (isValidTeam(match, currentElectionStep.map.who, teamAB)) {
			const matchMap = match.data.election.remainingMaps.findIndex(
				(mapName) => mapName === map
			);
			if (matchMap > -1) {
				ensureTeamXY(match, currentElectionStep.map.who, teamAB);
				match.data.election.state = EElectionState.IN_PROGRESS;
				match.data.election.currentStepMap = match.data.election.remainingMaps[matchMap];
				match.data.election.remainingMaps.splice(matchMap, 1);
				MatchService.scheduleSave(match);
				await Match.say(
					match,
					`${match.data.matchMaps.length + 1}. MAP: ${match.data.election.currentStepMap}`
				);
				await next(match);
				await sayWhatIsUp(match);
			} else {
				await Match.say(match, `INVALID MAP: ${map}`);
				await sayAvailableMaps(match);
			}
		} else {
			await Match.say(match, `NOT YOUR TURN!`);
		}
	}
};

const tCommand = async (
	match: Match.Match,
	currentElectionStep: IElectionStep,
	teamAB: ETeamAB
) => {
	const currentStepMap = match.data.election.currentStepMap ?? '';
	if (
		match.data.election.currentSubStep === EStep.SIDE &&
		isElectionStepAdd(currentElectionStep) &&
		currentElectionStep.side.mode === ESideMode.PICK
	) {
		if (isValidTeam(match, currentElectionStep.side.who, teamAB)) {
			ensureTeamXY(match, currentElectionStep.side.who, teamAB);
			match.data.election.state = EElectionState.IN_PROGRESS;
			match.data.matchMaps.push(
				MatchMap.create(currentStepMap, false, getOtherTeamAB(teamAB))
			);
			MatchService.scheduleSave(match);
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (T-SIDE: ${escapeRconString(
					Match.getTeamByAB(match, getOtherTeamAB(teamAB)).name
				)})`
			);
			await next(match);
			await sayWhatIsUp(match);
		} else {
			await Match.say(match, `NOT YOUR TURN!`);
		}
	}
};

const ctCommand = async (
	match: Match.Match,
	currentElectionStep: IElectionStep,
	teamAB: ETeamAB
) => {
	const currentStepMap = match.data.election.currentStepMap ?? '';
	if (
		match.data.election.currentSubStep === EStep.SIDE &&
		isElectionStepAdd(currentElectionStep) &&
		currentElectionStep.side.mode === ESideMode.PICK
	) {
		if (isValidTeam(match, currentElectionStep.side.who, teamAB)) {
			ensureTeamXY(match, currentElectionStep.side.who, teamAB);
			match.data.election.state = EElectionState.IN_PROGRESS;
			match.data.matchMaps.push(MatchMap.create(currentStepMap, false, teamAB));
			MatchService.scheduleSave(match);
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (CT-SIDE: ${escapeRconString(Match.getTeamByAB(match, teamAB).name)})`
			);
			await next(match);
			await sayWhatIsUp(match);
		} else {
			await Match.say(match, `NOT YOUR TURN!`);
		}
	}
};

const restartCommand = async (
	match: Match.Match,
	currentElectionStep: IElectionStep,
	teamAB: ETeamAB
) => {
	if (teamAB === ETeamAB.TEAM_A) {
		match.data.election.currentRestart.teamA = true;
	} else {
		match.data.election.currentRestart.teamB = true;
	}

	if (match.data.election.currentRestart.teamA && match.data.election.currentRestart.teamB) {
		match.data.election.currentRestart.teamA = false;
		match.data.election.currentRestart.teamB = false;

		try {
			match.data.election = create(match.data.mapPool, match.data.electionSteps);
			match.data.matchMaps = [];
		} catch (err) {
			match.log(`Error restarting the election process: ${err}`);
			await Match.say(match, `ERROR RESTARTING THE ELECTION`);
		}
	} else {
		await Match.say(
			match,
			`${escapeRconString(
				Match.getTeamByAB(match, teamAB).name
			)} WANTS TO RESTART THE ELECTION PROCESS`
		);
		await Match.say(
			match,
			`TYPE ${Settings.COMMAND_PREFIXES[0]}${getCommands(
				ECommand.RESTART
			)[0].toLowerCase()} TO CONFIRM AND RESTART`
		);
	}
	MatchService.scheduleSave(match);
};

const next = async (match: Match.Match) => {
	match.data.election.currentRestart.teamA = false;
	match.data.election.currentRestart.teamB = false;

	const currentElectionStep = getCurrentElectionStep(match);

	if (
		match.data.election.currentSubStep === EStep.MAP &&
		(currentElectionStep?.map.mode === EMapMode.AGREE ||
			currentElectionStep?.map.mode === EMapMode.FIXED ||
			currentElectionStep?.map.mode === EMapMode.PICK ||
			currentElectionStep?.map.mode === EMapMode.RANDOM_PICK)
	) {
		match.data.election.currentSubStep = EStep.SIDE;
	} else {
		match.data.election.currentSubStep = EStep.MAP;
		match.data.election.currentStep++;
		if (match.data.election.currentStep >= match.data.electionSteps.length) {
			match.data.election.state = EElectionState.FINISHED;
			await Match.onElectionFinished(match);
		}
	}
	MatchService.scheduleSave(match);
	await auto(match);
};

export const auto = async (match: Match.Match) => {
	const currentElectionStep = getCurrentElectionStep(match);
	if (match.data.election.state !== EElectionState.FINISHED && currentElectionStep) {
		if (match.data.election.currentSubStep === EStep.MAP) {
			await autoMap(match, currentElectionStep);
		}
		if (match.data.election.currentSubStep === EStep.SIDE) {
			await autoSide(match, currentElectionStep);
		}
	}
};

const autoMap = async (match: Match.Match, currentElectionStep: IElectionStep) => {
	if (currentElectionStep.map.mode === EMapMode.FIXED) {
		match.data.election.currentStepMap = currentElectionStep.map.fixed;
		await Match.say(
			match,
			`${match.data.matchMaps.length + 1}. MAP: ${match.data.election.currentStepMap}`
		);
		await next(match);
		MatchService.scheduleSave(match);
		return;
	}
	if (
		currentElectionStep.map.mode === EMapMode.RANDOM_BAN ||
		currentElectionStep.map.mode === EMapMode.RANDOM_PICK
	) {
		const matchMap = Math.min(
			Math.floor(Math.random() * match.data.election.remainingMaps.length),
			match.data.election.remainingMaps.length
		);
		if (currentElectionStep.map.mode === EMapMode.RANDOM_PICK) {
			match.data.election.currentStepMap = match.data.election.remainingMaps[matchMap];
			await Match.say(
				match,
				`${match.data.election.remainingMaps.length > 1 ? 'RANDOM ' : ''}${
					match.data.matchMaps.length + 1
				}. MAP: ${match.data.election.currentStepMap}`
			);
		} else {
			await Match.say(match, `MAP ${match.data.election.remainingMaps[matchMap]} BANNED`);
		}
		match.data.election.remainingMaps.splice(matchMap, 1);
		await next(match);
		MatchService.scheduleSave(match);
		return;
	}
};

const autoSide = async (match: Match.Match, currentElectionStep: IElectionStep) => {
	if (isElectionStepSkip(currentElectionStep)) {
		return;
	}

	const currentStepMap = match.data.election.currentStepMap ?? '';

	if (currentElectionStep.side.mode === ESideMode.FIXED) {
		if ([ESideFixed.TEAM_A_CT, ESideFixed.TEAM_B_T].includes(currentElectionStep.side.fixed)) {
			match.data.matchMaps.push(MatchMap.create(currentStepMap, false, ETeamAB.TEAM_A));
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (CT-SIDE: ${escapeRconString(Match.getTeamByAB(match, ETeamAB.TEAM_A).name)})`
			);
			await next(match);
			return;
		}

		if ([ESideFixed.TEAM_A_T, ESideFixed.TEAM_B_CT].includes(currentElectionStep.side.fixed)) {
			match.data.matchMaps.push(MatchMap.create(currentStepMap, false, ETeamAB.TEAM_B));
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (CT-SIDE: ${escapeRconString(Match.getTeamByAB(match, ETeamAB.TEAM_B).name)})`
			);
			await next(match);
			return;
		}

		if (match.data.election.teamX && match.data.election.teamY) {
			if (
				[ESideFixed.TEAM_X_CT, ESideFixed.TEAM_Y_T].includes(currentElectionStep.side.fixed)
			) {
				match.data.matchMaps.push(
					MatchMap.create(currentStepMap, false, match.data.election.teamX)
				);
				await Match.say(
					match,
					`${match.data.matchMaps.length}. MAP: ${
						match.data.election.currentStepMap
					} (CT-SIDE: ${escapeRconString(
						Match.getTeamByAB(match, match.data.election.teamX).name
					)})`
				);
				await next(match);
				return;
			}

			if (
				[ESideFixed.TEAM_X_T, ESideFixed.TEAM_Y_CT].includes(currentElectionStep.side.fixed)
			) {
				match.data.matchMaps.push(
					MatchMap.create(currentStepMap, false, match.data.election.teamY)
				);
				await Match.say(
					match,
					`${match.data.matchMaps.length}. MAP: ${
						match.data.election.currentStepMap
					} (CT-SIDE: ${escapeRconString(
						Match.getTeamByAB(match, match.data.election.teamY).name
					)})`
				);
				await next(match);
				return;
			}
		}
	}

	if (currentElectionStep.side.mode === ESideMode.KNIFE) {
		match.data.matchMaps.push(MatchMap.create(currentStepMap, true));
		await Match.say(
			match,
			`${match.data.matchMaps.length}. MAP: ${match.data.election.currentStepMap} (KNIFE FOR SIDE)`
		);
		await next(match);
		return;
	}

	if (currentElectionStep.side.mode === ESideMode.RANDOM) {
		const startAsCtTeam = Math.random() < 0.5 ? ETeamAB.TEAM_A : ETeamAB.TEAM_B;
		match.data.matchMaps.push(MatchMap.create(currentStepMap, false, startAsCtTeam));
		await Match.say(
			match,
			`${match.data.matchMaps.length}. MAP: ${
				match.data.election.currentStepMap
			} (RANDOM CT-SIDE: ${escapeRconString(Match.getTeamByAB(match, startAsCtTeam).name)})`
		);
		await next(match);
		return;
	}
};
