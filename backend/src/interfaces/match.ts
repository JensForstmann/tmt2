import { IElection } from './election';
import { IElectionStep } from './electionStep';
import { IGameServer } from './gameServer';
import { TLogUnion } from './log';
import { IMatchMap } from './matchMap';
import { IPlayer } from './player';
import { ITeam, ITeamCreateDto } from './team';

export enum EMatchEndAction {
	KICK_ALL = 'KICK_ALL',
	QUIT_SERVER = 'QUIT_SERVER',
	NONE = 'NONE',
}

export enum EMatchSate {
	ELECTION = 'ELECTION',
	MATCH_MAP = 'MATCH_MAP',
	FINISHED = 'FINISHED',
}

export interface IMatch {
	/** tmt2 identifier for this match */
	id: string;
	state: EMatchSate;
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
	/** log secret that is given as part of the url to the cs go server it will send the logs to */
	logSecret: string;
	/**
	 * Indicates if incoming logs from the cs go server are parsed (otherwise they will be dropped without any action).
	 * Will be set to true if match is loaded from storage (after a short delay).
	 */
	parseIncomingLogs: boolean;
	/** The maps which will be played. If match state is still ELECTION than this is not final. */
	matchMaps: IMatchMap[];
	/** Index of the matchMaps array indicating the current map. */
	currentMap: number;
	/** if set various events will be posted to this url */
	webhookUrl?: string;
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
	canClinch: boolean;
	/** defaults to NONE */
	matchEndAction: EMatchEndAction;
	logs: TLogUnion[];
	players: IPlayer[];
	tmtSecret?: string;
	/** If match is finished or if the match was stopped/deleted this is true. */
	isStopped: boolean;
	/** this map will be loaded on match init (defaults to de_dust2 if not set) */
	electionMap: string;
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
	electionSteps: IElectionStep[];
	gameServer: IGameServer;
	/** if set various events will be posted to this url */
	webhookUrl?: string;
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
	matchEndAction?: EMatchEndAction;
	/** this map will be loaded on match init (defaults to de_dust2 if not set) */
	electionMap?: string;
}

export interface IMatchUpdateDto extends Partial<IMatchCreateDto> {
	id: string;
	state?: EMatchSate;
	/** updates the server's log address automatically */
	logSecret?: string;
	parseIncomingLogs?: boolean;
	currentMap?: number;
}
