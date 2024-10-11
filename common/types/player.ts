import { TTeamSides } from './stuff';
import { TTeamAB } from './team';

/**
 * Player.
 */
export interface IPlayer {
	/** Steam ID 64 */
	steamId64: string;
	/** Name. */
	name: string;
	/**
	 * Current team as they joined with `.team`.
	 * If the player's steam id is in the team's `playerSteamIds64`
	 * this cannot be changed and is always set to the team.
	 */
	team?: TTeamAB;
	/** Current ingame side. */
	side?: TTeamSides | null;
	/** Player currently on the game server (online)? */
	online?: boolean;
}
