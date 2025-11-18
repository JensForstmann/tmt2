import { IMatch } from './match';

export interface IGameServer {
	ip: string;
	port: number;
	rconPassword: string;
	/**
	 * If plebs (client without an admin token) create a match the hideRconPassword attribute is set to true.
	 * This will prevent executing rcon commands from the frontend by the (unauthorized) user.
	 */
	hideRconPassword: boolean;
}

export interface IManagedGameServer {
	ip: string;
	port: number;
	rconPassword: string;
	/** Can the server be used for new matches? */
	canBeUsed: boolean;
	/** Match id which is currently using this managed game server. */
	usedBy: IMatch['id'] | null;
}

export interface IManagedGameServerCreateDto {
	ip: string;
	port: number;
	rconPassword: string;
	/** Can the server be used for new matches? */
	canBeUsed?: boolean | null;
}

export interface IManagedGameServerUpdateDto {
	ip: string;
	port: number;
	rconPassword?: string;
	/** Set if the server can be used for new matches. */
	canBeUsed?: boolean;
	/** Set or delete the link to a match. If it's null and `canBeUsed` is true, the game server is available. */
	usedBy?: IMatch['id'] | null;
}
