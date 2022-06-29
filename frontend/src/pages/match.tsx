import { useParams, useSearchParams } from 'solid-app-router';
import { Component, createEffect, For, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { ChatEvent, escapeRconSayString, Event, IMatchResponse, LogEvent } from '../../../common';
import { Chat } from '../components/Chat';
import { GameServerCard } from '../components/GameServerCard';
import { Loader } from '../components/Loader';
import { LogViewer } from '../components/LogViewer';
import { MatchActionPanel } from '../components/MatchActionPanel';
import { MatchCard } from '../components/MatchCard';
import { MatchMapCard } from '../components/MatchMapCard';
import { PlayerListCard } from '../components/PlayerListCard';
import { createFetcher } from '../utils/fetcher';
import { createWebsocket } from '../utils/websocket';

export const MatchPage: Component = () => {
	const params = useParams();
	const [searchParams] = useSearchParams();
	const [data, setData] = createStore<{
		match?: IMatchResponse;
		logEvents?: LogEvent[];
		chatEvents?: ChatEvent[];
	}>({});
	const fetcher = createFetcher(searchParams.secret);
	const setMatchData = () =>
		fetcher<IMatchResponse>('GET', `/api/matches/${params.id}`).then((match) => {
			setData('match', match);
		});
	const timer = setInterval(setMatchData, 10000);
	onCleanup(() => clearInterval(timer));

	onMount(async () => {
		setMatchData();
		fetcher<Event[]>('GET', `/api/matches/${params.id}/events`).then((events) => {
			if (!events) {
				return;
			}
			setData('chatEvents', [
				...(data.chatEvents ?? []),
				...events.filter((event): event is ChatEvent => event.type === 'CHAT'),
			]);
			setData('logEvents', [
				...(data.logEvents! ?? []),
				...events.filter((event): event is LogEvent => event.type === 'LOG'),
			]);
		});
	});

	const onWsMsg = (msg: Event) => {
		console.log('onWsMsg', msg.type, msg);

		if (msg.type === 'CHAT') {
			setData('chatEvents', (x) => [...(x ?? []), msg]);
		} else if (msg.type === 'LOG') {
			setData('logEvents', [...(data.logEvents ?? []), msg]);
		} else if (msg.type === 'MAP_ELECTION_END') {
			setData('match', 'state', 'MATCH_MAP');
		} else if (msg.type === 'KNIFE_END') {
			setData('match', 'matchMaps', msg.mapIndex, 'state', 'AFTER_KNIFE');
			// setData('match', 'matchMaps', msg.mapIndex, 'knifeWinner', msg.); // TODO: set knife winner
		} else if (msg.type === 'ROUND_END') {
			setData('match', 'matchMaps', msg.mapIndex, 'score', 'teamA', msg.scoreTeamA);
			setData('match', 'matchMaps', msg.mapIndex, 'score', 'teamB', msg.scoreTeamB);
		} else if (msg.type === 'MAP_START') {
			setData('match', 'matchMaps', msg.mapIndex, 'state', 'IN_PROGRESS');
		} else if (msg.type === 'MAP_END') {
			setData('match', 'matchMaps', msg.mapIndex, 'state', 'FINISHED');
		} else if (msg.type === 'MATCH_END') {
			setData('match', 'state', 'FINISHED');
		}
	};

	const { state, subscribe, disconnect, connect } = createWebsocket(onWsMsg, {
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
		<div class="space-y-5 mt-5 mb-16">
			<Switch>
				<Match when={!data.match}>
					<Loader />
				</Match>
				<Match when={data.match}>
					{(match) => (
						<>
							<MatchActionPanel match={match} />
							<MatchCard match={match} />
							<For each={match.matchMaps}>
								{(map, i) => (
									<MatchMapCard
										map={map}
										match={match}
										isCurrent={match.currentMap === i()}
									/>
								)}
							</For>
							<GameServerCard match={match} />
							<PlayerListCard match={match} />
							<Show when={data.chatEvents}>
								<Chat messages={data.chatEvents!} sendMessage={sendChatMessage} />
							</Show>
							<Show when={data.logEvents}>
								<LogViewer logs={data.logEvents!} />
							</Show>
						</>
					)}
				</Match>
			</Switch>
		</div>
	);
};
