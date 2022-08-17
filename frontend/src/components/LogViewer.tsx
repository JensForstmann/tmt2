import { Component } from 'solid-js';
import { LogEvent } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';
import { ScrollArea } from './ScrollArea';

export const LogViewer: Component<{
	logs: LogEvent[];
}> = (props) => {
	return (
		<Card>
			<h2 class="text-lg font-bold">{t('Logs')}</h2>
			<ScrollArea scroll>{props.logs.map(formatLogEvent)}</ScrollArea>
		</Card>
	);
};

const formatLogEvent = (e: LogEvent) => {
	const d = new Date(e.timestamp);
	return (
		<>
			<span title={d.toLocaleString()}>{d.toLocaleTimeString()}</span>
			{`: ${e.message}`}
		</>
	);
};
