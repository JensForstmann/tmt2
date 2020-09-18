import { Player } from './player';
import { makeStringify } from '../utils';

export enum ETeamSides {
	CT = 'CT',
	T = 'T',
}

export class Team {
	id: string;
	currentSide: ETeamSides;
	isTeam1: boolean;
	isTeam2: boolean;
	players: Set<Player> = new Set();
	name: string;

	constructor(id: string, currentSide: ETeamSides, isTeam1: boolean, name: string) {
		this.id = id;
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
		return obj;
	}

	toIngameString(): string {
		return this.name.replace(/"|;/g, '');
	}
}
