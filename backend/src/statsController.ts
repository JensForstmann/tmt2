import { Controller, Get, Query, Route, Security } from '@tsoa/runtime';

import { IPlayerStats, IMatchStats } from '../../common';

import * as StatsLogger from './statsLogger';

@Route('/api/stats')
@Security('bearer_token_optional')
export class StatsController extends Controller {
	/**
	 * Get global player statistics.
	 */
	@Get('/players')
	async getPlayersStats(): Promise<IPlayerStats[]> {
		return StatsLogger.getPlayersStats();
	}

	/**
	 * Get the stats of all the players for a match.
	 */
	@Get('/players/match')
	async getMatchPlayersStats(@Query('id') id: string): Promise<IPlayerStats[]> {
		return StatsLogger.getMatchPlayersStats(id);
	}

	/**
	 * Get global match statistics.
	 */
	@Get('/matches')
	async getMatchesStats(): Promise<IMatchStats[]> {
		return StatsLogger.getMatchesStats();
	}

	/**
	 * Get match stats for a specific match.
	 */
	@Get('/match')
	async getMatchStats(@Query('id') id: string): Promise<IMatchStats> {
		return StatsLogger.getMatchStats(id);
	}

	@Get('/player')
	async getPlayerStats(@Query('id') id: string): Promise<IPlayerStats> {
		return StatsLogger.getPlayerStats(id);
	}

	/**
	 * Get the stats of a player, divided by match.
	 */
	@Get('/matches/player')
	async getPlayerMatchesStats(@Query('id') id: string): Promise<IPlayerStats[]> {
		return StatsLogger.getPlayerMatchesStats(id);
	}
}
