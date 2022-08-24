import { useSearchParams } from '@solidjs/router';
import { Component, createResource, onCleanup, onMount } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { ErrorComponent } from '../components/ErrorComponent';
import { Loader } from '../components/Loader';
import { MatchList } from '../components/MatchList';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';

export const MatchesPage: Component = () => {
	const [searchParams, setSearchParams] = useSearchParams<{ isLive?: string }>();
	const fetcher = createFetcher();
	const [matches, { refetch }] = createResource(
		() => searchParams.isLive ?? 'true',
		(s: string) => fetcher<IMatchResponse[]>('GET', `/api/matches?isLive=${s}`)
	);

	let interval: number;
	onMount(() => {
		interval = setInterval(refetch, 10000);
	});
	onCleanup(() => {
		clearInterval(interval);
	});

	return (
		<>
			<div class="mx-auto p-4 text-center">
				<label>
					<input
						type="checkbox"
						checked={searchParams.isLive !== 'false'}
						onchange={(e) =>
							setSearchParams(
								{ isLive: e.currentTarget.checked + '' },
								{ replace: true }
							)
						}
					/>
					<span class="ml-1">{t('live matches')}</span>
				</label>
			</div>
			{matches.error ? (
				<ErrorComponent />
			) : matches.loading ? (
				<Loader />
			) : matches() === undefined ? (
				<ErrorComponent />
			) : (
				<MatchList matches={matches() ?? []} />
			)}
		</>
	);
};
