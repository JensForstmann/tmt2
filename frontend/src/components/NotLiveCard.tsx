import { Component } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { Card } from './Card';

export const NotLiveCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const revive = () => fetcher('PATCH', `/api/matches/${props.match.id}/revive`);
	return (
		<Card>
			<h2 class="text-lg font-bold">{t('Match is not live')}</h2>
			<p>
				{t('This match is not live (currently not tracked).')}
				<br />
				{t('To start tracking again, give it a revive:')}
			</p>
			<button onClick={revive}>{t('revive')}</button>
		</Card>
	);
};
