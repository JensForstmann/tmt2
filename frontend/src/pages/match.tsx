import { useParams, useSearchParams } from '@solidjs/router';
import { Component, createEffect, For, Show } from 'solid-js';
import { connectionState, fetchMatch, fetchMatchEvents, globalStore } from '../App';
import { Chat } from '../components/Chat';
import { MatchGameServerCard } from '../components/GameServerCard';
import { Loader } from '../components/Loader';
import { LogViewer } from '../components/LogViewer';
import { MatchCard } from '../components/MatchCard';
import { MatchMapCard } from '../components/MatchMapCard';
import { NeedsAttentionCard } from '../components/NeedsAttentionCard';
import { NotLiveCard } from '../components/NotLiveCard';
import { PlayerListCard } from '../components/PlayerListCard';
import { Rcon } from '../components/Rcon';

export const MatchPage: Component = () => {
	const params = useParams();
	const [searchParams] = useSearchParams();
	const secret = () =>
		typeof searchParams.secret === 'string' ? searchParams.secret : undefined;
	const match = () => globalStore.matches?.find((m) => m.data.id === params.id)?.data;
	const logEvents = () => globalStore.matches?.find((m) => m.data.id === params.id)?.logEvents;
	const chatEvents = () => globalStore.matches?.find((m) => m.data.id === params.id)?.chatEvents;

	createEffect(async () => {
		const state = connectionState();
		const m = match();
		const l = logEvents();
		const s = secret();
		const canFetch = state === 'AUTHED' || (state === 'ANONYMOUS' && s);
		if ((m && l) || !canFetch) {
			return;
		}
		if (!m && params.id) {
			fetchMatch(params.id, s);
			return;
		}
		if (!l && params.id) {
			fetchMatchEvents(params.id);
		}
	});

	return (
		<Show when={match()} fallback={<Loader />}>
			{(match) => (
				<div class="space-y-5">
					<Show when={!match().isLive}>
						<NotLiveCard match={match()} />
					</Show>
					<Show when={match().isLive && match().needsAttentionSince !== null}>
						<NeedsAttentionCard match={match()} />
					</Show>
					<MatchCard match={match()} />
					<For each={match().matchMaps}>
						{(map, i) => <MatchMapCard match={match()} map={map} mapIndex={i()} />}
					</For>
					<MatchGameServerCard match={match()} />
					<PlayerListCard match={match()} />
					<Show when={chatEvents()}>
						<Chat matchId={match().id} messages={chatEvents()!} secret={secret()} />
					</Show>
					<Show when={logEvents()}>
						<LogViewer logs={logEvents()!} />
					</Show>
					<Rcon match={match()} />
				</div>
			)}
		</Show>
	);
};
