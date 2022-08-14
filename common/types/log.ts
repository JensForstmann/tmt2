export type TLogType = 'CHAT' | 'SYSTEM';

export interface ILog {
	type: TLogType;
	timestamp: number;
}

export interface ILogChat extends ILog {
	type: 'CHAT';
	isTeamChat: boolean;
	steamId64: string;
	message: string;
}

export type TSystemLogCategory = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface ILogSystem extends ILog {
	type: 'SYSTEM';
	category: TSystemLogCategory;
	message: string;
}

export type TLogUnion = ILogChat | ILogSystem;
