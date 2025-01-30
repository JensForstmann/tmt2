export interface IPlayerStats {
	steamId: string;
	name: string;
	kills: number;
	deaths: number;
	assists: number;
	diff: number;
	hits: number;
	headshots: number;
	hsPct: number;
	rounds: number;
	damages: number;
	adr: number;
}

export interface IMatchStats {
	matchId: string;
	map: string;
	teamA: string;
	teamAScore: string;
	teamB: string;
	teamBScore: string;
	winner: string;
}
