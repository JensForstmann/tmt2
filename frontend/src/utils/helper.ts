import { getOtherTeamAB, IMatchMap } from '../../../common';
// import { getOtherTeamAB } from 'tmt2-common/dist/interfaces/matchMap';

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
