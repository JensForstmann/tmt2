/**
 * Team.
 */
export interface ITeam {
	/**
	 * Passthrough data to identify team in other systems.
	 * Will be present in every response/webhook.
	 */
	passthrough?: string;
	/** Team name. */
	name: string;
	/** Advantage in map wins, useful for double elemination tournament finals. */
	advantage: number;
}

/**
 * Team (create structure).
 */
export interface ITeamCreateDto {
	name: string;
	/**
	 * Passthrough data to identify team in other systems.
	 * Will be present in every response/webhook.
	 */
	passthrough?: string;
	/** Advantage in map wins, useful for double elemination tournament finals. */
	advantage?: number;
}

/** Possible ingame sides of a player. */
export type TTeamString = 'Unassigned' | 'CT' | 'TERRORIST' | '' | 'Spectator';

export type TTeamAB = 'TEAM_A' | 'TEAM_B';
