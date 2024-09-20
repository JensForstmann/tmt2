import { Component, createSignal, Show } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { Card } from './Card';
import { ErrorComponent } from './ErrorComponent';

export const NotLiveCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const reload = () => location.reload();

	const [reviveErrorMessage, setReviveErrorMessage] = createSignal('');
	const revive = () =>
		fetcher('PATCH', `/api/matches/${props.match.id}/revive`)
			.then(reload)
			.catch((err) => setReviveErrorMessage(err + ''));

	const [stopErrorMessage, setStopErrorMessage] = createSignal('');
	const stop = () =>
		fetcher('DELETE', `/api/matches/${props.match.id}`)
			.then(reload)
			.catch((err) => setStopErrorMessage(err + ''));

	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('Match is not live')}</h2>
			<p>{t('This match is not being supervised.')}</p>
			<ErrorComponent errorMessage={reviveErrorMessage()} />
			<div class="h-4"></div>
			<button class="btn" onClick={revive}>
				{t('Start Supervising')}
			</button>

			<Show when={!props.match.isStopped}>
				<div class="h-4"></div>
				<p>
					{t('This match was not stopped properly.')}
					<br />
					{t('The next time TMT starts, it will try to supervise it again.')}
					<br />
					{t('Stop it to prevent supervising retries.')}
				</p>
				<ErrorComponent errorMessage={stopErrorMessage()} />
				<div class="h-4"></div>
				<button class="btn" onClick={stop}>
					{t('Stop Supervising')}
				</button>
			</Show>
		</Card>
	);
};
