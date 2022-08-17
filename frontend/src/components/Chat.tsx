import { Component } from 'solid-js';
import { ChatEvent } from '../../../common';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import { Card } from './Card';
import { ScrollArea } from './ScrollArea';
import { TextInput } from './TextInput';

export const Chat: Component<{
	messages: ChatEvent[];
	sendMessage: (msg: string) => void;
}> = (props) => {
	return (
		<Card>
			<h2 class="text-lg font-bold">{t('Chat')}</h2>
			<ScrollArea scroll>{props.messages.map(formatChatEvent)}</ScrollArea>
			<TextInput
				type="text"
				onKeyDown={onEnter((e) => {
					const msg = e.currentTarget.value.trim();
					if (msg) {
						props.sendMessage(msg);
						e.currentTarget.value = '';
					}
				})}
				placeholder={t('Send chat message...')}
			/>
		</Card>
	);
};

const formatChatEvent = (e: ChatEvent) => {
	const d = new Date(e.timestamp);
	const teamChat = e.isTeamChat ? '(TEAM)' : '(ALL)';
	const teamName = e.playerTeam ? ` [${e.playerTeam.name}]` : '';
	const playerName = e.player?.name ?? 'Console';
	return (
		<>
			<span title={d.toLocaleString()}>{d.toLocaleTimeString()}</span>
			{`: ${teamChat}${teamName} ${playerName}: ${e.message}`}
		</>
	);
};
