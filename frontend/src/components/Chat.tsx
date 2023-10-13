import { Component } from 'solid-js';
import { ChatEvent } from '../../../common';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import { Card } from './Card';
import { ScrollArea } from './ScrollArea';
import { TextInput } from './Inputs';

export const Chat: Component<{
	messages: ChatEvent[];
	sendMessage: (msg: string) => void;
}> = (props) => {
	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('Chat')}</h2>
			<ScrollArea scroll>{props.messages.map(formatChatEvent)}</ScrollArea>
			<div class="h-4"></div>
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
