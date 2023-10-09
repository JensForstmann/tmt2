import { useSearchParams } from '@solidjs/router';
import { Component, createEffect, onCleanup, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, IMatchResponse } from '../../../common';
import { Card } from '../components/Card';
import { MatchList } from '../components/MatchList';
import { createFetcher, getToken } from '../utils/fetcher';
import { t } from '../utils/locale';
import { createWebSocket } from '../utils/webSocket';

export const MatchesPage: Component = () => {
	const [searchParams, setSearchParams] = useSearchParams<{ isLive?: string }>();
	const fetcher = createFetcher();
	const [data, setData] = createStore<{
		matches?: IMatchResponse[];
	}>({});

	createEffect(() => {
		fetcher<IMatchResponse[]>('GET', `/api/matches?isLive=${searchParams.isLive ?? true}`).then(
			(matches) => {
				setData('matches', matches);
			}
		);
	});

	const onWsMsg = (msg: Event) => {
		console.log('onWsMsg', msg.type, msg);
		if (msg.type === 'MATCH_UPDATE') {
			const mapIndex = data.matches?.findIndex((match) => match.id === msg.matchId);
			if (mapIndex !== undefined && mapIndex >= 0) {
				(setData as any)('matches', mapIndex, ...msg.path, msg.value);
			}
		} else if (msg.type === 'MATCH_CREATE') {
			if (msg.match.isLive === ((searchParams.isLive ?? 'true') === 'true')) {
				// only add to match list if filter matches
				setData('matches', (existing) => [...(existing ?? []), msg.match]);
			}
		}
	};

	const { state, subscribe, subscribeSys, unsubscribe, disconnect } = createWebSocket(onWsMsg, {
		autoReconnect: true,
		connect: true,
	});

	createEffect(() => {
		const token = getToken();
		if (state() === 'OPEN' && token) {
			subscribeSys(token);
		}
	});

	createEffect((previousSubs?: string[]): string[] => {
		const subs = previousSubs ?? [];
		if (state() === 'OPEN') {
			// unsubscribe
			subs.forEach((matchId) => {
				if (!data.matches?.find((match) => match.id === matchId)) {
					console.log(`unsub from ${matchId}`);
					unsubscribe(matchId);
				}
			});
			// subscribe
			data.matches?.forEach((match) => {
				if (!subs.includes(match.id)) {
					console.log(`sub to ${match.id}`);
					subscribe({
						matchId: match.id,
						token: match.tmtSecret,
					});
				}
			});
			// update subscription list
			return data.matches?.map((match) => match.id) ?? [];
		}
		return [];
	});

	onCleanup(() => disconnect());

	return (
		<Card>
			<div class="form-control mx-auto w-fit text-center">
				<label class="label cursor-pointer">
					<span class="label-text pr-4">{t('offline matches')}</span>
					<input
						type="checkbox"
						class="toggle"
						checked={searchParams.isLive !== 'false'}
						onchange={(e) =>
							setSearchParams(
								{ isLive: e.currentTarget.checked + '' },
								{ replace: true }
							)
						}
					/>
					<span class="label-text pl-4">{t('live matches')}</span>
				</label>
			</div>
			<Show when={data.matches}>{(matches) => <MatchList matches={matches()} />}</Show>
		</Card>
	);
};
