import { TTeamSides } from './team';

export interface PlayerStats {
	steamId64: string;
	side: TTeamSides | null;
	state: 'ALIVE' | 'DEAD' | 'DISCONNECTED' | null;
	money: number;
	kills: number;
	deaths: number;
	assists: number;
	damage: number;
	utilityDamage: number;
	enemiesFlashed: number;
	averageDamagePerRound: number;
	/** Health (could be lower in game, because the server doesn't send data for fall damage) */
	health: number;
	armor: number;
	headshots: number; // kills with headshot
	// dinks: number; // headshots without kill
	/**
	 * All items this player has ("C4", "DEFUSER", weapons, grenades, kevlar, helmet).
	 *
	 * Always uppercase.
	 *
	 * Might be incorrect, because the server only sends data for picked up items, not dropped ones.
	 */
	items: string[];
}
