import SteamID from 'steamid';
import { IPlayer, TTeamAB, TTeamSides, TTeamString } from '../../common';
import * as Match from './match';

export const create = (match: Match.Match, steamId: string, name: string): IPlayer => {
	const steamId64 = getSteamID64(steamId);
	return {
		name: name,
		steamId64: steamId64,
		team: getForcedTeam(match, steamId64),
	};
};

export const getSteamID64 = (steamId: string) => {
	return new SteamID(steamId).getSteamID64();
};

export const getForcedTeam = (match: Match.Match, steamId64: string): TTeamAB | undefined => {
	const isTeamA = match.data.teamA.playerSteamIds64?.includes(steamId64);
	const isTeamB = match.data.teamB.playerSteamIds64?.includes(steamId64);
	if (isTeamA === isTeamB) {
		// either: configured for no teams
		// or: configured for both teams
		return undefined;
	}
	return isTeamA ? 'TEAM_A' : 'TEAM_B';
};

export const forcePlayerIntoTeams = (match: Match.Match) => {
	match.data.players.forEach((player, index) => {
		const prevTeamAB = player.team;
		const newTeamAB = getForcedTeam(match, player.steamId64);
		if (newTeamAB && prevTeamAB !== newTeamAB) {
			const fromTeam = prevTeamAB
				? ` from ${prevTeamAB} (${Match.getTeamByAB(match, prevTeamAB).name})`
				: '';
			const toTeam = ` into team ${newTeamAB} (${Match.getTeamByAB(match, newTeamAB).name})`;
			match.log(`Force player ${player.name}${fromTeam}${toTeam}`);
			match.data.players[index]!.team = newTeamAB;
		}
	});
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
