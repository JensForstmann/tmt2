import { Component, For } from 'solid-js';
import { IMatch, IMatchUpdateDto, LogEvent } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import classes from './MatchActionPanel.module.scss';

export const MatchActionPanel: Component<{
	match: IMatch;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const patchMatch = (dto: IMatchUpdateDto) =>
		fetcher('PATCH', `/api/matches/${props.match.id}`, dto);
	const revive = () => fetcher('PATCH', `/api/matches/${props.match.id}/revive`);
	const stop = () => fetcher('DELETE', `/api/matches/${props.match.id}`);
	const setCurrentMap = () => {
		const response = prompt(t('set current map'), '0');
		if (response) {
			fetcher('PATCH', `/api/matches/${props.match.id}`, {
				currentMap: parseInt(response),
			} as IMatchUpdateDto);
		}
	};
	const restartElection = () => patchMatch({ _restartElection: true });
	const init = () => patchMatch({ _init: true });
	const setup = () => patchMatch({ _setup: true });

	const mustConfirm =
		(fn: Function, msg = t('caution, please confirm')) =>
		() => {
			if (confirm(msg)) {
				fn();
			}
		};

	return (
		<div class={classes.card}>
			<h2>{t('Actions')}</h2>
			<button onClick={revive}>{t('revive')}</button>
			<button onClick={mustConfirm(stop)}>{t('stop')}</button>
			<button onClick={setCurrentMap}>{t('setCurrentMap')}</button>
			<button onClick={restartElection}>{t('restartElection')}</button>
			<button onClick={mustConfirm(init)}>{t('init')}</button>
			<button onClick={mustConfirm(setup)}>{t('setup')}</button>
		</div>
	);
};
