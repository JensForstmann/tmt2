import SteamID from 'steamid';
import { IPlayer, TTeamAB, TTeamSides, TTeamString } from '../../common';
import * as Match from './match';
import { db } from './database';

export const create = (match: Match.Match, steamId: string, name: string): IPlayer => {
	const steamId64 = getSteamID64(steamId);
	return {
		name: name,
		steamId64: steamId64,
		team: getForcedTeam(match, steamId64),
		side: null,
		online: null,
	};
};

export const getSteamID64 = (steamId: string) => {
	return new SteamID(steamId).getSteamID64();
};

export const getForcedTeam = (match: Match.Match, steamId64: string): TTeamAB | null => {
	const isTeamA = match.data.teamA.playerSteamIds64?.includes(steamId64);
	const isTeamB = match.data.teamB.playerSteamIds64?.includes(steamId64);
	if (isTeamA === isTeamB) {
		// either: configured for no teams
		// or: configured for both teams
		return null;
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

export type TDbMatchPlayer = {
	matchId: string;
	steamId64: string;
	name: string;
	team: string | null;
	side: string | null;
	online: number | null;
};

export const matchPlayerToDb = (matchId: string, player: IPlayer): TDbMatchPlayer => {
	return {
		matchId: matchId,
		steamId64: player.steamId64,
		name: player.name,
		team: player.team,
		side: player.side,
		online: player.online ? 1 : 0,
	};
};

export const matchPlayerFromDb = (dbMatchPlayer: TDbMatchPlayer): IPlayer => {
	return {
		steamId64: dbMatchPlayer.steamId64,
		name: dbMatchPlayer.name,
		team: dbMatchPlayer.team as TTeamAB | null,
		side: dbMatchPlayer.side as TTeamSides | null,
		online: dbMatchPlayer.online === null ? null : !!dbMatchPlayer.online,
	};
};

export const savePlayerToDb = (matchId: string, player: IPlayer) => {
	db.prepare(
		`INSERT INTO matchPlayer (
					matchId,
					steamId64,
					name,
					team,
					side,
					online
				) VALUES (
					:matchId,
					:steamId64,
					:name,
					:team,
					:side,
					:online
				) ON CONFLICT (matchId, steamId64) DO UPDATE SET
					matchId = :matchId,
					steamId64 = :steamId64,
					name = :name,
					team = :team,
					side = :side,
					online = :online
				WHERE matchId = :matchId AND steamId64 = :steamId64
				`
	).run(matchPlayerToDb(matchId, player));
};
