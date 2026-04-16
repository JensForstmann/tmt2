import { Event } from './events';
import { IMatch } from './match';

export type Message<T = Payload> = {
	type: 'REQUEST' | 'RESPONSE' | 'EVENT';
	/**
	 * Set by requester, response will have the same message id.
	 */
	msgId?: number;
	error?: string;
	payload?: T;
};

export type Payload =
	| AuthRequest
	| AckResponse
	| GetMatchesRequest
	| GetMatchesResponse
	| GetEventsRequest
	| GetEventsResponse
	| Event;

export type AuthRequest = {
	request: 'AUTH';
	token: string;
};

// export type SubRequest = {
//     request: "SUB";
//     matchId: string;
//     secret: string;
// };

export type AckResponse = {
	type: 'ACK';
};

export type GetMatchesRequest = {
	request: 'GET_MATCHES';
	matches?: {
		id: string;
		secret?: string;
	}[];
};

export type GetMatchesResponse = {
	matches: IMatch[];
};

export type GetEventsRequest = {
	request: 'GET_EVENTS';
	matchId: string;
	eventTypes: Event['type'][];
};

export type GetEventsResponse = {
	events: Event[];
};
