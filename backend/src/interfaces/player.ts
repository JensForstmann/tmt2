import { Player } from '../match/player';

export interface ISerializedPlayer {
	steamId64: string;
	name: string;
}

export class SerializedPlayer implements ISerializedPlayer {
	steamId64: string;
	name: string;

	constructor(player: Player) {
		this.steamId64 = player.steamId64;
		this.name = player.name;
	}

	static fromNormalToSerialized(player: Player) {
		return new this(player);
	}

	static fromSerializedToNormal(serializedPlayer: ISerializedPlayer) {
		return new Player(serializedPlayer.steamId64, serializedPlayer.name);
	}
}
