import { useNavigate } from '@solidjs/router';
import { Component, createSignal, Show } from 'solid-js';
import {
	getMapDraws,
	getMapScore,
	IMatchResponse,
	IMatchUpdateDto,
	TMatchSate,
} from '../../../common';
import { SvgCopyAll } from '../assets/Icons';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { mustConfirm } from '../utils/mustConfirm';
import { Card } from './Card';
import { CardMenu } from './CardMenu';
import { Modal } from './Modal';
import { TextInput } from './TextInput';

export const MatchCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	const navigate = useNavigate();
	const [showShareModal, setShowShareModal] = createSignal(false);
	const fetcher = createFetcher(props.match.tmtSecret);
	const patchMatch = (dto: IMatchUpdateDto) =>
		fetcher('PATCH', `/api/matches/${props.match.id}`, dto);
	const stop = () => fetcher('DELETE', `/api/matches/${props.match.id}`);
	const restartElection = () => patchMatch({ _restartElection: true });
	const init = () => patchMatch({ _init: true });
	const setup = () => patchMatch({ _setup: true });
	const revive = () => fetcher('PATCH', `/api/matches/${props.match.id}/revive`);
	const changeState = () => {
		const response = prompt(t('enter state'), 'MATCH_MAP');
		if (response) {
			patchMatch({
				state: response as TMatchSate,
			});
		}
	};
	const l = window.location;
	const shareLink = l.protocol + '//' + l.host + l.pathname + '?secret=' + props.match.tmtSecret;

	return (
		<Card>
			<CardMenu
				show
				entries={
					props.match.isLive
						? [
								[t('stop'), mustConfirm(stop)],
								[t('restart election'), mustConfirm(restartElection)],
								[t('init'), init],
								[t('setup'), setup],
								[t('change state'), changeState],
								[t('share match with token'), () => setShowShareModal(true)],
								[
									t('edit match'),
									() => navigate(`/matches/${props.match.id}/edit`),
								],
						  ]
						: [[t('revive'), mustConfirm(revive)]]
				}
			/>
			<h2 class="text-lg font-bold">{t('Map Wins')}</h2>
			<p class="flex basis-1/3 items-center justify-center space-x-5">
				<span class="flex-1 text-right">{props.match.teamA.name}</span>
				<span class="text-5xl">
					{getMapScore(props.match, 'TEAM_A')}
					{' : '}
					{getMapScore(props.match, 'TEAM_B')}
				</span>
				<span class="flex-1 text-left">{props.match.teamB.name}</span>
			</p>
			<Show when={getMapDraws(props.match) > 0}>
				<span class="shrink-0 grow">
					<br />
					{` (${getMapDraws(props.match)} ${t('draws')})`}
				</span>
			</Show>
			<p>{t(props.match.state)}</p>
			<Modal show={showShareModal()} onBackdropClick={() => setShowShareModal(false)}>
				<div class="space-y-6">
					<p>{t('Copy & share the link below.')}</p>
					<div class="flex">
						<TextInput value={shareLink} />
						<button
							class="ml-4"
							onClick={() => navigator.clipboard.writeText(shareLink)}
						>
							<SvgCopyAll />
						</button>
					</div>
					<p>{t('Warning: The link gives full admin access to (only) this match.')}</p>
					<button onClick={() => setShowShareModal(false)}>{t('close')}</button>
				</div>
			</Modal>
		</Card>
	);
};
