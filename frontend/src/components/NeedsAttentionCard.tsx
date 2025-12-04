import { Component, createSignal } from 'solid-js';
import { IMatchResponse, IMatchUpdateDto } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { Card } from './Card';
import { ErrorComponent } from './ErrorComponent';

export const NeedsAttentionCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);

	const [errorMessage, setErrorMessage] = createSignal('');
	const unsetNeedsAttention = () =>
		fetcher('PATCH', `/api/matches/${props.match.id}`, {
			needsAttentionSince: null,
		} satisfies IMatchUpdateDto).catch((err) => setErrorMessage(err + ''));

	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('Match needs attention')}</h2>
			<p>{t('An admin was called by a player.')}</p>
			<ErrorComponent errorMessage={errorMessage()} />
			<div class="h-4"></div>
			<button class="btn" onClick={unsetNeedsAttention}>
				{t('All is good. Reset attention flag.')}
			</button>
		</Card>
	);
};
