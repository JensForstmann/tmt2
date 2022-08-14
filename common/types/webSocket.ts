export type WebSocketMessageType =
	| 'SUBSCRIBE'
	| 'SUBSCRIBE_SYS'
	| 'UNSUBSCRIBE'
	| 'UNSUBSCRIBE_SYS';

export interface BaseWebSocketMessage {
	type: WebSocketMessageType;
}

export interface SubscribeMessage extends BaseWebSocketMessage {
	type: 'SUBSCRIBE';
	matchId: string;
	token: string;
}

export interface UnsubscribeMessage extends BaseWebSocketMessage {
	matchId: string;
	type: 'UNSUBSCRIBE';
}

export interface SubscribeSysMessage extends BaseWebSocketMessage {
	type: 'SUBSCRIBE_SYS';
	token: string;
}

export interface UnsubscribeSysMessage extends BaseWebSocketMessage {
	type: 'UNSUBSCRIBE_SYS';
}

export type WebSocketMessage =
	| SubscribeMessage
	| UnsubscribeMessage
	| SubscribeSysMessage
	| UnsubscribeSysMessage;
