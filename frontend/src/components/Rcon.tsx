import { Component, createSignal } from 'solid-js';
import { IMatchResponse } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import { Card } from './Card';
import { ErrorComponent } from './ErrorComponent';
import { TextInput } from './Inputs';
import { ScrollArea } from './ScrollArea';

const formatRconResponse = (response: string): string[] => {
	return response.trim().split('\n');
};

const RconCard: Component<{
	exec: (commands: string[]) => Promise<string[] | undefined>;
}> = (props) => {
	const execRcon = async (command: string) => {
		setHistory([command, ...history()].filter((v, i, arr) => arr.indexOf(v) === i));
		setHistoryIndex(-1);
		setNotSent('');
		setErrorMessage('');
		try {
			const response = await props.exec([command]);
			if (response) {
				const newLines = response.reduce((pv: string[], cv) => {
					return [...pv, ...formatRconResponse(cv)];
				}, []);
				setOutput([...output(), command, ...newLines]);
			} else {
				setOutput([...output(), command, 'error']);
			}
		} catch (err) {
			if (typeof err === 'string') {
				setErrorMessage(err);
			}
		}
	};
	const [output, setOutput] = createSignal<string[]>([]);
	const [history, setHistory] = createSignal<string[]>([]);
	const [historyIndex, setHistoryIndex] = createSignal(-1);
	const [notSent, setNotSent] = createSignal('');
	const [errorMessage, setErrorMessage] = createSignal('');

	const saveNotSent = (value: string) => {
		if (historyIndex() === -1) {
			setNotSent(value);
		}
	};

	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('RCON')}</h2>
			<ScrollArea scroll>{output()}</ScrollArea>
			<div class="h-4"></div>
			<TextInput
				type="text"
				onKeyDown={onEnter(
					(e) => {
						const command = e.currentTarget.value.trim();
						if (command) {
							execRcon(command);
							e.currentTarget.value = '';
						}
					},
					(e) => {
						if (e.key === 'ArrowUp') {
							saveNotSent(e.currentTarget.value);
							setHistoryIndex(Math.min(history().length - 1, historyIndex() + 1));
							e.currentTarget.value = history()[historyIndex()];
							e.preventDefault();
						} else if (e.key === 'ArrowDown') {
							saveNotSent(e.currentTarget.value);
							setHistoryIndex(Math.max(-1, historyIndex() - 1));
							e.currentTarget.value = history()[historyIndex()] ?? notSent();
							e.preventDefault();
						}
					}
				)}
				placeholder={t('Execute RCON command...')}
			/>
			<ErrorComponent errorMessage={errorMessage()} />
		</Card>
	);
};

export const Rcon: Component<{
	match: IMatchResponse;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	return (
		<RconCard
			exec={(commands) =>
				fetcher<string[]>('POST', `/api/matches/${props.match.id}/server/rcon`, commands)
			}
		/>
	);
};

export const RconServer: Component<{
	ip: string;
	port: number;
}> = (props) => {
	const fetcher = createFetcher();
	return (
		<RconCard
			exec={(commands) =>
				fetcher<string[]>('POST', `/api/gameservers/${props.ip}/${props.port}`, commands)
			}
		/>
	);
};
