import { IElection } from './election';
import { IElectionStep, IElectionStepAdd, IElectionStepSkip } from './electionStep';
import { IGameServer } from './gameServer';
import { TLogUnion } from './log';
import { IMatchMap } from './matchMap';
import { IPlayer } from './player';
import { ITeam, ITeamCreateDto } from './team';

export const MatchEndActions = ['KICK_ALL', 'QUIT_SERVER', 'NONE'] as const;
export type TMatchEndAction = (typeof MatchEndActions)[number];

export const MatchStates = ['ELECTION', 'MATCH_MAP', 'FINISHED'] as const;
/**
 * Possible match states.
 */
export type TMatchState = (typeof MatchStates)[number];

/**
 * Possible match modes.
 */
export type TMatchMode = 'SINGLE' | 'LOOP';

export interface IMatch {
	/** tmt2 identifier for this match */
	id: string;
	state: TMatchState;
	/** e.g. remote identifier, will be present in every response/webhook */
	passthrough?: string;
	/**
	 * The maps the players can pick or ban.
	 * Will also be used if a map is chosen randomly.
	 * If the map is fixed it will not be removed from the map pool.
	 * Workshop maps are possible (contain numbers only).
	 * Friendly names for players when picking/banning maps can be added after a "/" delimiter and is advised for workshop maps.
	 *
	 * Example:
	 * ```
	 * [
	 *    "de_ancient",
	 *    "de_anubis/anubis",
	 *    "de_inferno",
	 *    "de_mirage",
	 *    "de_nuke",
	 *    "de_overpass",
	 *    "de_vertigo",
	 *    "3070923343/fy_pool_day"
	 * ]
	 * ```
	 */
	mapPool: string[];
	/**
	 * Team A for this match.
	 * Team A will always be Team A in responses and webhooks.
	 * No matter on which side (CT/T) it is currently.
	 */
	teamA: ITeam;
	/**
	 * Team B for this match.
	 * Team B will always be Team B in responses and webhooks.
	 * No matter on which side (CT/T) it is currently.
	 */
	teamB: ITeam;
	/**
	 * List of election steps to determine the played map(s).
	 */
	electionSteps: IElectionStep[];
	/** Data for the election process. */
	election: IElection;
	gameServer: IGameServer;
	/** Log secret that is given as part of the url to the CS2 server as a log receiver (logaddress_add_http). */
	logSecret: string;
	/**
	 * Indicates if incoming logs from the CS2 server are parsed (otherwise they will be dropped without any action).
	 * Will be set to true if match is loaded from storage (after a short delay).
	 */
	parseIncomingLogs: boolean;
	/** The maps which will be played. If match state is still ELECTION than this is not final. */
	matchMaps: IMatchMap[];
	/** Index of the matchMaps array indicating the current map. */
	currentMap: number;
	/** Send various events to this url (HTTP POST) */
	webhookUrl: string | null;
	/** Additional headers that will be added to each webhook request */
	webhookHeaders: { [key: string]: string } | null;
	rconCommands: {
		/** executed exactly once on match init */
		init: string[];
		/** executed before every knife round */
		knife: string[];
		/** executed before every match map start */
		match: string[];
		/** executed after last match map */
		end: string[];
	};
	/** defaults to true, means that possibly not all maps will be played if the winner is determined before */
	canClinch: boolean;
	/** defaults to NONE */
	matchEndAction: TMatchEndAction;
	logs: TLogUnion[];
	players: IPlayer[];
	/** Access token to be used in the API. */
	tmtSecret: string;
	/** If match is finished or if the match was stopped/deleted this is true. */
	isStopped: boolean;
	/** Server password, periodically fetched from game server */
	serverPassword: string;
	/** if set will be used to register the target logaddress for the game server */
	tmtLogAddress?: string;
	/** Creation date (unix time in milliseconds since midnight, January 1, 1970 UTC) */
	createdAt: number;
	/** Last time the match was saved to disk (unix time in milliseconds since midnight, January 1, 1970 UTC) */
	lastSavedAt?: number;
	/** Match mode (single: stops when match is finished, loop: starts again after match is finished) */
	mode: TMatchMode;
}

export interface IMatchResponse extends IMatch {
	isLive: boolean;
}

export interface IMatchCreateDto {
	/** e.g. remote identifier, will be present in every response/webhook */
	passthrough?: string;
	/**
	 * The maps the players can pick or ban.
	 * Will also be used if a map is chosen randomly.
	 * If the map is fixed it will not be removed from the map pool.
	 * Workshop maps are possible (contain numbers only).
	 * Friendly names for players when picking/banning maps can be added after a "/" delimiter and is advised for workshop maps.
	 *
	 * Example:
	 * ```
	 * [
	 *    "de_ancient",
	 *    "de_anubis/anubis",
	 *    "de_inferno",
	 *    "de_mirage",
	 *    "de_nuke",
	 *    "de_overpass",
	 *    "de_vertigo",
	 *    "3070923343/fy_pool_day"
	 * ]
	 * ```
	 */
	mapPool: string[];
	teamA: ITeamCreateDto;
	teamB: ITeamCreateDto;
	electionSteps: Array<IElectionStepAdd | IElectionStepSkip>;
	gameServer: IGameServer | null;
	/** Send various events to this url (HTTP POST) */
	webhookUrl?: string | null;
	/** Additional headers that will be added to each webhook request */
	webhookHeaders?: { [key: string]: string } | null;
	rconCommands?: {
		/** executed exactly once on match init */
		init?: string[];
		/** executed before every knife round */
		knife?: string[];
		/** executed before every match map start */
		match?: string[];
		/** executed after last match map */
		end?: string[];
	};
	/** defaults to true, means that possibly not all maps will be played if the winner is determined before */
	canClinch?: boolean;
	/** defaults to NONE */
	matchEndAction?: TMatchEndAction;
	/** if set will be used to register the target logaddress for the game server */
	tmtLogAddress?: string;
	/** Match mode (single: stops when match is finished, loop: starts again after match is finished) */
	mode?: TMatchMode;
}

export interface IMatchUpdateDto extends Partial<IMatchCreateDto> {
	state?: TMatchState;
	/** updates the server's log address automatically */
	logSecret?: string;
	currentMap?: number;

	_restartElection?: boolean;
	_init?: boolean;
	_setup?: boolean;
	_execRconCommandsInit?: boolean;
	_execRconCommandsKnife?: boolean;
	_execRconCommandsMatch?: boolean;
	_execRconCommandsEnd?: boolean;
}
