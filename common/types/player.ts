import { TTeamAB } from './matchMap';
import { TTeamSides } from './stuff';

export interface IPlayer {
	steamId64: string;
	name: string;
	team?: TTeamAB;
	side?: TTeamSides | null;
	online?: boolean;
}
