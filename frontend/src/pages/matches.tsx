import { Component, createResource } from 'solid-js';
import { Loader } from '../components/Loader';
import { MatchList } from '../components/MatchList';
import { IMatch } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { useSearchParams } from 'solid-app-router';

export const MatchesPage: Component = () => {
	const [searchParams, setSearchParams] = useSearchParams<{ isLive?: string }>();
	const fetcher = createFetcher();
	const [matches] = createResource<IMatch[], any>(
		() => searchParams.isLive ?? 'true',
		(s: string) => fetcher('GET', `/api/matches?isLive=${s}`)
	);
	return (
		<>
			<label>
				<input
					type="checkbox"
					checked={searchParams.isLive !== 'false'}
					onchange={(e) =>
						setSearchParams({ isLive: e.currentTarget.checked + '' }, { replace: true })
					}
				/>
				{t('live matches')}
			</label>
			{matches.loading ? <Loader /> : <MatchList matches={matches() ?? []} />}
		</>
	);
};
