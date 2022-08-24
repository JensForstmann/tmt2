import { Component, createResource, onCleanup } from 'solid-js';
import { Loader } from '../components/Loader';
import { MatchList } from '../components/MatchList';
import { IMatchResponse } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { useSearchParams } from '@solidjs/router';
import { ErrorComponent } from '../components/ErrorComponent';

export const MatchesPage: Component = () => {
	const [searchParams, setSearchParams] = useSearchParams<{ isLive?: string }>();
	const fetcher = createFetcher();
	const [matches] = createResource(
		() => searchParams.isLive ?? 'true',
		(s: string) => fetcher<IMatchResponse[]>('GET', `/api/matches?isLive=${s}`)
	);
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
