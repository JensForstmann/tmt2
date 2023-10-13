import { Component, createSignal } from 'solid-js';
import {
	IMatchMap,
	IMatchMapUpdateDto,
	IMatchResponse,
	IMatchUpdateDto,
	TMatchMapSate,
	TTeamAB,
	TTeamSides,
	getCurrentTeamSideAndRoundSwitch,
} from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { mustConfirm } from '../utils/mustConfirm';
import { Card } from './Card';
import { CardMenu } from './CardMenu';
import { Modal } from './Modal';
import { RoundBackups } from './RoundBackups';

export const MatchMapCard: Component<{
	match: IMatchResponse;
	map: IMatchMap;
	mapIndex: number;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const patchMatch = (dto: IMatchUpdateDto) =>
		fetcher('PATCH', `/api/matches/${props.match.id}`, dto);
	const patchMatchMap = (dto: IMatchMapUpdateDto) =>
		fetcher('PATCH', `/api/matches/${props.match.id}/matchMap/${props.mapIndex}`, dto);
	const loadThisMap = () =>
		patchMatch({
			currentMap: props.mapIndex,
		});
	const changeMapName = () => {
		const response = prompt(t('enter map name'), 'de_anubis');
		if (response) {
			patchMatchMap({
				name: response,
			});
		}
	};
	const changeMapState = () => {
		const response = prompt(t('enter map state'), 'PENDING');
		if (response) {
			patchMatchMap({
				state: response as TMatchMapSate,
			});
		}
	};
	const switchTeamInternals = () => {
		patchMatchMap({
			_switchTeamInternals: true,
		});
	};
	const [roundBackupFiles, setRoundBackupFiles] = createSignal<string[]>();
	const loadRoundBackupFiles = async () => {
		const resp = await fetcher<{ latestFiles: string[]; total: number }>(
			'GET',
			`/api/matches/${props.match.id}/server/round_backups?count=15`
		);
		if (resp) {
			setRoundBackupFiles(resp.latestFiles);
		}
	};
	const openRoundBackup = () => {
		loadRoundBackupFiles();
		modalRef?.showModal();
	};

	let modalRef: HTMLDialogElement | undefined;

	const teamSide = (team: TTeamAB): false | TTeamSides => {
		if (props.match.currentMap !== props.mapIndex || props.map.state === 'FINISHED') {
			return false;
		}
		return getCurrentTeamSideAndRoundSwitch(props.map).currentCtTeamAB === team ? 'CT' : 'T';
	};
	const teamASide = teamSide('TEAM_A');
	const teamBSide = teamSide('TEAM_B');

	return (
		<Card class="text-center">
			<CardMenu
				show={props.match.isLive}
				entries={[
					[t('change map name'), changeMapName],
					[t('change map state'), changeMapState],
					props.match.currentMap === props.mapIndex
						? [t('load round backup'), openRoundBackup]
						: [t('switch to this map'), mustConfirm(loadThisMap)],
					[t('switch team internals'), switchTeamInternals],
				]}
			/>
			<h3 class="text-base font-light">{props.map.name}</h3>
			<p class="flex basis-1/3 items-center justify-center space-x-5">
				<span class="flex-1 text-right">
					{teamASide && <div class="badge badge-neutral">{teamASide}</div>}{' '}
					{props.match.teamA.name}
				</span>
				<span class="text-center text-2xl">
					{props.map.score.teamA}
					{' : '}
					{props.map.score.teamB}
				</span>
				<span class="flex-1 text-left">
					{props.match.teamB.name}{' '}
					{teamBSide && <div class="badge badge-neutral">{teamBSide}</div>}
				</span>
			</p>
			<p>
				<span>{t(props.map.state)}</span>
			</p>
			<Modal ref={modalRef} onClose={() => setRoundBackupFiles(undefined)}>
				<h4>{t('Load Round Backup')}</h4>
				<div class="text-left">
					<RoundBackups
						match={props.match}
						onClose={() => modalRef?.close()}
						roundBackupFiles={roundBackupFiles()}
					/>
				</div>
			</Modal>
		</Card>
	);
};
