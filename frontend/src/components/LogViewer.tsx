import { Component, For, Index } from 'solid-js';
import { IMatch, IPlayer, LogEvent, TLogUnion } from '../../../common';
import { t } from '../utils/locale';
import classes from './LogViewer.module.scss';

export const LogViewer: Component<{
	logs: LogEvent[];
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Logs')}</h2>
				<pre>
					<For each={props.logs}>{(log) => eventToString(log) + '\n'}</For>
				</pre>
			</div>
		</>
	);
};

const eventToString = (e: LogEvent) => {
	return `${new Date(e.timestamp).toLocaleTimeString()}: ${e.message}`;
};
