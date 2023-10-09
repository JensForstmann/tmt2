import { Component, createResource, createSignal, For, Match, Switch } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { mustConfirm } from '../utils/mustConfirm';
import { ErrorComponent } from './ErrorComponent';
import { Loader } from './Loader';
import { SelectInput } from './SelectInput';
import { t } from '../utils/locale';

export const RoundBackups: Component<{
	match: IMatchResponse;
	onClose?: () => void;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const [selectedFile, setSelectedFile] = createSignal<string>();
	const [roundBackups] = createResource(() =>
		fetcher<{ latestFiles: string[]; total: number }>(
			'GET',
			`/api/matches/${props.match.id}/server/round_backups?count=15`
		)
	);
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
		<Switch>
			<Match when={roundBackups.error || roundBackups() instanceof Error}>
				<ErrorComponent />
			</Match>
			<Match when={roundBackups()}>
				{(roundBackups) => (
					<>
						<SelectInput
							value={selectedFile()}
							onInput={(e) => setSelectedFile(e.currentTarget.value)}
						>
							<option value="">{t('Select Round Backup File...')}</option>
							<For each={roundBackups().latestFiles}>
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
					</>
				)}
			</Match>
			<Match when={roundBackups.loading}>
				<Loader />
			</Match>
		</Switch>
	);
};
