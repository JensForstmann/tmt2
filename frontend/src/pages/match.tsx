import { useParams } from 'solid-app-router';
import { Component, createEffect, createSignal, For, Match, onCleanup, Switch } from 'solid-js';
import { Event } from '../../../common';
import { Error as ErrorComponent } from '../components/Error';
import { GameServerCard } from '../components/GameServerCard';
import { Loader } from '../components/Loader';
import { LogViewer } from '../components/LogViewer';
import { MatchCard } from '../components/MatchCard';
import { MatchMapCard } from '../components/MatchMapCard';
import { PlayerListCard } from '../components/PlayerListCard';
import { useMatch } from '../utils/fetcher';
import { createWebsocket } from '../utils/websocket';

export const MatchPage: Component = () => {
	const params = useParams();
	const { resource: match, patcher, mutate } = useMatch(params.id);
	const [logs, setLogs] = createSignal<string[]>([]);
	const onWsMsg = (msg: Event) => {
		console.log(msg);
		setLogs([...logs(), JSON.stringify(msg)]);
	};

	const { state, subscribe, disconnect } = createWebsocket(onWsMsg, {
		connect: true,
		autoReconnect: true,
	});
	createEffect(() => {
		if (state() === 'OPEN') {
			subscribe({
				matchId: params.id,
				token: '2Mgog6ATqAs495NtUQUsph',
			});
		}
	});
	onCleanup(() => disconnect());

	return (
		<>
			<p>{state()}</p>
			<Switch>
				<Match when={match.error || match() instanceof Error}>
					<ErrorComponent />
				</Match>
				<Match when={match() !== undefined}>
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
					<LogViewer match={match()!} logs={logs()} />
					<pre>{JSON.stringify(match(), null, '    ')}</pre>
				</Match>
				<Match when={match.loading}>
					<Loader />
				</Match>
			</Switch>
		</>
	);
};
