import { useParams, useSearchParams } from 'solid-app-router';
import { Component, createEffect, createSignal, For, Match, onCleanup, Switch } from 'solid-js';
import {
	ChatEvent,
	Event,
	getTotalNumberOfMaps,
	isElectionStepAdd,
	LogEvent,
} from '../../../common';
import { Chat } from '../components/Chat';
import { Error as ErrorComponent } from '../components/Error';
import { GameServerCard } from '../components/GameServerCard';
import { Loader } from '../components/Loader';
import { LogViewer } from '../components/LogViewer';
import { MatchActionPanel } from '../components/MatchActionPanel';
import { MatchCard } from '../components/MatchCard';
import { MatchMapCard } from '../components/MatchMapCard';
import { PlayerListCard } from '../components/PlayerListCard';
import { useMatch } from '../utils/fetcher';
import { createWebsocket } from '../utils/websocket';

export const MatchPage: Component = () => {
	const params = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const { resource: match, patcher, mutate, fetcher } = useMatch(params.id, searchParams.secret);
	const [logEvents, setLogEvents] = createSignal<LogEvent[]>([]);
	const [chatEvents, setChatEvents] = createSignal<ChatEvent[]>([]);

	fetcher('GET', `/api/matches/${params.id}/events`).then((events: Event[]) => {
		setChatEvents([
			...chatEvents(),
			...events.filter((event): event is ChatEvent => event.type === 'CHAT'),
		]);
		setLogEvents([
			...logEvents(),
			...events.filter((event): event is LogEvent => event.type === 'LOG'),
		]);
	});

	const onWsMsg = (msg: Event) => {
		console.log(msg);
		const m = match();
		if (!m) {
			return;
		}

		if (msg.type === 'CHAT') {
			setChatEvents([...chatEvents(), msg]);
		} else if (msg.type === 'LOG') {
			setLogEvents([...logEvents(), msg]);
		}
	};

	const { state, subscribe, disconnect, connect } = createWebsocket(onWsMsg, {
		autoReconnect: true,
	});

	createEffect(() => {
		if (match()) {
			connect();
		}
	});

	createEffect(() => {
		const m = match();
		if (state() === 'OPEN' && m) {
			subscribe({
				matchId: params.id,
				token: m.tmtSecret,
			});
		}
	});

	onCleanup(() => disconnect());

	const sendChatMessage = (msg: string) => {
		fetcher('POST', `/api/matches/${params.id}/server/rcon`, [`say ${msg.replace(/;/g, '')}`]);
	};

	return (
		<>
			<Switch>
				<Match when={match.error || match() instanceof Error}>
					<ErrorComponent />
				</Match>
				<Match when={match() !== undefined}>
					<MatchActionPanel match={match()!} />
					<MatchCard match={match()!} />
					<For each={match()?.matchMaps}>
						{(map, i) => (
							<MatchMapCard
								map={map}
								match={match()!}
								isCurrent={match()!.currentMap === i()}
							/>
						)}
					</For>
					<GameServerCard match={match()!} />
					<PlayerListCard match={match()!} />
					<Chat messages={chatEvents()} sendMessage={sendChatMessage} />
					<LogViewer logs={logEvents()} />
					<pre>{JSON.stringify(match(), null, '    ')}</pre>
				</Match>
				<Match when={match.loading}>
					<Loader />
				</Match>
			</Switch>
		</>
	);
};
