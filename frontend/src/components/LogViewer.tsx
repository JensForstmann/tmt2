import { Component, For } from 'solid-js';
import { LogEvent } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';

export const LogViewer: Component<{
	logs: LogEvent[];
}> = (props) => {
	return (
		<Card>
			<h2 class="font-bold text-lg">{t('Logs')}</h2>
			<div class="h-80 overflow-scroll text-left flex flex-col-reverse bg-gray-50">
				<div>
					<For each={props.logs}>
						{(log) => (
							<>
								{eventToString(log)}
								<br />
							</>
						)}
					</For>
					<br />
				</div>
			</div>
		</Card>
	);
};

const eventToString = (e: LogEvent) => {
	return `${new Date(e.timestamp).toLocaleTimeString()}: ${e.message}`;
};
