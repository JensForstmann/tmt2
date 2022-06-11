import { Component, createResource } from 'solid-js';
import { Loader } from '../components/Loader';
import { MatchList } from '../components/MatchList';
import { IMatch } from '../../../common';
import { fetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { useSearchParams } from 'solid-app-router';

export const MatchesPage: Component = () => {
	const [searchParams, setSearchParams] = useSearchParams<{ isStopped?: string }>();
	const [matches] = createResource<IMatch[], any>(
		() => searchParams.isStopped ?? 'false',
		(s: string) => fetcher(`/api/matches?isStopped=${s}`)
	);
	return (
		<>
			<input
				type="checkbox"
				checked={searchParams.isStopped === 'true'}
				value="true"
				onchange={(e) =>
					setSearchParams({ isStopped: e.currentTarget.checked + '' }, { replace: true })
				}
			/>
			{matches.loading ? <Loader /> : <MatchList matches={matches() ?? []} />}
		</>
	);
};
