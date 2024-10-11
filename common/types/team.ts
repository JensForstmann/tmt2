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
	/** Advantage in map wins, useful for double elimination tournament finals. */
	advantage: number;
	/** Steam ids of players in "Steam ID 64" format. Will be forced into this team.*/
	playerSteamIds64?: string[];
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
	/** Advantage in map wins, useful for double elimination tournament finals. */
	advantage?: number;
	/** Steam ids of players in "Steam ID 64" format. Will be forced into this team.*/
	playerSteamIds64?: string[];
}

/** Possible ingame sides of a player. */
export type TTeamString = 'Unassigned' | 'CT' | 'TERRORIST' | '' | 'Spectator';

export type TTeamAB = 'TEAM_A' | 'TEAM_B';
