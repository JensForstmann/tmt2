import SteamID from 'steamid';
import { IPlayer } from './interfaces/player';

export const create = (steamId: string, name: string): IPlayer => {
	return {
		name: name,
		steamId64: getSteamID64(steamId),
	};
};

export const getSteamID64 = (steamId: string) => {
	return new SteamID(steamId).getSteamID64();
};
