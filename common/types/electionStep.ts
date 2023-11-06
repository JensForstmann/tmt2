export const Whos = ['TEAM_A', 'TEAM_B', 'TEAM_X', 'TEAM_Y'] as const;
export type TWho = (typeof Whos)[number];

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
export type TSideFixed = (typeof SideFixeds)[number];

export const MapModesAdd = ['FIXED', 'PICK', 'RANDOM_PICK', 'AGREE'] as const;
/** Modes to select a map that will be played. */
export type TMapModeAdd = (typeof MapModesAdd)[number];

export const MapModesSkip = ['BAN', 'RANDOM_BAN'] as const;
/** Modes to remove a map without playing on it. */
export type TMapModeSkip = (typeof MapModesSkip)[number];

export const MapModes = [...MapModesAdd, ...MapModesSkip] as const;
/** Possible map modes for a election step. */
export type TMapMode = (typeof MapModes)[number];

/** Play on a fixed map. Map will not be removed from the map pool. */
export interface IFixedMap {
	mode: 'FIXED';
	/** The name of the map, e.g. de_anubis. */
	fixed: string;
}

/** Ban a map from the map pool. */
export interface IBanMap {
	mode: 'BAN';
	who: TWho;
}

/** Pick a map from the map pool. */
export interface IPickMap {
	mode: 'PICK';
	who: TWho;
}

/** Either pick a random map from the map pool. Or let both teams agree on a map from the map pool. */
export interface IAgreeOrRandomMap {
	mode: 'RANDOM_PICK' | 'AGREE';
}

/** Randomly ban a map from the map pool. */
export interface IRandomMapBan {
	mode: 'RANDOM_BAN';
}

export const SideModes = ['FIXED', 'PICK', 'RANDOM', 'KNIFE'] as const;
/** Possible side modes to determine the starting sides of each team. */
export type TSideMode = (typeof SideModes)[number];

/** Use fixed starting sides. */
export interface IFixedSide {
	mode: 'FIXED';
	fixed: TSideFixed;
}

/** Let one team choose its starting side. */
export interface IPickSide {
	mode: 'PICK';
	who: TWho;
}

/** Either randomly set starting sides. Or do a knife round befor the map starts and let the winner decide. */
export interface IRandomOrKnifeSide {
	mode: 'RANDOM' | 'KNIFE';
}

/** Election steps which will result in a match map that will be played. */
export interface IElectionStepAdd {
	map: IFixedMap | IPickMap | IAgreeOrRandomMap;
	side: IFixedSide | IPickSide | IRandomOrKnifeSide;
}

/** Election steps which will remove a map from the map pool. */
export interface IElectionStepSkip {
	map: IRandomMapBan | IBanMap;
}

/** Election step to either add map to the list of match maps. Or to remove a map from the map pool. */
export type IElectionStep = IElectionStepAdd | IElectionStepSkip;
