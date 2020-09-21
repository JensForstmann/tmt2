import axios from 'axios';
import { Match } from './match';

export class Webhook {
	match: Match;

	constructor(match: Match) {
		this.match = match;
	}

	onRoundEnd() {}

	onMapEnd() {}

	onMatchEnd() {}
}
