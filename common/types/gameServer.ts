import { IMatch } from './match';

export interface IGameServer {
	ip: string;
	port: number;
	rconPassword: string;
	hideRconPassword?: boolean;
}

export interface IManagedGameServer extends IGameServer {
	canBeUsed: boolean;
	usedBy: IMatch['id'] | null;
}

export interface IManagedGameServerCreateDto extends IGameServer {
	canBeUsed?: boolean;
}

export interface IManagedGameServerUpdateDto {
	ip: string;
	port: number;
	rconPassword?: string;
	canBeUsed?: boolean;
	usedBy?: IMatch['id'] | null;
}
