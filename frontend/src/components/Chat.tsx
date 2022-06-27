import { Component, For } from 'solid-js';
import { ChatEvent } from '../../../common';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import { Card } from './Card';

export const Chat: Component<{
	messages: ChatEvent[];
	sendMessage: (msg: string) => void;
}> = (props) => {
	return (
		<Card>
			<h2 class="font-bold text-lg">{t('Chat')}</h2>
			<div class="h-80 overflow-scroll text-left flex flex-col-reverse bg-gray-50">
				<div>
					<For each={props.messages}>
						{(msg) => (
							<>
								{eventToString(msg)}
								<br />
							</>
						)}
					</For>
					<br />
				</div>
			</div>
			<input
				class="w-full"
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

const eventToString = (e: ChatEvent) => {
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
