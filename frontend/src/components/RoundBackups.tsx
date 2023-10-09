import { Component, createSignal, For, Show } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { mustConfirm } from '../utils/mustConfirm';
import { Loader } from './Loader';
import { SelectInput } from './SelectInput';

export const RoundBackups: Component<{
	match: IMatchResponse;
	roundBackupFiles?: string[];
	onClose?: () => void;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const [selectedFile, setSelectedFile] = createSignal<string>();

	const loadBackup = async () => {
		const success = await fetcher<boolean>(
			'POST',
			`/api/matches/${props.match.id}/server/round_backups/${selectedFile()}`
		);
		if (success) {
			props.onClose?.();
		}
	};

	return (
		<Show when={props.roundBackupFiles} fallback={<Loader />}>
			<SelectInput
				value={selectedFile()}
				onInput={(e) => setSelectedFile(e.currentTarget.value)}
			>
				<option value="">{t('Select Round Backup File...')}</option>
				<For each={props.roundBackupFiles}>
					{(file) => (
						<option value={file}>
							{file.replace(`round_backup_${props.match.id}_`, '')}
						</option>
					)}
				</For>
			</SelectInput>
			<div class="text-center">
				<button
					class="btn btn-primary"
					onClick={() => selectedFile() && mustConfirm(() => loadBackup())()}
				>
					{t('Load Round Backup')}
				</button>
			</div>
		</Show>
	);
};
