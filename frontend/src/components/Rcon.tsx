import { Component, createSignal } from 'solid-js';
import { IMatch } from '../../../common';
import { SvgSend } from '../assets/Icons';
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

const commandHistory = () => {
	/** Do not store more commands than this number: */
	const limit = 100;
	let idx = -1;

	const getAll = (): string[] => {
		try {
			return JSON.parse(localStorage.getItem('rconHistory') ?? '[]');
		} catch (err) {
			return [];
		}
	};

	const get = () => {
		const all = getAll();
		console.log('pre idx', idx);
		if (idx < -1) {
			idx = -1;
		} else if (idx >= all.length) {
			idx = all.length - 1;
		}
		console.log('post idx', idx);
		return all[idx] ?? '';
	};

	const prev = () => {
		idx++;
		return get();
	};

	const next = () => {
		idx--;
		return get();
	};

	const add = (cmd: string) => {
		const deduplicated = getAll().filter((c) => c !== cmd);
		deduplicated.unshift(cmd);
		if (deduplicated.length > limit) {
			deduplicated.length = limit;
		}
		localStorage.setItem('rconHistory', JSON.stringify(deduplicated));
		idx = -1;
	};

	return {
		add,
		prev,
		next,
	};
};

const RconCard: Component<{
	exec: (commands: string[]) => Promise<string[] | undefined>;
}> = (props) => {
	const hist = commandHistory();

	const execRcon = async () => {
		const cmd = command().trim();
		if (cmd.trim() === '') {
			return;
		}

		setErrorMessage('');
		try {
			const response = await props.exec([cmd]);
			if (response) {
				hist.add(cmd);
				setCommand('');
				const newLines = response.reduce((pv: string[], cv) => {
					return [...pv, ...formatRconResponse(cv)];
				}, []);
				setOutput([...output(), cmd, ...newLines]);
			} else {
				setOutput([...output(), cmd, 'error']);
			}
		} catch (err) {
			if (typeof err === 'string') {
				setErrorMessage(err);
			}
		}
	};
	const [output, setOutput] = createSignal<string[]>([]);
	const [command, setCommand] = createSignal('');
	const [errorMessage, setErrorMessage] = createSignal('');

	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('RCON')}</h2>
			<ScrollArea scroll>{output()}</ScrollArea>
			<div class="h-4"></div>
			<div class="flex">
				<TextInput
					containerClass="grow"
					type="text"
					value={command()}
					onInput={(e) => setCommand(e.currentTarget.value)}
					onKeyDown={onEnter(
						() => execRcon(),
						(e) => {
							if (e.key === 'ArrowUp') {
								e.preventDefault();
								setCommand(hist.prev());
							} else if (e.key === 'ArrowDown') {
								e.preventDefault();
								setCommand(hist.next());
							}
						}
					)}
					placeholder={t('Execute RCON command...')}
				/>
				<button class="ml-2 btn" onClick={() => execRcon()}>
					<SvgSend />
					{t('Send')}
				</button>
			</div>
			<ErrorComponent errorMessage={errorMessage()} />
		</Card>
	);
};

export const Rcon: Component<{
	match: IMatch;
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
	port: number | string;
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
