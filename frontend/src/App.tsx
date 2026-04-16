import { RouteSectionProps } from '@solidjs/router';
import { Component, createEffect, createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
	AuthRequest,
	ChatEvent,
	Event,
	GetEventsRequest,
	GetEventsResponse,
	GetMatchesRequest,
	GetMatchesResponse,
	IMatch,
	LogEvent,
} from '../../common';
import { ErrorComponent } from './components/ErrorComponent';
import { NavBar } from './components/NavBar';
import { getToken } from './utils/auth';
import { updateDarkClasses } from './utils/theme';
import { createWebSocket } from './utils/webSocket';

type GlobalStoreMatch = {
	data: IMatch;
	/** undefined until explicitly requested */
	chatEvents?: ChatEvent[];
	/** undefined until explicitly requested */
	logEvents?: LogEvent[];
};
const [globalStore, setGlobalStore] = createStore<{
	matches?: GlobalStoreMatch[];
}>();
export { globalStore };

export const fetchMatch = async (matchId: string, secret?: string) => {
	const matches = await fetchMatches([{ id: matchId, secret: secret }]);
	if (matches[0]) {
		return matches[0];
	}
};

export const fetchMatches = async (matches: GetMatchesRequest['matches']) => {
	const res = await sendRequest<GetMatchesRequest, GetMatchesResponse>({
		request: 'GET_MATCHES',
		matches: matches,
	});
	setGlobalStore('matches', (existing): GlobalStoreMatch[] => {
		const existingWithoutNew =
			existing?.filter((e) => res.matches.find((m) => m.id === e.data.id) === undefined) ??
			[];
		return [
			...existingWithoutNew,
			...res.matches.map(
				(r): GlobalStoreMatch => ({
					data: r,
				})
			),
		];
	});
	return res.matches;
};

export const fetchMatchEvents = async (id: string) => {
	const existing = globalStore.matches?.findIndex((m) => m.data.id === id) ?? -1;
	if (existing < 0) {
		throw 'Match is unknown, cannot get events';
	}
	const res = await sendRequest<GetEventsRequest, GetEventsResponse>({
		request: 'GET_EVENTS',
		matchId: id,
		eventTypes: ['CHAT', 'LOG'],
	});
	const chatEvents = res.events.filter((e) => e.type === 'CHAT');
	const logEvents = res.events.filter((e) => e.type === 'LOG');
	setGlobalStore('matches', existing, 'chatEvents', chatEvents);
	setGlobalStore('matches', existing, 'logEvents', logEvents);
};

const [connectionState, setConnectionState] = createSignal<'CLOSED' | 'AUTHED' | 'ANONYMOUS'>(
	'CLOSED'
);
export { connectionState };

const onEvent = (event: Event) => {
	if (event.type === 'MATCH_CREATE') {
		setGlobalStore('matches', (existing) => [...(existing ?? []), { data: event.match }]);
		return;
	}

	if (!globalStore.matches) {
		return;
	}
	const matchIndex = globalStore.matches.findIndex((m) => m.data.id === event.matchId);
	if (matchIndex < 0) {
		return;
	}
	const match = globalStore.matches[matchIndex];
	if (event.type === 'CHAT' && match.chatEvents) {
		setGlobalStore('matches', matchIndex, 'chatEvents', (existing) => [
			...(existing ?? []),
			event,
		]);
	} else if (event.type === 'LOG' && match.logEvents) {
		setGlobalStore('matches', matchIndex, 'logEvents', (existing) => [
			...(existing ?? []),
			event,
		]);
	} else if (event.type === 'MATCH_UPDATE') {
		(setGlobalStore as any)('matches', matchIndex, 'data', ...event.path, event.value);
	}
};

const [errorMessage, setErrorMessage] = createSignal('');

const onConnect = () => {
	if (!globalStore || !globalStore.matches || globalStore.matches.length === 0) {
		return;
	}

	// refetch all matches from global store to receive events again
	fetchMatches(
		globalStore.matches.map((m) => ({ id: m.data.id, secret: m.data.tmtSecret }))
	).catch((err) => setErrorMessage(err + ''));
};

const WebSocket = createWebSocket({
	onEvent: onEvent,
	afterConnect: onConnect,
	connect: true,
	autoReconnect: true,
});
export const sendRequest = WebSocket.sendRequest;

export const App: Component<RouteSectionProps> = (props) => {
	onMount(updateDarkClasses);

	createEffect(() => {
		const state = WebSocket.state();
		const token = getToken();
		if (state === 'OPEN' && !token) {
			setConnectionState('ANONYMOUS');
			return;
		}
		if (state === 'OPEN' && token) {
			sendRequest<AuthRequest>({
				request: 'AUTH',
				token: token,
			})
				.then(() => setConnectionState('AUTHED'))
				.catch((err) => setErrorMessage(err + ''));
			return;
		}
		if (state !== 'OPEN') {
			setConnectionState('CLOSED');
			return;
		}
	});

	return (
		<>
			<header class="sticky top-0 z-10 pb-8">
				<NavBar />
			</header>
			<main class="container mx-auto px-4">
				<ErrorComponent errorMessage={errorMessage()} />
				{props.children}
			</main>
			<footer class="pt-8"></footer>
		</>
	);
};
