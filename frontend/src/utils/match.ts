import { IMatch } from '../types/match';
import { EMatchMapSate, ETeamAB } from '../types/matchMap';

export const getMapWins = (match: IMatch, team: ETeamAB): number => {
	const teamKey = team === ETeamAB.TEAM_A ? 'teamA' : 'teamB';
	const otherTeamKey = teamKey === 'teamA' ? 'teamB' : 'teamA';
	return match.matchMaps
		.filter((mm) => mm.state === EMatchMapSate.FINISHED)
		.filter((matchMap) => matchMap.score[teamKey] > matchMap.score[otherTeamKey]).length;
};

export const getMapScore = (match: IMatch, team: ETeamAB): number => {
	const key = team === ETeamAB.TEAM_A ? 'teamA' : 'teamB';
	return getMapWins(match, team) + match[key].advantage;
};

export const getMapDraws = (match: IMatch): number => {
	return match.matchMaps
		.filter((mm) => mm.state === EMatchMapSate.FINISHED)
		.filter((mm) => mm.score.teamA === mm.score.teamB).length;
};
