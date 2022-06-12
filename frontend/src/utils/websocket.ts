import { createEffect, createSignal } from 'solid-js';
import { ISubscribeMessage, TWebhook } from '../../../common';
const WS_HOST = import.meta.env.DEV ? 'ws://localhost:8080' : '';

type Options = {
	connect?: boolean;
	autoReconnect?: boolean;
};
export const createWebsocket = (onMsg: (msg: TWebhook) => void, options?: Options) => {
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
			let msg: TWebhook | undefined;
			try {
				msg = JSON.parse(ev.data);
			} catch (err) {
				console.warn('Could not parse websocket message');
			}
			if (msg) {
				onMsg(msg);
			}
		};
		ws = newWs;
	};

	const subscribe = (msg: Omit<ISubscribeMessage, 'type'>) => {
		const unSubscribe = () =>
			ws?.send(
				JSON.stringify({
					type: 'UNSUBSCRIBE',
					matchId: msg.matchId,
				})
			);
		const subMsg: ISubscribeMessage = {
			...msg,
			type: 'SUBSCRIBE',
		};
		ws?.send(JSON.stringify(subMsg));
		return {
			unSubscribe,
		};
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
		disconnect,
		reconnect,
		connect: reconnect,
	};
};
