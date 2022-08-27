import { createEffect, createSignal } from 'solid-js';
import {
	Event,
	SubscribeMessage,
	SubscribeSysMessage,
	UnsubscribeMessage,
	UnsubscribeSysMessage,
} from '../../../common';

const WS_HOST = import.meta.env.DEV
	? `${window.location.protocol.replace('http', 'ws')}//${window.location.hostname}:8080`
	: `${window.location.protocol.replace('http', 'ws')}//${window.location.host}`;

type Options = {
	connect?: boolean;
	autoReconnect?: boolean;
};
export const createWebSocket = (onMsg: (msg: Event) => void, options?: Options) => {
	let ws: WebSocket | undefined;

	const [state, setState] = createSignal<'CLOSED' | 'CLOSING' | 'CONNECTING' | 'OPEN' | 'NEW'>(
		'NEW'
	);

	const reconnect = () => {
		if (ws) {
			ws.onclose = null;
			ws.onerror = null;
			ws.onopen = null;
			ws.onmessage = null;
			ws.close();
		}
		setState('CONNECTING');
		const newWs = new WebSocket(`${WS_HOST}/ws`);
		newWs.onclose = () => setState('CLOSED');
		newWs.onerror = () => setState('CLOSED');
		newWs.onopen = () => setState('OPEN');
		newWs.onmessage = (ev) => {
			let msg: Event | undefined;
			try {
				msg = JSON.parse(ev.data);
			} catch (err) {
				console.warn('Could not parse webSocket message');
			}
			if (msg) {
				onMsg(msg);
			}
		};
		ws = newWs;
	};

	const subscribe = (msg: Omit<SubscribeMessage, 'type'>) => {
		const m: SubscribeMessage = {
			...msg,
			type: 'SUBSCRIBE',
		};
		ws?.send(JSON.stringify(m));
	};

	const subscribeSys = (token: string) => {
		const m: SubscribeSysMessage = {
			type: 'SUBSCRIBE_SYS',
			token: token,
		};
		ws?.send(JSON.stringify(m));
	};

	const unsubscribe = (matchId: string) => {
		const m: UnsubscribeMessage = {
			matchId: matchId,
			type: 'UNSUBSCRIBE',
		};
		ws?.send(JSON.stringify(m));
	};

	const unsubscribeSys = () => {
		const m: UnsubscribeSysMessage = {
			type: 'UNSUBSCRIBE_SYS',
		};
		ws?.send(JSON.stringify(m));
	};

	const disconnect = () => {
		setState('CLOSING');
		ws?.close();
	};

	if (options?.connect) {
		reconnect();
	}

	createEffect(() => {
		if (state() === 'CLOSED' && options?.autoReconnect) {
			reconnect();
		}
	});

	return {
		state,
		subscribe,
		subscribeSys,
		unsubscribe,
		unsubscribeSys,
		disconnect,
		reconnect,
		connect: reconnect,
	};
};
