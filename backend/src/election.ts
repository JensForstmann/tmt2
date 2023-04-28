import {
	escapeRconString,
	getOtherTeamAB,
	IElection,
	IElectionStep,
	IElectionStepAdd,
	IElectionStepSkip,
	IPlayer,
	isElectionStepAdd,
	isElectionStepSkip,
	TTeamAB,
	TWho,
} from '../../common';
import * as Events from './events';
import { TCommand, getUserCommandsByInternalCommand } from './commands';
import * as Match from './match';
import * as MatchMap from './matchMap';
import * as MatchService from './matchService';
import { Settings } from './settings';

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
		state: 'NOT_STARTED',
		currentStep: 0,
		currentSubStep: 'MAP',
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
			case 'PICK':
			case 'RANDOM_PICK':
			case 'AGREE':
			case 'BAN':
			case 'RANDOM_BAN':
				return true;
			case 'FIXED':
				return false;
		}
	});

	return stepsWhichRemovesAMapFromMapPool.length <= mapPool.length;
};

const getAvailableCommands = (match: Match.Match, currentElectionStep: IElectionStep): string[] => {
	if (match.data.election.state === 'FINISHED') {
		return [];
	}
	if (match.data.election.currentSubStep === 'MAP') {
		switch (currentElectionStep.map.mode) {
			case 'AGREE':
				return [
					...getUserCommandsByInternalCommand('AGREE'),
					...getUserCommandsByInternalCommand('PICK'),
					...getUserCommandsByInternalCommand('RESTART'),
				];
			case 'BAN':
				return [
					...getUserCommandsByInternalCommand('BAN'),
					...getUserCommandsByInternalCommand('RESTART'),
				];
			case 'PICK':
				return [
					...getUserCommandsByInternalCommand('PICK'),
					...getUserCommandsByInternalCommand('RESTART'),
				];
		}
	}
	if (match.data.election.currentSubStep === 'SIDE' && isElectionStepAdd(currentElectionStep)) {
		switch (currentElectionStep.side.mode) {
			case 'PICK':
				return [
					...getUserCommandsByInternalCommand('T'),
					...getUserCommandsByInternalCommand('CT'),
					...getUserCommandsByInternalCommand('RESTART'),
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
		match.data.election.state === 'IN_PROGRESS' ||
		match.data.election.state === 'NOT_STARTED'
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

	if (match.data.election.currentSubStep === 'MAP') {
		if (currentElectionStep.map.mode === 'AGREE') {
			await Match.say(
				match,
				`BOTH TEAMS MUST ${Settings.COMMAND_PREFIXES[0]}${getUserCommandsByInternalCommand(
					'AGREE'
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
		} else if (currentElectionStep.map.mode === 'BAN') {
			const validTeam = getValidTeamAB(match, currentElectionStep.map.who);
			if (validTeam)
				await Match.say(
					match,
					`TEAM ${escapeRconString(Match.getTeamByAB(match, validTeam).name)} MUST ${
						Settings.COMMAND_PREFIXES[0]
					}${getUserCommandsByInternalCommand('BAN')} A MAP`
				);
			if (!validTeam)
				await Match.say(
					match,
					`BOTH TEAMS CAN START TO ${
						Settings.COMMAND_PREFIXES[0]
					}${getUserCommandsByInternalCommand('BAN')} A MAP`
				);
			await sayAvailableMaps(match);
		} else if (currentElectionStep.map.mode === 'PICK') {
			const validTeam = getValidTeamAB(match, currentElectionStep.map.who);
			if (validTeam)
				await Match.say(
					match,
					`TEAM ${escapeRconString(Match.getTeamByAB(match, validTeam).name)} MUST ${
						Settings.COMMAND_PREFIXES[0]
					}${getUserCommandsByInternalCommand('PICK')} A MAP`
				);
			if (!validTeam)
				await Match.say(
					match,
					`BOTH TEAMS CAN START TO ${
						Settings.COMMAND_PREFIXES[0]
					}${getUserCommandsByInternalCommand('PICK')} A MAP`
				);
			await sayAvailableMaps(match);
		}
	} else {
		if (isElectionStepAdd(currentElectionStep) && currentElectionStep.side.mode === 'PICK') {
			const validTeam = getValidTeamAB(match, currentElectionStep.side.who);
			if (validTeam)
				await Match.say(
					match,
					`TEAM ${escapeRconString(
						Match.getTeamByAB(match, validTeam).name
					)} MUST CHOOSE A SIDE FOR MAP ${match.data.election.currentStepMap} (${
						Settings.COMMAND_PREFIXES[0]
					}${getUserCommandsByInternalCommand('CT')[0]}, ${Settings.COMMAND_PREFIXES[0]}${
						getUserCommandsByInternalCommand('T')[0]
					})`
				);
			if (!validTeam)
				await Match.say(
					match,
					`BOTH TEAMS CAN START TO CHOOSE A SIDE FOR MAP ${
						match.data.election.currentStepMap
					} (${Settings.COMMAND_PREFIXES[0]}${
						getUserCommandsByInternalCommand('CT')[0]
					}, ${Settings.COMMAND_PREFIXES[0]}${getUserCommandsByInternalCommand('T')[0]})`
				);
		}
	}
};

const sayAvailableMaps = async (match: Match.Match) => {
	await Match.say(match, `AVAILABLE MAPS: ${match.data.election.remainingMaps.join(', ')}`);
};

export const onCommand = async (
	match: Match.Match,
	command: TCommand,
	teamAB: TTeamAB,
	player: IPlayer,
	parameters: string[]
) => {
	if (
		match.data.state === 'ELECTION' &&
		(match.data.election.state === 'IN_PROGRESS' || match.data.election.state === 'NOT_STARTED')
	) {
		const map = (parameters[0] || '').toLowerCase();
		const currentElectionStep = getCurrentElectionStep(match);
		if (currentElectionStep) {
			switch (command) {
				case 'AGREE':
					await agreeCommand(match, currentElectionStep, teamAB, player, map);
					break;
				case 'BAN':
					await banCommand(match, currentElectionStep, teamAB, player, map);
					break;
				case 'PICK':
					await pickCommand(match, currentElectionStep, teamAB, player, map);
					break;
				case 'CT':
					await ctCommand(match, currentElectionStep, teamAB, player);
					break;
				case 'T':
					await tCommand(match, currentElectionStep, teamAB, player);
					break;
				case 'RESTART':
					await restartCommand(match, currentElectionStep, teamAB, player);
					break;
				case 'HELP':
					await sayAvailableCommands(match, currentElectionStep);
					await sayWhatIsUp(match);
					break;
			}
		}
	}
};

const ensureTeamXY = (match: Match.Match, who: TWho, teamAB: TTeamAB) => {
	if (!match.data.election.teamX && !match.data.election.teamY) {
		if (who === 'TEAM_X') {
			match.data.election.teamX = teamAB;
			match.data.election.teamY = getOtherTeamAB(teamAB);
		}
		if (who === 'TEAM_Y') {
			match.data.election.teamX = getOtherTeamAB(teamAB);
			match.data.election.teamY = teamAB;
		}
		MatchService.scheduleSave(match);
	}
};

/**
 * returns undefined if both teams are valid
 */
const getValidTeamAB = (match: Match.Match, who: TWho): TTeamAB | undefined => {
	switch (who) {
		case 'TEAM_A':
			return 'TEAM_A';
		case 'TEAM_B':
			return 'TEAM_B';
		case 'TEAM_X':
			return match.data.election.teamX;
		case 'TEAM_Y':
			return match.data.election.teamY;
	}
};

const isValidTeam = (match: Match.Match, who: TWho, teamAB: TTeamAB) => {
	const validTeam = getValidTeamAB(match, who);
	return validTeam === teamAB || validTeam === undefined;
};

const agreeCommand = async (
	match: Match.Match,
	currentElectionStep: IElectionStep,
	teamAB: TTeamAB,
	player: IPlayer,
	map: string
) => {
	if (match.data.election.currentSubStep === 'MAP' && currentElectionStep.map.mode === 'AGREE') {
		const matchMap = match.data.election.remainingMaps.findIndex((mapName) => mapName === map);
		if (matchMap > -1) {
			match.data.election.state = 'IN_PROGRESS';
			const team = Match.getTeamByAB(match, teamAB);
			if (teamAB === 'TEAM_A') {
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
				Events.onElectionMapStep(match, 'AGREE', match.data.election.currentStepMap!, team);
				match.log(`${teamAB} (${team.name} - ${player.name}) accepts map ${map}`);
				await next(match);
			} else {
				await Match.say(match, `MAP ${map} SUGGESTED BY ${escapeRconString(team.name)}`);
				await Match.say(
					match,
					`AGREE WITH ${Settings.COMMAND_PREFIXES[0]}${getUserCommandsByInternalCommand(
						'AGREE'
					)[0]?.toLowerCase()}`
				);
				match.log(`${teamAB} (${team.name} - ${player.name}) suggests map ${map}`);
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
	teamAB: TTeamAB,
	player: IPlayer,
	map: string
) => {
	if (match.data.election.currentSubStep === 'MAP' && currentElectionStep.map.mode === 'BAN') {
		if (isValidTeam(match, currentElectionStep.map.who, teamAB)) {
			const matchMap = match.data.election.remainingMaps.findIndex(
				(mapName) => mapName === map
			);
			if (matchMap > -1) {
				ensureTeamXY(match, currentElectionStep.map.who, teamAB);
				match.data.election.state = 'IN_PROGRESS';
				const team = Match.getTeamByAB(match, teamAB);
				Events.onElectionMapStep(
					match,
					'BAN',
					match.data.election.remainingMaps[matchMap]!,
					team
				);
				await Match.say(match, `MAP ${match.data.election.remainingMaps[matchMap]} BANNED`);
				match.log(
					`${teamAB} (${team.name} - ${player.name}) bans map ${match.data.election.remainingMaps[matchMap]}`
				);
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
	teamAB: TTeamAB,
	player: IPlayer,
	map: string
) => {
	if (match.data.election.currentSubStep === 'MAP' && currentElectionStep.map.mode === 'PICK') {
		if (isValidTeam(match, currentElectionStep.map.who, teamAB)) {
			const matchMap = match.data.election.remainingMaps.findIndex(
				(mapName) => mapName === map
			);
			if (matchMap > -1) {
				ensureTeamXY(match, currentElectionStep.map.who, teamAB);
				match.data.election.state = 'IN_PROGRESS';
				const team = Match.getTeamByAB(match, teamAB);
				match.data.election.currentStepMap = match.data.election.remainingMaps[matchMap]!;
				Events.onElectionMapStep(match, 'PICK', match.data.election.currentStepMap, team);
				match.data.election.remainingMaps.splice(matchMap, 1);
				MatchService.scheduleSave(match);
				await Match.say(
					match,
					`${match.data.matchMaps.length + 1}. MAP: ${match.data.election.currentStepMap}`
				);
				match.log(
					`${teamAB} (${team.name} - ${player.name}) picks map ${match.data.election.currentStepMap}`
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
	teamAB: TTeamAB,
	player: IPlayer
) => {
	const currentStepMap = match.data.election.currentStepMap ?? '';
	if (
		match.data.election.currentSubStep === 'SIDE' &&
		isElectionStepAdd(currentElectionStep) &&
		currentElectionStep.side.mode === 'PICK'
	) {
		if (isValidTeam(match, currentElectionStep.side.who, teamAB)) {
			ensureTeamXY(match, currentElectionStep.side.who, teamAB);
			match.data.election.state = 'IN_PROGRESS';
			const team = Match.getTeamByAB(match, teamAB);
			Events.onElectionSideStep(match, 'PICK', {
				pickerTeam: team,
				pickerSide: 'T',
				ctTeam: Match.getTeamByAB(match, getOtherTeamAB(teamAB)),
				tTeam: team,
			});
			match.data.matchMaps.push(
				MatchMap.create(currentStepMap, false, getOtherTeamAB(teamAB))
			);
			MatchService.scheduleSave(match);
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (T-SIDE: ${escapeRconString(team.name)})`
			);
			match.log(`${teamAB} (${team.name} - ${player.name}) picks t side`);
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
	teamAB: TTeamAB,
	player: IPlayer
) => {
	const currentStepMap = match.data.election.currentStepMap ?? '';
	if (
		match.data.election.currentSubStep === 'SIDE' &&
		isElectionStepAdd(currentElectionStep) &&
		currentElectionStep.side.mode === 'PICK'
	) {
		if (isValidTeam(match, currentElectionStep.side.who, teamAB)) {
			ensureTeamXY(match, currentElectionStep.side.who, teamAB);
			match.data.election.state = 'IN_PROGRESS';
			const team = Match.getTeamByAB(match, teamAB);
			Events.onElectionSideStep(match, 'PICK', {
				pickerTeam: team,
				pickerSide: 'CT',
				ctTeam: team,
				tTeam: Match.getTeamByAB(match, getOtherTeamAB(teamAB)),
			});
			match.data.matchMaps.push(MatchMap.create(currentStepMap, false, teamAB));
			MatchService.scheduleSave(match);
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (CT-SIDE: ${escapeRconString(team.name)})`
			);
			match.log(`${teamAB} (${team.name} - ${player.name}) picks ct side`);
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
	teamAB: TTeamAB,
	player: IPlayer
) => {
	if (teamAB === 'TEAM_A') {
		match.data.election.currentRestart.teamA = true;
	} else {
		match.data.election.currentRestart.teamB = true;
	}

	const team = Match.getTeamByAB(match, teamAB);
	match.log(`${teamAB} (${team.name} - ${player.name}) wants to restart the election process`);

	if (match.data.election.currentRestart.teamA && match.data.election.currentRestart.teamB) {
		match.data.election.currentRestart.teamA = false;
		match.data.election.currentRestart.teamB = false;

		try {
			match.log('restart election process');
			match.data.election = create(match.data.mapPool, match.data.electionSteps);
			match.data.matchMaps = [];
		} catch (err) {
			match.log(`Error restarting the election process: ${err}`);
			await Match.say(match, `ERROR RESTARTING THE ELECTION`);
		}
	} else {
		await Match.say(
			match,
			`${escapeRconString(team.name)} WANTS TO RESTART THE ELECTION PROCESS`
		);

		await Match.say(
			match,
			`TYPE ${Settings.COMMAND_PREFIXES[0]}${getUserCommandsByInternalCommand(
				'RESTART'
			)[0]?.toLowerCase()} TO CONFIRM AND RESTART`
		);
	}
	MatchService.scheduleSave(match);
};

const next = async (match: Match.Match) => {
	match.data.election.currentRestart.teamA = false;
	match.data.election.currentRestart.teamB = false;

	const currentElectionStep = getCurrentElectionStep(match);

	if (
		match.data.election.currentSubStep === 'MAP' &&
		(currentElectionStep?.map.mode === 'AGREE' ||
			currentElectionStep?.map.mode === 'FIXED' ||
			currentElectionStep?.map.mode === 'PICK' ||
			currentElectionStep?.map.mode === 'RANDOM_PICK')
	) {
		match.data.election.currentSubStep = 'SIDE';
	} else {
		match.data.election.currentSubStep = 'MAP';
		match.data.election.currentStep++;
		if (match.data.election.currentStep >= match.data.electionSteps.length) {
			match.data.election.state = 'FINISHED';
			await Match.onElectionFinished(match);
		}
	}
	MatchService.scheduleSave(match);
	await auto(match);
};

export const auto = async (match: Match.Match) => {
	const currentElectionStep = getCurrentElectionStep(match);
	if (match.data.election.state !== 'FINISHED' && currentElectionStep) {
		if (match.data.election.currentSubStep === 'MAP') {
			await autoMap(match, currentElectionStep);
		}
		if (match.data.election.currentSubStep === 'SIDE') {
			await autoSide(match, currentElectionStep);
		}
	}
};

const autoMap = async (match: Match.Match, currentElectionStep: IElectionStep) => {
	if (currentElectionStep.map.mode === 'FIXED') {
		match.data.election.currentStepMap = currentElectionStep.map.fixed;
		Events.onElectionMapStep(match, 'FIXED', match.data.election.currentStepMap);
		await Match.say(
			match,
			`${match.data.matchMaps.length + 1}. MAP: ${match.data.election.currentStepMap}`
		);
		await next(match);
		MatchService.scheduleSave(match);
		return;
	}
	if (
		currentElectionStep.map.mode === 'RANDOM_BAN' ||
		currentElectionStep.map.mode === 'RANDOM_PICK'
	) {
		const matchMap = Math.min(
			Math.floor(Math.random() * match.data.election.remainingMaps.length),
			match.data.election.remainingMaps.length
		);
		if (currentElectionStep.map.mode === 'RANDOM_PICK') {
			match.data.election.currentStepMap = match.data.election.remainingMaps[matchMap];
			Events.onElectionMapStep(
				match,
				'RANDOM_PICK',
				match.data.election.remainingMaps[matchMap]!
			);
			await Match.say(
				match,
				`${match.data.election.remainingMaps.length > 1 ? 'RANDOM ' : ''}${
					match.data.matchMaps.length + 1
				}. MAP: ${match.data.election.currentStepMap}`
			);
		} else {
			Events.onElectionMapStep(
				match,
				'RANDOM_BAN',
				match.data.election.remainingMaps[matchMap]!
			);
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

	if (currentElectionStep.side.mode === 'FIXED') {
		if (['TEAM_A_CT', 'TEAM_B_T'].includes(currentElectionStep.side.fixed)) {
			Events.onElectionSideStep(match, 'FIXED', {
				ctTeam: Match.getTeamByAB(match, 'TEAM_A'),
				tTeam: Match.getTeamByAB(match, 'TEAM_B'),
			});
			match.data.matchMaps.push(MatchMap.create(currentStepMap, false, 'TEAM_A'));
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (CT-SIDE: ${escapeRconString(Match.getTeamByAB(match, 'TEAM_A').name)})`
			);
			await next(match);
			return;
		}

		if (['TEAM_A_T', 'TEAM_B_CT'].includes(currentElectionStep.side.fixed)) {
			Events.onElectionSideStep(match, 'FIXED', {
				ctTeam: Match.getTeamByAB(match, 'TEAM_B'),
				tTeam: Match.getTeamByAB(match, 'TEAM_A'),
			});
			match.data.matchMaps.push(MatchMap.create(currentStepMap, false, 'TEAM_B'));
			await Match.say(
				match,
				`${match.data.matchMaps.length}. MAP: ${
					match.data.election.currentStepMap
				} (CT-SIDE: ${escapeRconString(Match.getTeamByAB(match, 'TEAM_B').name)})`
			);
			await next(match);
			return;
		}

		if (match.data.election.teamX && match.data.election.teamY) {
			if (['TEAM_X_CT', 'TEAM_Y_T'].includes(currentElectionStep.side.fixed)) {
				Events.onElectionSideStep(match, 'FIXED', {
					ctTeam: Match.getTeamByAB(match, match.data.election.teamX),
					tTeam: Match.getTeamByAB(match, match.data.election.teamY),
				});
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

			if (['TEAM_X_T', 'TEAM_Y_CT'].includes(currentElectionStep.side.fixed)) {
				Events.onElectionSideStep(match, 'FIXED', {
					ctTeam: Match.getTeamByAB(match, match.data.election.teamY),
					tTeam: Match.getTeamByAB(match, match.data.election.teamX),
				});
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

	if (currentElectionStep.side.mode === 'KNIFE') {
		Events.onElectionSideStep(match, 'KNIFE');
		match.data.matchMaps.push(MatchMap.create(currentStepMap, true));
		await Match.say(
			match,
			`${match.data.matchMaps.length}. MAP: ${match.data.election.currentStepMap} (KNIFE FOR SIDE)`
		);
		await next(match);
		return;
	}

	if (currentElectionStep.side.mode === 'RANDOM') {
		const startAsCtTeam = Math.random() < 0.5 ? 'TEAM_A' : 'TEAM_B';
		Events.onElectionSideStep(match, 'RANDOM', {
			ctTeam: Match.getTeamByAB(match, startAsCtTeam),
			tTeam: Match.getTeamByAB(match, getOtherTeamAB(startAsCtTeam)),
		});
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
