export type TWho = 'TEAM_A' | 'TEAM_B' | 'TEAM_X' | 'TEAM_Y';

export type TSideFixed =
	| 'TEAM_A_CT'
	| 'TEAM_A_T'
	| 'TEAM_B_CT'
	| 'TEAM_B_T'
	| 'TEAM_X_CT'
	| 'TEAM_X_T'
	| 'TEAM_Y_CT'
	| 'TEAM_Y_T';

export type TMapMode = 'FIXED' | 'BAN' | 'PICK' | 'RANDOM_BAN' | 'RANDOM_PICK' | 'AGREE';

export interface IFixedMap {
	mode: 'FIXED';
	fixed: string;
}

export interface IBanMap {
	mode: 'BAN';
	who: TWho;
}

export interface IPickMap {
	mode: 'PICK';
	who: TWho;
}

export interface IAgreeOrRandomMap {
	mode: 'RANDOM_BAN' | 'RANDOM_PICK' | 'AGREE';
}

export type TSideMode = 'FIXED' | 'PICK' | 'RANDOM' | 'KNIFE';

export interface IFixedSide {
	mode: 'FIXED';
	fixed: TSideFixed;
}

export interface IPickSide {
	mode: 'PICK';
	who: TWho;
}

export interface IRandomOrKnifeSide {
	mode: 'RANDOM' | 'KNIFE';
}

export interface IElectionStepAdd {
	map: IFixedMap | IPickMap | IAgreeOrRandomMap;
	side: IFixedSide | IPickSide | IRandomOrKnifeSide;
}

export interface IElectionStepSkip {
	map: IBanMap;
}

export type IElectionStep = IElectionStepAdd | IElectionStepSkip;
