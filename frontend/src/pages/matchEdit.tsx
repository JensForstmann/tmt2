import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Component, Show, createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { IMatchResponse } from '../../../common';
import { Loader } from '../components/Loader';
import { MatchEditCard } from '../components/MatchEditCard';
import { NotLiveCard } from '../components/NotLiveCard';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';

export const MatchEditPage: Component = () => {
	const navigate = useNavigate();
	const params = useParams();
	const [searchParams] = useSearchParams();
	const fetcher = createFetcher(searchParams.secret);
	const [data, setData] = createStore<{
		match?: IMatchResponse;
	}>({});
	const [err, setErr] = createSignal('');

	onMount(async () => {
		fetcher<IMatchResponse>('GET', `/api/matches/${params.id}`).then((match) => {
			setData('match', match);
		});
	});

	return (
		<>
			<a href={`/matches/${params.id}`}>{t('back to match')}</a>
			<Show when={data.match} fallback={<Loader />}>
				{(match) => (
					<div class="mt-5 mb-16 space-y-5">
						<Show when={!match().isLive}>
							<NotLiveCard match={match()} />
						</Show>
						<Show when={match().isLive}>
							<MatchEditCard
								match={match()}
								onUpdate={async (dto) => {
									fetcher('PATCH', `/api/matches/${params.id}`, dto)
										.then(() => navigate(`/matches/${params.id}`))
										.catch((err) => setErr(err + ''));
								}}
							/>
							<Show when={err()}>
								<div>{err()}</div>
							</Show>
						</Show>
					</div>
				)}
			</Show>
		</>
	);
};
