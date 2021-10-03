import { IPlayer } from './player';

export enum ELogType {
	CHAT = 'CHAT',
	SYSTEM = 'SYSTEM',
}

export interface ILog {
	type: ELogType;
	timestamp: number;
}

export interface ILogChat extends ILog {
	type: ELogType.CHAT;
	isTeamChat: boolean;
	player: IPlayer;
	message: string;
}

export enum ESystemLogCategory {
	ERROR = 'ERROR',
	WARN = 'WARN',
	INFO = 'INFO',
	DEBUG = 'DEBUG',
}

export interface ILogSystem extends ILog {
	type: ELogType.SYSTEM;
	category: ESystemLogCategory;
	message: string;
}

export type TLogUnion = ILogChat | ILogSystem;
