import { Component, createSignal } from 'solid-js';
import { ChatEvent } from '../../../common';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import { Card } from './Card';
import { ErrorComponent } from './ErrorComponent';
import { TextInput } from './Inputs';
import { ScrollArea } from './ScrollArea';

export const Chat: Component<{
	messages: ChatEvent[];
	sendMessage: (msg: string) => Promise<any>;
}> = (props) => {
	const [errorMessage, setErrorMessage] = createSignal('');
	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('Chat')}</h2>
			<ScrollArea scroll>{props.messages.map(formatChatEvent)}</ScrollArea>
			<div class="h-4"></div>
			<TextInput
				type="text"
				onKeyDown={onEnter((e) => {
					const input = e.currentTarget;
					const msg = input.value.trim();
					if (msg) {
						props
							.sendMessage(msg)
							.then(() => {
								input.value = '';
								setErrorMessage('');
							})
							.catch((err) => setErrorMessage(err + ''));
					}
				})}
				placeholder={t('Send chat message...')}
			/>
			<ErrorComponent errorMessage={errorMessage()} />
		</Card>
	);
};

const formatChatEvent = (e: ChatEvent) => {
	const d = new Date(e.timestamp);
	const teamChat = e.isTeamChat ? '(TEAM)' : '(ALL)';
	const teamName = e.playerTeam ? ` [${e.playerTeam.name}]` : '';
	const teamSide = e.player?.side ?? e.teamString;
	const playerName = e.player?.name ?? 'Console';
	return (
		<>
			<span title={d.toLocaleString()}>{d.toLocaleTimeString()}</span>
			{`: ${teamChat}${teamName} `}
			{teamSide && <div class="badge badge-neutral">{teamSide}</div>}
			{` ${playerName}: ${e.message}`}
		</>
	);
};
