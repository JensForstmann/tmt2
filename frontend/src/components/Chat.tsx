import { Component, createSignal } from 'solid-js';
import { ChatEvent, escapeRconSayString } from '../../../common';
import { SvgSend } from '../assets/Icons';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import { Card } from './Card';
import { ErrorComponent } from './ErrorComponent';
import { TextInput } from './Inputs';
import { ScrollArea } from './ScrollArea';

export const Chat: Component<{
	messages: ChatEvent[];
	matchId: string;
	secret?: string;
}> = (props) => {
	const [chatMessage, setChatMessage] = createSignal('');
	const [errorMessage, setErrorMessage] = createSignal('');
	const fetcher = createFetcher(props.secret);
	const sendChatMessage = () => {
		if (chatMessage().trim() === '') {
			return;
		}
		fetcher('POST', `/api/matches/${props.matchId}/server/rcon`, [
			`say ${escapeRconSayString(chatMessage().trim())}`,
		])
			.then(() => {
				setChatMessage('');
				setErrorMessage('');
			})
			.catch((err) => setErrorMessage(err + ''));
	};

	return (
		<Card class="text-center">
			<h2 class="text-lg font-bold">{t('Chat')}</h2>
			<ScrollArea scroll>{props.messages.map(formatChatEvent)}</ScrollArea>
			<div class="h-4"></div>
			<div class="flex">
				<TextInput
					type="text"
					containerClass="grow"
					value={chatMessage()}
					onInput={(e) => setChatMessage(e.currentTarget.value)}
					onKeyDown={onEnter(() => sendChatMessage())}
					placeholder={t('Send chat message...')}
				/>
				<button class="ml-2 btn" onClick={() => sendChatMessage()}>
					<SvgSend />
					{t('Send')}
				</button>
			</div>
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
