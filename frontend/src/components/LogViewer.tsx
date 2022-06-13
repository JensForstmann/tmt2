import { Component, For } from 'solid-js';
import { LogEvent } from '../../../common';
import { t } from '../utils/locale';
import classes from './LogViewer.module.scss';

export const LogViewer: Component<{
	logs: LogEvent[];
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Logs')}</h2>
				<div class={classes.content}>
					<div>
						<For each={props.logs}>
							{(log) => (
								<>
									{eventToString(log)}
									<br />
								</>
							)}
						</For>
					</div>
				</div>
			</div>
		</>
	);
};

const eventToString = (e: LogEvent) => {
	return `${new Date(e.timestamp).toLocaleTimeString()}: ${e.message}`;
};
