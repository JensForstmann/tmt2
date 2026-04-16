import { createSignal } from 'solid-js';
import { Event, Message, Payload } from '../../../common';

const WS_HOST = import.meta.env.DEV
	? `${window.location.protocol.replace('http', 'ws')}//${window.location.hostname}:8080`
	: `${window.location.protocol.replace('http', 'ws')}//${window.location.host}`;

type Options = {
	onEvent?: (event: Event) => void;
	afterConnect?: () => void;
	connect?: boolean;
	autoReconnect?: boolean;
};

type Requests = Map<
	number,
	{
		resolve: (result: any) => void;
		reject: (result: any) => void;
	}
>;

export const createWebSocket = (options?: Options) => {
	const requests: Requests = new Map();
	let ws: WebSocket | undefined;
	let msgId = 0;

	const [state, setState] = createSignal<'CLOSED' | 'CLOSING' | 'CONNECTING' | 'OPEN' | 'NEW'>(
		'NEW'
	);

	const onClose = () => {
		setState('CLOSED');
		if (options?.autoReconnect) {
			setTimeout(() => reconnect(), 1_000);
		}
	};

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
		newWs.onclose = () => onClose();
		newWs.onerror = () => onClose();
		newWs.onopen = () => {
			setState('OPEN');
			options?.afterConnect?.();
		};
		newWs.onmessage = (ev) => {
			let msg: Message | undefined;
			try {
				msg = JSON.parse(ev.data);
			} catch (err) {}
			if (!msg) {
				console.warn('Could not parse webSocket message');
			} else if (msg.type === 'RESPONSE') {
				onResponse(msg);
			} else if (msg.type === 'EVENT') {
				options?.onEvent?.(msg.payload as Event);
			} else {
				console.warn(`WebSocket type ${msg.type} is not implemented`);
			}
		};
		ws = newWs;
	};

	const disconnect = () => {
		setState('CLOSING');
		ws?.close();
	};

	if (options?.connect) {
		reconnect();
	}

	const sendRequest = <RequestPayload extends Payload, ResponsePayload extends Payload = Payload>(
		payload: RequestPayload
	): Promise<ResponsePayload> => {
		return new Promise((resolve, reject) => {
			if (!ws || state() !== 'OPEN') {
				reject('WebSocket is not ready');
			}
			const message = {
				type: 'REQUEST',
				msgId: msgId++,
				payload: payload,
			} satisfies Message;
			requests.set(message.msgId, {
				resolve: resolve,
				reject: reject,
			});
			ws?.send(JSON.stringify(message));
		});
	};

	const onResponse = (response: Message) => {
		const request = requests.get(response.msgId!);
		if (!request) {
			console.error(`Request with message id ${response.msgId} could not be found`);
			return;
		}
		if (response.error) {
			request.reject(response.error);
		} else {
			request.resolve(response.payload);
		}
	};

	return {
		state,
		disconnect,
		reconnect,
		connect: reconnect,
		sendRequest,
	};
};
