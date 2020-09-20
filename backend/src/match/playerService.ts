import { Player } from './player';

const players: Map<string, Player> = new Map();

export class PlayerService {
	static create(steamId: string, name: string): Player {
		if (!players.has(steamId)) {
			const player = new Player(steamId, name);
			players.set(steamId, player);
			return player;
		} else {
			throw 'player already exists';
		}
	}

	static get(id: string) {
		return players.get(id);
	}

	static ensure(id: string, name: string) {
		const player = PlayerService.get(id) || PlayerService.create(id, name);
		player.name = name;
		return player;
	}
}
