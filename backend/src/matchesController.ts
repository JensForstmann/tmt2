import {
	Body,
	Controller,
	Delete,
	Get,
	NoSecurity,
	Patch,
	Post,
	Query,
	Request,
	Route,
	Security,
	SuccessResponse,
} from '@tsoa/runtime';
import {
	Event,
	IMatch,
	IMatchCreateDto,
	IMatchMapUpdateDto,
	IMatchResponse,
	IMatchUpdateDto,
} from '../../common';
import { ExpressRequest, IAuthResponse, IAuthResponseOptional } from './auth';
import * as Events from './events';
import * as Match from './match';
import * as MatchMap from './matchMap';
import * as MatchService from './matchService';

@Route('/api/matches')
@Security('bearer_token')
export class MatchesController extends Controller {
	/**
	 * Create and supervise a new match.
	 */
	@Post()
	@SuccessResponse(201)
	@Security('bearer_token_optional')
	async createMatch(
		@Body() requestBody: IMatchCreateDto,
		@Request() req: ExpressRequest<IAuthResponseOptional>
	): Promise<IMatch> {
		const match = await MatchService.create(requestBody, req.user.type === 'GLOBAL');
		this.setHeader('Location', `/api/matches/${match.data.id}`);
		this.setStatus(201);
		return match.data;
	}

	/**
	 * Get all matches.
	 * @param state State filter
	 * @param passthrough Passthrough filter
	 * @param isStopped Get only stopped or not stopped matches.
	 * @param isLive Filter for only live (currently active) matches, or the opposite.
	 */
	@Get()
	async getAllMatches(
		@Request() req: ExpressRequest<IAuthResponse>,
		@Query('state') state?: string[],
		@Query('passthrough') passthrough?: string[],
		@Query('isStopped') isStopped?: boolean,
		@Query('isLive') isLive?: boolean
	): Promise<IMatchResponse[]> {
		const live = MatchService.getAllLive();
		const storage = isLive === true ? [] : await MatchService.getAllFromStorage();
		const notLive = storage.filter((match) => !live.find((m) => match.id === m.id));
		return [...live, ...notLive]
			.map((m) => ({ ...m, isLive: !!live.find((l) => l.id === m.id) }))
			.filter((m) => state === undefined || state.includes(m.state))
			.filter(
				(m) =>
					passthrough === undefined ||
					(typeof m.passthrough === 'string' && passthrough.includes(m.passthrough))
			)
			.filter((m) => isStopped === undefined || m.isStopped === isStopped)
			.filter((m) => isLive === undefined || m.isLive === isLive)
			.map((m) => MatchService.hideRconPassword(m));
	}

	/**
	 * Get a specific match by id.
	 */
	@Get('{id}')
	async getMatch(
		id: string,
		@Request() req: ExpressRequest<IAuthResponse>
	): Promise<IMatchResponse | void> {
		const match = MatchService.get(id);
		if (match) {
			return {
				...MatchService.hideRconPassword(match.data),
				isLive: true,
			};
		}

		const matchFromStorage = await MatchService.getFromStorage(id);
		if (matchFromStorage) {
			return {
				...MatchService.hideRconPassword(matchFromStorage),
				isLive: false,
			};
		}

		this.setStatus(404);
		return;
	}

	/**
	 * Get the last 1000 log lines from a specific match.
	 */
	@Get('{id}/logs')
	async getLogs(id: string, @Request() req: ExpressRequest<IAuthResponse>): Promise<string[]> {
		return await Match.getLogsTail(id);
	}

	/**
	 * Get the last 1000 events from a specific match.
	 */
	@Get('{id}/events')
	async getEvents(id: string, @Request() req: ExpressRequest<IAuthResponse>): Promise<Event[]> {
		return await Events.getEventsTail(id);
	}

	/**
	 * Get the last known round backups for a specific match.
	 * @param count The max. number of round backups to be returned.
	 */
	@Get('{id}/server/round_backups')
	async getRoundBackups(
		id: string,
		@Request() req: ExpressRequest<IAuthResponse>,
		@Query('count') count?: number
	): Promise<{ latestFiles: string[]; total: number } | void> {
		const match = MatchService.get(id);
		if (match) {
			return await Match.getRoundBackups(match, count);
		} else {
			this.setStatus(404);
			return;
		}
	}

