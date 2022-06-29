import { Component, createSignal } from 'solid-js';
import { IMatch, IMatchUpdateDto } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { mustConfirm } from '../utils/mustConfirm';
import { Card } from './Card';
import { Modal } from './Modal';
import { RoundBackups } from './RoundBackups';

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

	const [showModal, setShowModal] = createSignal(false);

	return (
		<Card>
			<h2 class="font-bold text-lg">{t('Actions')}</h2>
			<div class="space-x-10">
				<button onClick={revive}>{t('revive')}</button>
				<button onClick={mustConfirm(stop)}>{t('stop')}</button>
				<button onClick={setCurrentMap}>{t('setCurrentMap')}</button>
				<button onClick={restartElection}>{t('restartElection')}</button>
				<button onClick={mustConfirm(init)}>{t('init')}</button>
				<button onClick={mustConfirm(setup)}>{t('setup')}</button>
				<button onClick={() => setShowModal(true)}>{t('loadRoundBackup')}</button>
			</div>
			<Modal show={showModal()} onBackdropClick={() => setShowModal(false)}>
				<div class="text-left">
					<RoundBackups match={props.match} onClose={() => setShowModal(false)} />
				</div>
				<button onClick={() => setShowModal(false)}>{t('close')}</button>
			</Modal>
		</Card>
	);
};
