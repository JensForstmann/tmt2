import { getCommands, ECommand } from './commands';
import * as MatchMap from './matchMap';
import * as Match from './match';
import { escapeRconString } from './utils';
import { EElectionState, EStep, IElection } from './interfaces/election';
import { Settings } from './settings';
import { EMapMode, ESideFixed, ESideMode, EWho, IElectionStep } from './interfaces/electionStep';
import { ETeamAB, getOtherTeamAB } from './interfaces/matchMap';

export const create = (mapPool: string[]): IElection => {
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
	if (match.data.election.currentSubStep === EStep.SIDE) {
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

export const sayPeriodicMessage = async (
	match: Match.Match,
	currentElectionStep: IElectionStep
) => {
	if (
		match.data.election.state === EElectionState.IN_PROGRESS ||
		match.data.election.state === EElectionState.NOT_STARTED
	) {
		await Match.say(match, `CURRENTLY IN ELECTION MODE`);
		await Match.say(
			match,
			`COMMANDS: ${getAvailableCommands(match, currentElectionStep)
				.map((c) => Settings.COMMAND_PREFIXES[0] + c)
				.join(', ')}`
		);
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
		match.data.election.state === EElectionState.IN_PROGRESS ||
		match.data.election.state === EElectionState.NOT_STARTED
	) {
		const map = (parameters[0] || '').toLowerCase();
		const currentElectionStep = match.data.electionSteps[match.data.election.currentStep] as
			| IElectionStep
			| undefined;
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
	}
};

const isValidTeam = (match: Match.Match, who: EWho, teamAB: ETeamAB) => {
	if (who === EWho.TEAM_A && teamAB === ETeamAB.TEAM_A) return true;
	if (who === EWho.TEAM_B && teamAB === ETeamAB.TEAM_B) return true;

	if (who === EWho.TEAM_X && teamAB === match.data.election.teamX) return true;
	if (who === EWho.TEAM_Y && teamAB === match.data.election.teamY) return true;

	if (
		(who === EWho.TEAM_X || who === EWho.TEAM_Y) &&
		!match.data.election.teamX &&
		!match.data.election.teamY
	)
		return true;

	return false;
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
		currentElectionStep.map.mode === EMapMode.BAN &&
		isValidTeam(match, currentElectionStep.map.who, teamAB)
	) {
		const matchMap = match.data.election.remainingMaps.findIndex((mapName) => mapName === map);
		if (matchMap > -1) {
			ensureTeamXY(match, currentElectionStep.map.who, teamAB);
			match.data.election.state = EElectionState.IN_PROGRESS;
			await Match.say(match, `MAP ${match.data.election.remainingMaps[matchMap]} BANNED`);
			match.data.election.remainingMaps.splice(matchMap, 1);
			await next(match);
		} else {
			await Match.say(match, `INVALID MAP: ${map}`);
			await sayAvailableMaps(match);
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
		currentElectionStep.map.mode === EMapMode.PICK &&
		isValidTeam(match, currentElectionStep.map.who, teamAB)
	) {
		const matchMap = match.data.election.remainingMaps.findIndex((mapName) => mapName === map);
		if (matchMap > -1) {
			ensureTeamXY(match, currentElectionStep.map.who, teamAB);
			match.data.election.state = EElectionState.IN_PROGRESS;
			match.data.election.currentStepMap = match.data.election.remainingMaps[matchMap];
			match.data.election.remainingMaps.splice(matchMap, 1);
			await Match.say(
				match,
				`${match.data.matchMaps.length + 1}. MAP: ${match.data.election.currentStepMap}`
			);
			await next(match);
		} else {
			await Match.say(match, `INVALID MAP: ${map}`);
			await sayAvailableMaps(match);
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
		currentElectionStep.side.mode === ESideMode.PICK &&
		isValidTeam(match, currentElectionStep.side.who, teamAB)
	) {
		ensureTeamXY(match, currentElectionStep.side.who, teamAB);
		match.data.election.state = EElectionState.IN_PROGRESS;
		match.data.matchMaps.push(MatchMap.create(currentStepMap, false, getOtherTeamAB(teamAB)));
		await Match.say(
			match,
			`${match.data.matchMaps.length}. MAP: ${
				match.data.election.currentStepMap
			} (T-SIDE: ${escapeRconString(Match.getTeamByAB(match, getOtherTeamAB(teamAB)).name)})`
		);
		await next(match);
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
		currentElectionStep.side.mode === ESideMode.PICK &&
		isValidTeam(match, currentElectionStep.side.who, teamAB)
	) {
		ensureTeamXY(match, currentElectionStep.side.who, teamAB);
		match.data.election.state = EElectionState.IN_PROGRESS;
		match.data.matchMaps.push(MatchMap.create(currentStepMap, false, teamAB));
		await Match.say(
			match,
			`${match.data.matchMaps.length}. MAP: ${
				match.data.election.currentStepMap
			} (CT-SIDE: ${escapeRconString(Match.getTeamByAB(match, teamAB).name)})`
		);
		await next(match);
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
		await restart(match);
	} else {
		await Match.say(
			match,
			`${escapeRconString(
				Match.getTeamByAB(match, teamAB).name
			)} WANTS TO RESTART THE COMPLETE PROCESS`
		);
		await Match.say(
			match,
			`TYPE ${Settings.COMMAND_PREFIXES[0]}${getCommands(
				ECommand.RESTART
			)[0].toLowerCase()} TO CONFIRM AND RESTART`
		);
	}
};

const restart = async (match: Match.Match) => {
	match.data.election = create(match.data.mapPool);
	match.data.matchMaps = [];
};

const next = async (match: Match.Match) => {
	match.data.election.currentRestart.teamA = false;
	match.data.election.currentRestart.teamB = false;

	const currentElectionStep = match.data.electionSteps[match.data.election.currentStep] as
		| IElectionStep
		| undefined;

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

	await auto(match);
};

export const auto = async (match: Match.Match) => {
	const currentElectionStep = match.data.electionSteps[match.data.election.currentStep] as
		| IElectionStep
		| undefined;
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
				`RANDOM ${match.data.matchMaps.length + 1}. MAP: ${
					match.data.election.currentStepMap
				}`
			);
		} else {
			await Match.say(match, `MAP ${match.data.election.remainingMaps[matchMap]} BANNED`);
		}
		match.data.election.remainingMaps.splice(matchMap, 1);
		await next(match);
		return;
	}
};

const autoSide = async (match: Match.Match, currentElectionStep: IElectionStep) => {
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
