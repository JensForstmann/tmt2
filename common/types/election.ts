import { TTeamAB } from './team';

export type TElectionState = 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';

export type TStep = 'MAP' | 'SIDE';

export interface IElection {
	state: TElectionState;
	teamX?: TTeamAB;
	teamY?: TTeamAB;
	/** Will be the same as the mapPool from the match, but will shrink when maps get picked, banned or randomly chosen. */
	remainingMaps: string[];
	/** Index of the current electionSteps of the match. */
	currentStep: number;
	/** Toggles between MAP and SIDE */
	currentSubStep: TStep;
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
