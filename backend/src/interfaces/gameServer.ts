import { GameServer } from '../gameServer';

export interface ISerializedGameServer {
	ip: string;
	port: number;
	rconPassword: string;
}

export class SerializedGameServer implements ISerializedGameServer {
	ip: string;
	port: number;
	rconPassword: string;

	constructor(gameServer: GameServer) {
		this.ip = gameServer.ip;
		this.port = gameServer.port;
		this.rconPassword = gameServer.rconPassword;
	}

	static fromSerializedToNormal(serializedGameServer: ISerializedGameServer): GameServer {
		return new GameServer(
			serializedGameServer.ip,
			serializedGameServer.port,
			serializedGameServer.rconPassword
		);
	}

	static fromNormalToSerialized(gameServer: GameServer): ISerializedGameServer {
		return new this(gameServer);
	}
}
