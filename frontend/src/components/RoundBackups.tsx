import { Component, createResource, For, Match, Switch } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { mustConfirm } from '../utils/mustConfirm';
import { ErrorComponent } from './ErrorComponent';
import { Loader } from './Loader';

export const RoundBackups: Component<{
	match: IMatchResponse;
	onClose?: () => void;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const [roundBackups] = createResource(() =>
		fetcher<{ latestFiles: string[]; total: number }>(
			'GET',
			`/api/matches/${props.match.id}/server/round_backups`
		)
	);
	const loadBackup = async (file: string) => {
		const success = await fetcher<boolean>(
			'POST',
			`/api/matches/${props.match.id}/server/round_backups/${file}`
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
					<ul>
						<For each={roundBackups.latestFiles}>
							{(file) => (
								<li
									class="break-words"
									onClick={mustConfirm(() => loadBackup(file))}
								>
									{file.replace(
										`round_backup_${props.match.id.toLowerCase()}_`,
										''
									)}
								</li>
							)}
						</For>
					</ul>
				)}
			</Match>
			<Match when={roundBackups.loading}>
				<Loader />
			</Match>
		</Switch>
	);
};
