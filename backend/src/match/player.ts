import SteamID from 'steamid';

export class Player {
	steamId: SteamID;
	steamId64: string;
	name: string;

	constructor(steamId: string, name: string) {
		this.steamId = new SteamID(steamId);
		this.steamId64 = this.steamId.getSteamID64();
		this.name = name;
	}

	toIngameString(): string {
		return this.name.replace(/[";]/g, '');
	}
}
