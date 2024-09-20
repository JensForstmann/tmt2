import { useNavigate, useSearchParams } from '@solidjs/router';
import { Component, Show } from 'solid-js';
import { IMatchResponse, IMatchUpdateDto, getMapDraws, getMapScore } from '../../../common';
import { SvgCopyAll } from '../assets/Icons';
import { copyToClipboard } from '../utils/copyToClipboard';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { mustConfirm } from '../utils/mustConfirm';
import { Card } from './Card';
import { CardMenu } from './CardMenu';
import { TextInput } from './Inputs';
import { Modal } from './Modal';

export const MatchCard: Component<{
	match: IMatchResponse;
}> = (props) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const fetcher = createFetcher(props.match.tmtSecret);
	const patchMatch = (dto: IMatchUpdateDto) =>
		fetcher('PATCH', `/api/matches/${props.match.id}`, dto);
	const stop = () =>
		fetcher('DELETE', `/api/matches/${props.match.id}`).finally(() => location.reload());
	const restartElection = () => patchMatch({ _restartElection: true });
	const init = () => patchMatch({ _init: true });
	const setup = () => patchMatch({ _setup: true });
	const l = window.location;
	const shareLink = l.protocol + '//' + l.host + l.pathname + '?secret=' + props.match.tmtSecret;
	let modalRef: HTMLDialogElement | undefined;

	const goToEditPage = () =>
		navigate(
			`/matches/${props.match.id}/edit` +
				(searchParams.secret ? `?secret=${searchParams.secret}` : '')
		);

	return (
		<Card class="text-center">
			<CardMenu
				show
				entries={
					props.match.isLive
						? [
								[t('stop'), mustConfirm(stop)],
								[t('restart election'), mustConfirm(restartElection)],
								[t('init'), init],
								[t('setup'), setup],
								[t('share match with token'), () => modalRef?.showModal()],
								[t('edit match'), goToEditPage],
							]
						: [
								[t('share match with token'), () => modalRef?.showModal()],
								[t('edit match'), goToEditPage],
							]
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
			<Modal ref={modalRef}>
				<div class="space-y-6">
					<p>{t('Copy & share the link below.')}</p>
					<div class="flex">
						<TextInput
							value={shareLink}
							class="bg-base-300 w-full"
							containerClass="w-full"
						/>
						<button class="btn ml-4" onClick={() => copyToClipboard(shareLink)}>
							<SvgCopyAll />
						</button>
					</div>
					<p>{t('Warning: The link gives full admin access to (only) this match.')}</p>
				</div>
			</Modal>
		</Card>
	);
};
