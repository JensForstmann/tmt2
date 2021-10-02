import { ETeamAB } from './matchMap';

export interface IPlayer {
	steamId64: string;
	name: string;
	team?: ETeamAB;
}
