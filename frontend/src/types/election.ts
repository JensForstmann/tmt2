import { ETeamAB } from './matchMap';

export enum EElectionState {
	NOT_STARTED = 'NOT_STARTED',
	/** Election process was restarted but is not (again) in progress yet */
	RESTARTED = 'RESTARTED',
	IN_PROGRESS = 'IN_PROGRESS',
	FINISHED = 'FINISHED',
}

export enum EStep {
	MAP = 'MAP',
	SIDE = 'SIDE',
}

export interface IElection {
	state: EElectionState;
	teamX?: ETeamAB;
	teamY?: ETeamAB;
	/** Will be the same as the mapPool from the match, but will shrink when maps get picked, banned or randomly chosen. */
	remainingMaps: string[];
	/** Index of the current electionSteps of the match. */
	currentStep: number;
	/** Toggles between MAP and SIDE */
	currentSubStep: EStep;
	/** Current set map of the current selection step. */
	currentStepMap?: string;
	/** Holds the wanted maps of each team. */
	currentAgree: {
		teamA: string | null;
		teamB: string | null;
	};
	/** The election process can be restarted if both teams vote for it.  */
	currentRestart: {
		teamA: boolean;
		teamB: boolean;
	};
}
