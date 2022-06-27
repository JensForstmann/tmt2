import { IElectionStep, IElectionStepAdd, IElectionStepSkip } from './types';

export const isElectionStepAdd = (u: IElectionStep): u is IElectionStepAdd => {
	return u.map.mode !== 'BAN';
};

export const isElectionStepSkip = (u: IElectionStep): u is IElectionStepSkip => {
	return u.map.mode === 'BAN';
};

export const getTotalNumberOfMaps = (electionSteps: IElectionStep[]) => {
	return electionSteps.filter((step) => isElectionStepAdd(step)).length;
};
