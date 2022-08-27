import http from 'http';
import * as WebSocket from 'ws';
import {
	Event,
	SubscribeMessage,
	SubscribeSysMessage,
	UnsubscribeMessage,
	UnsubscribeSysMessage,
	WebSocketMessage,
} from '../../common';
import * as Auth from './auth';

const WS_CLIENTS = new Map<
	WebSocket,
	{
		ip?: string;
		forwardedFor?: string | string[];
		userAgent?: string;
		matches: Set<string>;
		hasSysSub: boolean;
	}
>();

export const setup = async (httpServer: http.Server) => {
	const wsServer = new WebSocket.Server({
		server: httpServer,
		path: '/ws',
	});
	wsServer.on('connection', (ws: WebSocket, req) => {
		WS_CLIENTS.set(ws, {
			ip: req.socket.remoteAddress,
			forwardedFor: req.headers['x-forwarded-for'],
			userAgent: req.headers['user-agent'],
			matches: new Set(),
			hasSysSub: false,
		});

		ws.on('message', (data) => onMessage(ws, data));

		ws.on('close', () => WS_CLIENTS.delete(ws));
	});
};

export const getClients = () => {
	return [...WS_CLIENTS.values()];
};

const onMessage = (ws: WebSocket, data: WebSocket.RawData) => {
	let msg: WebSocketMessage | undefined;
	try {
		msg = JSON.parse(data + '');
	} catch (err) {}
	if (!msg) {
		console.warn('Could not json parse webSocket data');
		return;
	}
	if (msg.type === 'SUBSCRIBE' || msg.type === 'SUBSCRIBE_SYS') {
		subscribe(ws, msg);
	} else if (msg.type === 'UNSUBSCRIBE' || msg.type === 'UNSUBSCRIBE_SYS') {
		unsubscribe(ws, msg);
	} else {
		console.warn(`WebSocket type ${(msg as any).type} not implemented`);
	}
};

const subscribe = async (ws: WebSocket, msg: SubscribeMessage | SubscribeSysMessage) => {
	try {
		const matchId = msg.type === 'SUBSCRIBE' ? msg.matchId : undefined;
		const authResponse = await Auth.isAuthorized(msg.token, matchId);
		if (!authResponse) {
			console.warn(`prevent subscribing: not authorized, payload: ${JSON.stringify(msg)}`);
			return;
		}
		const wsData = WS_CLIENTS.get(ws);
		if (wsData) {
			if (msg.type === 'SUBSCRIBE') {
				wsData.matches.add(msg.matchId);
			} else if (msg.type === 'SUBSCRIBE_SYS') {
				wsData.hasSysSub = true;
			}
		}
	} catch (err) {
		console.error(`subscribe error: ${err}`);
	}
};

const unsubscribe = (ws: WebSocket, msg: UnsubscribeMessage | UnsubscribeSysMessage) => {
	const wsData = WS_CLIENTS.get(ws);
	if (!wsData) {
		return;
	}

	if (msg.type === 'UNSUBSCRIBE') {
		wsData.matches.delete(msg.matchId);
	} else if (msg.type === 'UNSUBSCRIBE_SYS') {
		wsData.hasSysSub = false;
	}
};

export const publish = (msg: Event, isSystemEvent?: boolean) => {
	WS_CLIENTS.forEach((wsData, ws) => {
		if (
			(msg.matchId && wsData.matches.has(msg.matchId)) ||
			(wsData.hasSysSub && isSystemEvent)
		) {
			ws.send(JSON.stringify(msg));
		}
	});
};
