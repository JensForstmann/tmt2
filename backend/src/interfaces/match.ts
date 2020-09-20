import { EMatchSate, Match } from '../match/match';
import { ISerializedElection, SerializedElection } from './election';
import { ISerializedGameServer, SerializedGameServer } from './gameServer';
import { ISerializedMatchInitData } from './matchInitData';
import { ISerializedMatchMap, SerializedMatchMap } from './matchMap';
import { ISerializedTeam, SerializedTeam } from './team';

export interface ISerializedMatch {
	id: string;
	matchInitData: ISerializedMatchInitData;
	state: EMatchSate;
	election: ISerializedElection;
	teamA: ISerializedTeam;
	teamB: ISerializedTeam;
	gameServer: ISerializedGameServer;
	logSecret: string;
	parseIncomingLogs: boolean;
	logCounter: number;
	logLineCounter: number;
	matchMaps: ISerializedMatchMap[];
	currentMap: number;
	canClinch: boolean;
	webhookUrl?: string;
}

export class SerializedMatch implements ISerializedMatch {
	id: string;
	matchInitData: ISerializedMatchInitData;
	state: EMatchSate;
	election: ISerializedElection;
	teamA: ISerializedTeam;
	teamB: ISerializedTeam;
	gameServer: ISerializedGameServer;
	logSecret: string;
	parseIncomingLogs: boolean;
	logCounter: number;
	logLineCounter: number;
	matchMaps: ISerializedMatchMap[];
	currentMap: number;
	canClinch: boolean;
	webhookUrl?: string;

	constructor(match: Match) {
		this.id = match.id;
		this.matchInitData = match.matchInitData;
		this.state = match.state;
		this.election = SerializedElection.fromNormalToSerialized(match.election);
		this.teamA = SerializedTeam.fromNormalToSerialized(match.teamA);
		this.teamB = SerializedTeam.fromNormalToSerialized(match.teamB);
		this.gameServer = SerializedGameServer.fromNormalToSerialized(match.gameServer);
		this.logSecret = match.logSecret;
		this.parseIncomingLogs = match.parseIncomingLogs;
		this.logCounter = match.logCounter;
		this.logLineCounter = match.logLineCounter;
		this.matchMaps = match.matchMaps.map((matchMap) =>
			SerializedMatchMap.fromNormalToSerialized(matchMap)
		);
		this.currentMap = match.currentMap;
		this.canClinch = match.canClinch;
		this.webhookUrl = match.webhookUrl;
	}

	static fromSerializedToNormal(serializedMatch: ISerializedMatch): Match {
		// TODO
		return {} as Match;
	}

	static fromNormalToSerialized(match: Match): ISerializedMatch {
		return new this(match);
	}
}