	/**
	 * Load a round backup file for a specific match.
	 * @param file Name of the round backup file.
	 */
	@Post('{id}/server/round_backups/{file}')
	async loadRoundBackup(
		id: string,
		file: string,
		@Request() req: ExpressRequest<IAuthResponse>
	): Promise<boolean | void> {
		const match = MatchService.get(id);
		if (match) {
			if (await Match.loadRoundBackup(match, file)) {
				return true;
			} else {
				this.setStatus(500);
				return false;
			}
		} else {
			this.setStatus(404);
			return;
		}
	}

	/**
	 * Update a specific match.
	 */
	@Patch('{id}')
	async updateMatch(
		id: string,
		@Body() requestBody: IMatchUpdateDto,
		@Request() req: ExpressRequest<IAuthResponse>
	): Promise<void> {
		const match = MatchService.get(id);
		if (match) {
			await Match.update(match, requestBody);
		} else {
			this.setStatus(404);
		}
	}

	/**
	 * Update a specific match map. First map has the map number 0.
	 */
	@Patch('{id}/matchMap/{mapNumber}')
	async updateMatchMap(
		id: string,
		mapNumber: number,
		@Body() requestBody: IMatchMapUpdateDto,
		@Request() req: ExpressRequest<IAuthResponse>
	): Promise<void> {
		const match = MatchService.get(id);
		if (!match) {
			this.setStatus(404);
			return;
		}
		const matchMap = match.data.matchMaps[mapNumber];
		if (!matchMap) {
			this.setStatus(404);
			return;
		}
		await MatchMap.update(match, matchMap, requestBody, mapNumber);
	}

	/**
	 * Stop supervising a specific match. TMT will no longer listen to the game server and will not execute any rcon commands.
	 */
	@Delete('{id}')
	async deleteMatch(id: string, @Request() req: ExpressRequest<IAuthResponse>): Promise<void> {
		if (!(await MatchService.remove(id))) {
			this.setStatus(404);
		}
	}

	/**
	 * Revive a specific match. TMT will start supervising a (stopped) match again (listen to the game sever and execute rcon commands).
	 */
	@Patch('{id}/revive')
	async reviveMatch(id: string, @Request() req: ExpressRequest<IAuthResponse>): Promise<void> {
		if (!(await MatchService.revive(id))) {
			this.setStatus(404);
		}
	}

	/**
	 * Execute a rcon command on the game server.
	 */
	@Post('{id}/server/rcon')
	async rcon(
		id: string,
		@Body() requestBody: string[],
		@Request() req: ExpressRequest<IAuthResponse>
	): Promise<string[] | void> {
		const match = MatchService.get(id);
		if (!match) {
			this.setStatus(404);
			return;
		}
		if (match.data.gameServer.hideRconPassword && req.user.type === 'MATCH') {
			this.setStatus(400);
			throw 'cannot execute rcon commands on this server';
		}
		return await Match.execManyRcon(match, requestBody);
	}

	/**
	 * Endpoint the game server sends its log file to. Not meant for direct use!
	 */
	@NoSecurity()
	@Post('{id}/server/log/{secret}')
	receiveLog(id: string, secret: string, @Body() requestBody: any): void {
		const match = MatchService.get(id);
		if (match && match.data.logSecret === secret) {
			this.setStatus(200);
			// async, so game server does not have to wait for processing (it will resend data if it takes too long)
			Match.onLog(match, requestBody.raw).catch((err) => {
				// console.error(err);
				match.log(`Error in Match.onLog(): ${err}`);
			});
		} else if (MatchService.isStartingMatch(id)) {
			// drop logs for matches in startup phase
			this.setStatus(200);
		} else {
			// 410 tells the cs2 server to stop send logs
			console.info(`return 410 to game server (match id: ${id})`);
			this.setStatus(410);
		}
	}
}
