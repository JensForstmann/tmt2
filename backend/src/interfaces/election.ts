import { Election } from '../match/election';

export enum EWho {
	TEAM_1 = 'TEAM_1',
	TEAM_2 = 'TEAM_2',
	TEAM_X = 'TEAM_X',
	TEAM_Y = 'TEAM_Y',
}

export enum ESideFixed {
	TEAM_1_CT = 'TEAM_1_CT',
	TEAM_1_T = 'TEAM_1_T',
	TEAM_2_CT = 'TEAM_2_CT',
	TEAM_2_T = 'TEAM_2_T',
	TEAM_X_CT = 'TEAM_X_CT',
	TEAM_X_T = 'TEAM_X_T',
	TEAM_Y_CT = 'TEAM_Y_CT',
	TEAM_Y_T = 'TEAM_Y_T',
}

export enum EMapMode {
	FIXED = 'FIXED',
	BAN = 'BAN',
	PICK = 'PICK',
	RANDOM_BAN = 'RANDOM_BAN',
	RANDOM_PICK = 'RANDOM_PICK',
	AGREE = 'AGREE',
}

export interface IFixedMap {
	mode: EMapMode.FIXED;
	fixed: string;
}

export interface IBanOrPickMap {
	mode: EMapMode.BAN | EMapMode.PICK;
	who: EWho;
}

export interface IAgreeOrRandomMap {
	mode: EMapMode.RANDOM_BAN | EMapMode.RANDOM_PICK | EMapMode.AGREE;
}

export enum ESideMode {
	FIXED = 'FIXED',
	PICK = 'PICK',
	RANDOM = 'RANDOM',
	KNIFE = 'KNIFE',
}

export interface IFixedSide {
	mode: ESideMode.FIXED;
	fixed: ESideFixed;
}

export interface IPickSide {
	mode: ESideMode.PICK;
	who: EWho;
}

export interface IRandomOrKnifeSide {
	mode: ESideMode.RANDOM | ESideMode.KNIFE;
}

export interface IElectionStep {
	map: IFixedMap | IBanOrPickMap | IAgreeOrRandomMap;
	side: IFixedSide | IPickSide | IRandomOrKnifeSide;
}

export enum ElectionState {
	NOT_STARTED = 'NOT_STARTED',
	IN_PROGRESS = 'IN_PROGRESS',
	FINISHED = 'FINISHED',
}

export enum EStep {
	MAP = 'MAP',
	SIDE = 'SIDE',
}

export interface ISerializedElection {}

export class SerializedElection implements ISerializedElection {
	constructor(election: Election) {}

	static fromSerializedToNormal(serializedElection: ISerializedElection): Election {
		// TODO
		return {} as Election;
	}

	static fromNormalToSerialized(election: Election): ISerializedElection {
		return new this(election);
	}
}
