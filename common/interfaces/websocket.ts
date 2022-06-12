export type TWebSocketMessageType =
	| 'SUBSCRIBE'
	| 'SUBSCRIBE_SYS'
	| 'UNSUBSCRIBE'
	| 'UNSUBSCRIBE_SYS';

export interface IWebSocketMessage {
	type: TWebSocketMessageType;
}

export interface ISubscribeMessage extends IWebSocketMessage {
	type: 'SUBSCRIBE';
	matchId: string;
	token: string;
}

export interface IUnsubscribeMessage extends IWebSocketMessage {
	matchId: string;
	type: 'UNSUBSCRIBE';
}

export interface ISubscribeSysMessage extends IWebSocketMessage {
	type: 'SUBSCRIBE_SYS';
	token: string;
}

export interface IUnsubscribeSysMessage extends IWebSocketMessage {
	type: 'UNSUBSCRIBE_SYS';
}

export type TWebSocketMessages =
	| ISubscribeMessage
	| IUnsubscribeMessage
	| ISubscribeSysMessage
	| IUnsubscribeSysMessage;
