import { Player } from './player';

const players: Map<string, Player> = new Map();

export class PlayerService {
	static create(steamId: string): Player {
		if (!players.has(steamId)) {
			const player = new Player(steamId);
			players.set(steamId, player);
			return player;
		} else {
			throw 'player already exists';
		}
	}

	static get(id: string) {
		return players.get(id);
	}

	static ensure(id: string) {
		return PlayerService.get(id) || PlayerService.create(id);
	}
}
