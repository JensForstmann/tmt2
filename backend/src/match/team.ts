import { Player } from './player';
import { makeStringify } from '../utils';
import { Match } from './match';

export enum ETeamSides {
	CT = 'CT',
	T = 'T',
}

export interface ITeamChange {}

export class Team {
	match: Match;
	remoteId?: string;
	currentSide: ETeamSides;
	isTeam1: boolean;
	isTeam2: boolean;
	players: Set<Player> = new Set();
	name: string;

	constructor(
		match: Match,
		currentSide: ETeamSides,
		isTeam1: boolean,
		name: string,
		remoteId?: string
	) {
		this.match = match;
		this.remoteId = remoteId;
		this.currentSide = currentSide;
		this.isTeam1 = isTeam1;
		this.isTeam2 = !isTeam1;
		this.name = name;
	}

	isPlayerInTeam(player: Player) {
		return this.players.has(player);
	}

	toJSON() {
		const obj = makeStringify(this);
		delete obj.match;
		return obj;
	}

	toIngameString(): string {
		return this.name.replace(/[";]/g, '');
	}
}
