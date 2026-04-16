import http from 'http';
import * as WebSocket from 'ws';
import * as Auth from './auth';
import * as MatchService from './matchService';
import {
	AuthRequest,
	Event,
	GetEventsRequest,
	GetEventsResponse,
	GetMatchesRequest,
	GetMatchesResponse,
	IMatch,
	Message,
	Payload,
} from '../../common';
import { getLatestEventsFromDatabase } from './events';

type Client = {
	ws: WebSocket;
	ip?: string;
	forwardedFor?: string | string[];
	userAgent?: string;
	matches: Set<string>;
	isGlobalAdmin: boolean;
};
const CLIENTS = new Map<WebSocket, Client>();

class FatalError extends Error {}

class ResponseError extends Error {}

export const setup = async (httpServer: http.Server) => {
	const wsServer = new WebSocket.Server({
		server: httpServer,
		path: '/ws',
	});
	wsServer.on('connection', (webSocket: WebSocket, req) => {
		CLIENTS.set(webSocket, {
			ws: webSocket,
			ip: req.socket.remoteAddress,
			forwardedFor: req.headers['x-forwarded-for'],
			userAgent: req.headers['user-agent'],
			matches: new Set(),
			isGlobalAdmin: false,
		});

		webSocket.on('message', (data) => onMessage(webSocket, data));

		webSocket.on('close', () => CLIENTS.delete(webSocket));
	});
};

export const getClients = () => {
	return [...CLIENTS.values()];
};

const onMessage = async (webSocket: WebSocket, data: WebSocket.RawData) => {
	let msg: Message | undefined;
	let c: Client | undefined;
	try {
		c = CLIENTS.get(webSocket);
		if (!c) {
			throw new FatalError('WebSocket message came from unknown client');
		}

		try {
			msg = JSON.parse(data + '');
		} catch (err) {}
		if (!msg) {
			throw new FatalError('Could not json parse webSocket data');
		}

		if (msg.type !== 'REQUEST') {
			throw new FatalError(`WebSocket message type ${msg.type} is not supported`);
		}

		if (!msg.payload) {
			throw new FatalError(`WebSocket request message needs a payload`);
		}

		if (!('request' in msg.payload)) {
			throw new FatalError(`Property 'request' is required in a request payload`);
		}
		const request = msg.payload.request;

		if (request === 'AUTH') {
			await auth(c, msg, msg.payload);
		} else if (request === 'GET_MATCHES') {
			getMatches(c, msg, msg.payload);
		} else if (request === 'GET_EVENTS') {
			getEvents(c, msg, msg.payload);
		} else {
			console.warn(`WebSocket request ${request} not implemented`);
		}
	} catch (err) {
		if (err instanceof FatalError || msg?.msgId === undefined || !c) {
			console.warn(`Fatal error in handling webSocket message: ${err}`);
		} else {
			console.warn(`Error in handling webSocket message: ${err}`);
			webSocket.send(
				JSON.stringify({
					type: 'RESPONSE',
					msgId: msg.msgId,
					error: err + '',
				} satisfies Message)
			);
		}
	}
};

const sendResponse = (c: Client, req: Message, payload: Payload) => {
	c.ws.send(
		JSON.stringify({
			type: 'RESPONSE',
			msgId: req.msgId,
			payload: payload,
		} as Message)
	);
};

const auth = async (c: Client, req: Message, payload: AuthRequest) => {
	const authResponse = Auth.isAuthorized(payload.token);
	if (!authResponse) {
		throw new ResponseError('Auth failed');
	}
	c.isGlobalAdmin = true;
	sendResponse(c, req, { type: 'ACK' });
};

const getMatches = (c: Client, req: Message, payload: GetMatchesRequest) => {
	const allMatches = MatchService.getAll();

	const matches: IMatch[] = [];
	for (let i = 0; i < allMatches.length; i++) {
		const match = allMatches[i]!;
		const requestEntry = payload.matches?.find((m) => m.id === match.id);
		const hasAccess = c.isGlobalAdmin || requestEntry?.secret === match.tmtSecret;
		const wanted = requestEntry || !payload.matches;
		if (hasAccess && wanted) {
			matches.push(MatchService.hideRconPassword(match, c.isGlobalAdmin));
			if (!c.isGlobalAdmin) {
				c.matches.add(match.id);
			}
		}
	}

	const res: GetMatchesResponse = {
		matches: matches,
	};
	sendResponse(c, req, res);
};

const getEvents = (c: Client, req: Message, payload: GetEventsRequest) => {
	if (!c.isGlobalAdmin && !c.matches.has(payload.matchId)) {
		throw new ResponseError('Not allowed');
	}
	const res: GetEventsResponse = {
		events: getLatestEventsFromDatabase(payload.matchId),
	};
	sendResponse(c, req, res);
};

export const publish = (msg: Event) => {
	CLIENTS.forEach((c, ws) => {
		if (c.isGlobalAdmin || c.matches.has(msg.matchId)) {
			ws.send(
				JSON.stringify({
					type: 'EVENT',
					payload: msg,
				} as Message<Event>)
			);
		}
	});
};
