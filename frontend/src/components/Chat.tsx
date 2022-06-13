import { Component, For } from 'solid-js';
import { ChatEvent } from '../../../common';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import classes from './Chat.module.scss';

export const Chat: Component<{
	messages: ChatEvent[];
	sendMessage: (msg: string) => void;
}> = (props) => {
	return (
		<>
			<div class={classes.card}>
				<h2>{t('Chat')}</h2>
				<div class={classes.content}>
					<div>
						<For each={props.messages}>
							{(msg) => (
								<>
									{eventToString(msg)}
									<br />
								</>
							)}
						</For>
					</div>
				</div>
				<input
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
			</div>
		</>
	);
};

const eventToString = (e: ChatEvent) => {
	const timestamp = new Date(e.timestamp).toLocaleTimeString();
	const teamChat = e.isTeamChat ? '(TEAM)' : '(ALL)';
	const teamName = e.playerTeam ? ` [${e.playerTeam.name}]` : '';
	const playerName = e.player?.name ?? 'Console';
	return `${timestamp}: ${teamChat}${teamName} ${playerName}: ${e.message}`;
};
