import { useParams, useSearchParams } from '@solidjs/router';
import { Component, createEffect, For, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { ChatEvent, escapeRconSayString, Event, IMatchResponse, LogEvent } from '../../../common';
import { Chat } from '../components/Chat';
import { GameServerCard } from '../components/GameServerCard';
import { Loader } from '../components/Loader';
import { LogViewer } from '../components/LogViewer';
import { MatchCard } from '../components/MatchCard';
import { MatchMapCard } from '../components/MatchMapCard';
import { NotLiveCard } from '../components/NotLiveCard';
import { PlayerListCard } from '../components/PlayerListCard';
import { Rcon } from '../components/Rcon';
import { createFetcher } from '../utils/fetcher';
import { createWebSocket } from '../utils/webSocket';

export const MatchPage: Component = () => {
	const params = useParams();
	const [searchParams] = useSearchParams();
	const fetcher = createFetcher(searchParams.secret);
	const [data, setData] = createStore<{
		match?: IMatchResponse;
		logEvents?: LogEvent[];
		chatEvents?: ChatEvent[];
	}>({});

	onMount(async () => {
		fetcher<IMatchResponse>('GET', `/api/matches/${params.id}`).then((match) => {
			setData('match', match);
		});
		fetcher<Event[]>('GET', `/api/matches/${params.id}/events`).then((events) => {
			if (!events) {
				return;
			}
			setData(
				'chatEvents',
				events.filter((event): event is ChatEvent => event.type === 'CHAT')
			);
			setData(
				'logEvents',
				events.filter((event): event is LogEvent => event.type === 'LOG')
			);
		});
	});

	const onWsMsg = (msg: Event) => {
		if (msg.type === 'CHAT') {
			setData('chatEvents', (existing) => [...(existing ?? []), msg]);
		} else if (msg.type === 'LOG') {
			setData('logEvents', (existing) => [...(existing ?? []), msg]);
		} else if (msg.type === 'MATCH_UPDATE') {
			(setData as any)('match', ...msg.path, msg.value);
		}
	};

	const { state, subscribe, disconnect, connect } = createWebSocket(onWsMsg, {
		autoReconnect: true,
	});

	createEffect(() => {
		if (data.match) {
			connect();
		}
	});

	createEffect(() => {
		if (state() === 'OPEN' && data.match) {
			subscribe({
				matchId: params.id,
				token: data.match.tmtSecret,
			});
		}
	});

	onCleanup(() => disconnect());

	const sendChatMessage = (msg: string) => {
		fetcher('POST', `/api/matches/${params.id}/server/rcon`, [
			`say ${escapeRconSayString(msg)}`,
		]);
	};

	return (
		<Show when={data.match} fallback={<Loader />}>
			{(match) => (
				<div class="space-y-5">
					<Show when={!match().isLive}>
						<NotLiveCard match={match()} />
					</Show>
					<MatchCard match={match()} />
					<For each={match().matchMaps}>
						{(map, i) => <MatchMapCard match={match()} map={map} mapIndex={i()} />}
					</For>
					<GameServerCard match={match()} />
					<PlayerListCard match={match()} />
					<Show when={data.chatEvents}>
						<Chat messages={data.chatEvents!} sendMessage={sendChatMessage} />
					</Show>
					<Show when={data.logEvents}>
						<LogViewer logs={data.logEvents!} />
					</Show>
					<Rcon match={match()} />
				</div>
			)}
		</Show>
	);
};
