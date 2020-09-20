import SteamID from 'steamid';

export class Player {
	steamId: SteamID;
	name: string;

	constructor(steamId: string, name: string) {
		this.steamId = new SteamID(steamId);
		this.name = name;
	}

	toIngameString(): string {
		return this.name.replace(/[";]/g, '');
	}
}
