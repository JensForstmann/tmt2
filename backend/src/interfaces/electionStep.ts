export enum EWho {
	TEAM_A = 'TEAM_A',
	TEAM_B = 'TEAM_B',
	TEAM_X = 'TEAM_X',
	TEAM_Y = 'TEAM_Y',
}

export enum ESideFixed {
	TEAM_A_CT = 'TEAM_A_CT',
	TEAM_A_T = 'TEAM_A_T',
	TEAM_B_CT = 'TEAM_B_CT',
	TEAM_B_T = 'TEAM_B_T',
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

export interface IBanMap {
	mode: EMapMode.BAN;
	who: EWho;
}

export interface IPickMap {
	mode: EMapMode.PICK;
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

export interface IElectionStepAdd {
	map: IFixedMap | IPickMap | IAgreeOrRandomMap;
	side: IFixedSide | IPickSide | IRandomOrKnifeSide;
}

export interface IElectionStepSkip {
	map: IBanMap;
}

export type IElectionStep = IElectionStepAdd | IElectionStepSkip;

export const isElectionStepAdd = (u: IElectionStep): u is IElectionStepAdd => {
	return u.map.mode !== EMapMode.BAN;
};

export const isElectionStepSkip = (u: IElectionStep): u is IElectionStepSkip => {
	return u.map.mode === EMapMode.BAN;
};
