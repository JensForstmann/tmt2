import {
	IElectionStep,
	IElectionStepAdd,
	IElectionStepSkip,
	MapModesAdd,
	MapModesSkip,
	TMapMode,
	TMapModeAdd,
	TMapModeSkip,
} from './types';

export const isElectionStepModeAdd = (u: TMapMode): u is TMapModeAdd => {
	return MapModesAdd.includes(u as TMapModeAdd);
};

export const isElectionStepModeSkip = (u: TMapMode): u is TMapModeSkip => {
	return MapModesSkip.includes(u as TMapModeSkip);
};

export const isElectionStepAdd = (u: IElectionStep): u is IElectionStepAdd => {
	return isElectionStepModeAdd(u.map.mode);
};

export const isElectionStepSkip = (u: IElectionStep): u is IElectionStepSkip => {
	return isElectionStepModeSkip(u.map.mode);
};

export const getTotalNumberOfMaps = (electionSteps: IElectionStep[]) => {
	return electionSteps.filter((step) => isElectionStepAdd(step)).length;
};
