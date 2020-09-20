import { Match } from '../match/match';
import { Team } from '../match/team';
import { ISerializedPlayer, SerializedPlayer } from './player';

export enum ETeamSides {
	CT = 'CT',
	T = 'T',
}

export interface ISerializedTeam {
	id: string;
	remoteId?: string;
	currentSide: ETeamSides;
	isTeamA: boolean;
	isTeamB: boolean;
	players: ISerializedPlayer[];
	name: string;
	advantage: number;
}

export class SerializedTeam implements ISerializedTeam {
	id: string;
	remoteId?: string;
	currentSide: ETeamSides;
	isTeamA: boolean;
	isTeamB: boolean;
	players: ISerializedPlayer[];
	name: string;
	advantage: number;

	constructor(team: Team) {
		this.id = team.id;
		this.remoteId = team.remoteId;
		this.currentSide = team.currentSide;
		this.isTeamA = team.isTeamA;
		this.isTeamB = team.isTeamB;
		this.players = Array.from(team.players).map((player) =>
			SerializedPlayer.fromNormalToSerialized(player)
		);
		this.name = team.name;
		this.advantage = team.advantage;
	}

	static fromNormalToSerialized(team: Team) {
		return new this(team);
	}

	static fromSerializedToNormal(serializedTeam: ISerializedTeam, match: Match) {
		return new Team(
			match,
			serializedTeam.currentSide,
			serializedTeam.isTeamA,
			serializedTeam.name,
			serializedTeam.advantage,
			serializedTeam.remoteId,
			serializedTeam.id
		);
	}
}
