export const Whos = ['TEAM_A', 'TEAM_B', 'TEAM_X', 'TEAM_Y'] as const;
export type TWho = typeof Whos[number];

export const SideFixeds = [
	'TEAM_A_CT',
	'TEAM_A_T',
	'TEAM_B_CT',
	'TEAM_B_T',
	'TEAM_X_CT',
	'TEAM_X_T',
	'TEAM_Y_CT',
	'TEAM_Y_T',
] as const;
export type TSideFixed = typeof SideFixeds[number];

export const MapModesAdd = ['FIXED', 'PICK', 'RANDOM_PICK', 'AGREE'] as const;
export type TMapModeAdd = typeof MapModesAdd[number];

export const MapModesSkip = ['BAN', 'RANDOM_BAN'] as const;
export type TMapModeSkip = typeof MapModesSkip[number];

export const MapModes = [...MapModesAdd, ...MapModesSkip] as const;
export type TMapMode = typeof MapModes[number];

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
	mode: 'RANDOM_PICK' | 'AGREE';
}

export interface IRandomMapBan {
	mode: 'RANDOM_BAN';
}

export const SideModes = ['FIXED', 'PICK', 'RANDOM', 'KNIFE'] as const;
export type TSideMode = typeof SideModes[number];

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
	map: IRandomMapBan | IBanMap;
}

export type IElectionStep = IElectionStepAdd | IElectionStepSkip;
