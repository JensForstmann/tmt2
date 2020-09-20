import { Match } from '../match/match';
import { MatchMap } from '../match/matchMap';

export enum EMatchMapSate {
	PENDING = 'PENDING',
	MAP_CHANGE = 'MAP_CHANGE',
	WARMUP = 'WARMUP',
	KNIFE = 'KNIFE',
	AFTER_KNIFE = 'AFTER_KNIFE',
	IN_PROGRESS = 'IN_PROGRESS',
	PAUSED = 'PAUSED',
	FINISHED = 'FINISHED',
}

export interface IMatchMapChange {
	name?: string;
	knifeForSide?: boolean;
	startAsCtTeam?: 'teamA' | 'teamB';
	state?: EMatchMapSate;
	knifeWinner?: 'teamA' | 'teamB';
	score?: {
		teamA?: number;
		teamB?: number;
	};
	refreshOvertimeAndMaxRoundsSettings?: boolean;
}

export interface ISerializedMatchMap {
	name: string;
	knifeForSide: boolean;
	startAsCtTeam: string;
	startAsTTeam: string;
	state: EMatchMapSate;
	knifeWinner?: string;
	readyTeams: {
		teamA: boolean;
		teamB: boolean;
	};
	knifeRestart: {
		teamA: boolean;
		teamB: boolean;
	};
	score: {
		teamA: number;
		teamB: number;
	};
	overTimeEnabled: boolean;
	overTimeMaxRounds: number;
	maxRounds: number;
}

export class SerializedMatchMap implements ISerializedMatchMap {
	name: string;
	knifeForSide: boolean;
	startAsCtTeam: string;
	startAsTTeam: string;
	state: EMatchMapSate;
	knifeWinner?: string;
	readyTeams: {
		teamA: boolean;
		teamB: boolean;
	};
	knifeRestart: {
		teamA: boolean;
		teamB: boolean;
	};
	score: {
		teamA: number;
		teamB: number;
	};
	overTimeEnabled: boolean;
	overTimeMaxRounds: number;
	maxRounds: number;

	constructor(matchMap: MatchMap) {
		this.name = matchMap.name;
		this.knifeForSide = matchMap.knifeForSide;
		this.startAsCtTeam = matchMap.startAsCtTeam.id;
		this.startAsTTeam = matchMap.startAsTTeam.id;
		this.state = matchMap.state;
		this.knifeWinner = matchMap.knifeWinner?.id;
		this.readyTeams = matchMap.readyTeams;
		this.knifeRestart = matchMap.knifeRestart;
		this.score = matchMap.score;
		this.overTimeEnabled = matchMap.overTimeEnabled;
		this.overTimeMaxRounds = matchMap.overTimeMaxRounds;
		this.maxRounds = matchMap.maxRounds;
	}

	static fromSerializedToNormal(serializedMatchMap: ISerializedMatchMap, match: Match): MatchMap {
		return new MatchMap(match, serializedMatchMap.name, serializedMatchMap);
	}

	static fromNormalToSerialized(matchMap: MatchMap): ISerializedMatchMap {
		return new this(matchMap);
	}
}
