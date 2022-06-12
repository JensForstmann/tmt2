import { IMatch, TTeamAB } from '../../../common';

// TODO: Move to common?

export const getMapWins = (match: IMatch, team: TTeamAB): number => {
	const teamKey = team === 'TEAM_A' ? 'teamA' : 'teamB';
	const otherTeamKey = teamKey === 'teamA' ? 'teamB' : 'teamA';
	return match.matchMaps
		.filter((mm) => mm.state === 'FINISHED')
		.filter((matchMap) => matchMap.score[teamKey] > matchMap.score[otherTeamKey]).length;
};

export const getMapScore = (match: IMatch, team: TTeamAB): number => {
	const key = team === 'TEAM_A' ? 'teamA' : 'teamB';
	return getMapWins(match, team) + match[key].advantage;
};

export const getMapDraws = (match: IMatch): number => {
	return match.matchMaps
		.filter((mm) => mm.state === 'FINISHED')
		.filter((mm) => mm.score.teamA === mm.score.teamB).length;
};
