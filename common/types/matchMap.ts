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

export type TTeamAB = 'TEAM_A' | 'TEAM_B';

export interface IMatchMap {
	/** map name */
	name: string;
	knifeForSide: boolean;
	/** may change after knife round */
	startAsCtTeam: TTeamAB;
	state: TMatchMapSate;
	knifeWinner?: TTeamAB;
	readyTeams: {
		teamA: boolean;
		teamB: boolean;
	};
	knifeRestart: {
		teamA: boolean;
		teamB: boolean;
	};
	score: {
		teamA: number;
		teamB: number;
	};
	overTimeEnabled: boolean;
	overTimeMaxRounds: number;
	maxRounds: number;
}

export interface IMatchMapUpdateDto extends Partial<IMatchMap> {
	/** reads and refreshes mp_overtime_enable, mp_overtime_maxrounds and mp_maxrounds from rcon */
	_refreshOvertimeAndMaxRoundsSettings?: boolean;
	/** switch team internals, i.e. swap team names (and internal score) */
	_switchTeamInternals?: boolean;
}
