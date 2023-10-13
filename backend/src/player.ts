import SteamID from 'steamid';
import { IPlayer, TTeamSides, TTeamString } from '../../common';

export const create = (steamId: string, name: string): IPlayer => {
	return {
		name: name,
		steamId64: getSteamID64(steamId),
	};
};

export const getSteamID64 = (steamId: string) => {
	return new SteamID(steamId).getSteamID64();
};

export const getSideFromTeamString = (teamString: TTeamString): TTeamSides | null => {
	switch (teamString) {
		case 'CT':
			return 'CT';
		case 'TERRORIST':
			return 'T';
		case '':
		case 'Spectator':
		case 'Unassigned':
			return null;
	}
};
