import axios from 'axios';
import { SerializedPlayer } from './interfaces/player';
import { EWebhookType, IChatWebhook, IRoundEndWebhook, IWebhook } from './interfaces/webhook';
import { Match } from './match';
import { Player } from './player';
import { Team } from './team';

export class Webhook {
	match: Match;

	constructor(match: Match) {
		this.match = match;
	}

	private getWebhook() {
		return {
			id: this.match.id,
			remoteId: this.match.matchInitData.remoteId,
		};
	}

	onRoundEnd(scoreTeamA: number, scoreTeamB: number) {
		const payload: IRoundEndWebhook = {
			...this.getWebhook(),
			type: EWebhookType.ROUND_END,
			scoreTeamA: scoreTeamA,
			scoreTeamB: scoreTeamB,
		};
		this.send(payload);
	}

	onMapEnd(scoreTeamA: number, scoreTeamB: number) {}

	onMatchEnd() {}

	onPlayerSay(player: Player, message: string, isTeamChat: boolean) {
		const payload: IChatWebhook = {
			...this.getWebhook(),
			type: EWebhookType.CHAT,
			player: SerializedPlayer.fromNormalToSerialized(player),
			message: message,
			isTeamChat: isTeamChat,
		};
		this.send(payload);
	}

	send(data: IWebhook) {
		console.log('TCL: Webhook -> send -> data', data);
		if (this.match.webhookUrl?.startsWith('http')) {
			console.log('TCL: Webhook -> send -> this.match.webhookUrl', this.match.webhookUrl);
			axios.post(this.match.webhookUrl, data).catch((err) => {
				console.warn('send webhook failed: ' + err);
			});
		}
	}
}
