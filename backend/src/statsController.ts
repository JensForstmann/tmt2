import {
	Controller,
	Get,
	Query,
	Route,
	Security,
} from '@tsoa/runtime';

import {
	IPlayerStats,
	IMatchStats,
} from '../../common';

import * as StatsLogger from './statsLogger';

@Route('/api/stats')
@Security('bearer_token_optional')
export class StatsController extends Controller {
	/**
	 * Get global player statistics.
	 */
	@Get('/players')
	async getPlayerStats(): Promise<IPlayerStats[]> {
		return StatsLogger.getPlayerStats();
	}

	/**
	 * Get per-match player statistics.
	 */
	@Get('/players/match')
	async getPlayerMatchStats(@Query('id') matchId: string): Promise<IPlayerStats[]> {
		return StatsLogger.getPlayerStats(matchId);
	}

	/**
	 * Get match statistics.
	 */
	@Get('/matches')
	async getMatchStats(): Promise<IMatchStats[]> {
		return StatsLogger.getMatchStats();
	}
}