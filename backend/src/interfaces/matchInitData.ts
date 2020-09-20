import { IElectionStep } from './election';
import { ISerializedGameServer } from './gameServer';

interface IMatchInitTeamData {
	remoteId?: string;
	name: string;
	advantage?: number;
}

export interface ISerializedMatchInitData {
	remoteId?: string;
	/**
	 * @minItems 1
	 */
	mapPool: string[];
	teamA: IMatchInitTeamData;
	teamB: IMatchInitTeamData;
	/**
	 * @minItems 1
	 */
	electionSteps: IElectionStep[];
	gameServer: ISerializedGameServer;
	webhookUrl?: string;
	rconCommands?: {
		init?: string[]; // executed once on match init
		knife?: string[]; // executed before every knife round
		match?: string[]; // executed before every match map start
		end?: string[]; // executed after last match map
	};
	canClinch?: boolean;
}
