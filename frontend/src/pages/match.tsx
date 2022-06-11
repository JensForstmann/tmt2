import { useParams } from 'solid-app-router';
import { Component, createSignal, ErrorBoundary, For, Match, Switch } from 'solid-js';
import { Error as ErrorComponent } from '../components/Error';
import { GameServerCard } from '../components/GameServerCard';
import { Loader } from '../components/Loader';
import { LogViewer } from '../components/LogViewer';
import { MatchCard } from '../components/MatchCard';
import { MatchMapCard } from '../components/MatchMapCard';
import { PlayerListCard } from '../components/PlayerListCard';
import { IMatch } from '../types/match';
import { fetchResource, useMatch } from '../utils/fetcher';

export const MatchPage: Component = () => {
	const params = useParams();
	const { resource: match, patcher } = useMatch(params.id);
	const [editable, setEditable] = createSignal(false);
	return (
		<>
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
					<LogViewer match={match()!} />
					<pre>{JSON.stringify(match(), null, '    ')}</pre>
				</Match>
				<Match when={match.loading}>
					<Loader />
				</Match>
			</Switch>
		</>
	);
};
