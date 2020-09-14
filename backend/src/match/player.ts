import SteamID from 'steamid';

export class Player {
	steamId: SteamID;

	constructor(steamId: string) {
		this.steamId = new SteamID(steamId);
	}
}
