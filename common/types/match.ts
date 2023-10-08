import { IElection } from './election';
import { IElectionStep, IElectionStepAdd, IElectionStepSkip } from './electionStep';
import { IGameServer } from './gameServer';
import { TLogUnion } from './log';
import { IMatchMap } from './matchMap';
import { IPlayer } from './player';
import { ITeam, ITeamCreateDto } from './team';

export const MatchEndActions = ['KICK_ALL', 'QUIT_SERVER', 'NONE'] as const;
export type TMatchEndAction = typeof MatchEndActions[number];

export const MatchStates = ['ELECTION', 'MATCH_MAP', 'FINISHED'] as const;
export type TMatchSate = typeof MatchStates[number];

export type TMatchMode = 'SINGLE' | 'LOOP';

export interface IMatch {
	/** tmt2 identifier for this match */
	id: string;
	state: TMatchSate;
	/** e.g. remote identifier, will be present in every response/webhook */
	passthrough?: string;
	/**
	 * The maps the players can pick or ban.
	 * Will also be used if a map is chosen randomly.
	 * If the map is fixed it will not be removed from the map pool.
	 */
	mapPool: string[];
	teamA: ITeam;
	teamB: ITeam;
	electionSteps: IElectionStep[];
	/** election state data */
	election: IElection;
	gameServer: IGameServer;
	/** log secret that is given as part of the url to the cs2 server it will send the logs to */
	logSecret: string;
	/**
	 * Indicates if incoming logs from the cs2 server are parsed (otherwise they will be dropped without any action).
	 * Will be set to true if match is loaded from storage (after a short delay).
	 */
	parseIncomingLogs: boolean;
	/** The maps which will be played. If match state is still ELECTION than this is not final. */
	matchMaps: IMatchMap[];
	/** Index of the matchMaps array indicating the current map. */
	currentMap: number;
	/** if set various events will be posted to this url */
	webhookUrl: string | null;
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
	 */
	mapPool: string[];
	teamA: ITeamCreateDto;
	teamB: ITeamCreateDto;
	electionSteps: Array<IElectionStepAdd | IElectionStepSkip>;
	gameServer: IGameServer | null;
	/** if set various events will be posted to this url */
	webhookUrl?: string | null;
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
	state?: TMatchSate;
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
