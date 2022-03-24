export enum EMatchMapSate {
	/** map will be played in the future, server has not changed to this map, yet */
	PENDING = 'PENDING',
	/** server will change to this map, soon */
	MAP_CHANGE = 'MAP_CHANGE',
	WARMUP = 'WARMUP',
	KNIFE = 'KNIFE',
	/** knife round is over, waiting for winner to select side (or to restart the knife round) */
	AFTER_KNIFE = 'AFTER_KNIFE',
	IN_PROGRESS = 'IN_PROGRESS',
	PAUSED = 'PAUSED',
	FINISHED = 'FINISHED',
}

export enum ETeamAB {
	TEAM_A = 'TEAM_A',
	TEAM_B = 'TEAM_B',
}

export const getOtherTeamAB = (team: ETeamAB): ETeamAB => {
	switch (team) {
		case ETeamAB.TEAM_A:
			return ETeamAB.TEAM_B;
		case ETeamAB.TEAM_B:
			return ETeamAB.TEAM_A;
	}
};

export interface IMatchMap {
	/** map name */
	name: string;
	knifeForSide: boolean;
	/** may change after knife round */
	startAsCtTeam: ETeamAB;
	state: EMatchMapSate;
	knifeWinner?: ETeamAB;
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
}
