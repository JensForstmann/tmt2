import { TTeamAB } from './team';

/**
 * Possible match map states.
 */
export type TMatchMapSate =
	/** map will be played in the future, server has not changed to this map, yet */
	| 'PENDING'
	/** server will change to this map, soon */
	| 'MAP_CHANGE'
	| 'WARMUP'
	| 'KNIFE'
	/** knife round is over, waiting for winner to select side (or to restart the knife round) */
	| 'AFTER_KNIFE'
	| 'IN_PROGRESS'
	| 'PAUSED'
	| 'FINISHED';

export interface IMatchMap {
	/** Map name, e.g. de_anubis. */
	name: string;
	knifeForSide: boolean;
	/** may change after knife round */
	startAsCtTeam: TTeamAB;
	state: TMatchMapSate;
	/** Winner of the knife round which is able to or already has picked a starting side. */
	knifeWinner?: TTeamAB;
	readyTeams: {
		teamA: boolean;
		teamB: boolean;
	};
	knifeRestart: {
		teamA: boolean;
		teamB: boolean;
	};
	/** Current score of both teams. */
	score: {
		teamA: number;
		teamB: number;
	};
	/** If overtime is enabled (mp_overtime_enable). */
	overTimeEnabled: boolean;
	/** Max rounds in overtime (mp_overtime_maxrounds). */
	overTimeMaxRounds: number;
	/** Max rounds (mp_maxrounds). */
	maxRounds: number;
}

/**
 * Structure to update a match map.
 */
export interface IMatchMapUpdateDto extends Partial<IMatchMap> {
	/** reads and refreshes mp_overtime_enable, mp_overtime_maxrounds and mp_maxrounds from rcon */
	_refreshOvertimeAndMaxRoundsSettings?: boolean;
	/** switch team internals, i.e. swap team names (and internal score) */
	_switchTeamInternals?: boolean;
}
