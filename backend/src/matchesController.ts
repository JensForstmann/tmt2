import {
	Body,
	Controller,
	Delete,
	Get,
	NoSecurity,
	Post,
	Put,
	Query,
	Request,
	Route,
	Security,
	SuccessResponse,
} from '@tsoa/runtime';
import { IMatch, IMatchCreateDto, IMatchUpdateDto } from './interfaces/match';
import * as MatchService from './matchService';
import * as Match from './match';
import { IAuthResponse } from './auth';

@Route('/api/matches')
@Security('bearer_token')
export class MatchesController extends Controller {
	@Post()
	@SuccessResponse(201)
	@NoSecurity()
	async createMatch(@Body() requestBody: IMatchCreateDto): Promise<IMatch> {
		const match = await MatchService.create(requestBody);
		this.setHeader('Location', `/api/matches/${match.data.id}`);
		this.setStatus(201);
		return match.data;
	}

	@Get('{id}')
	getMatch(id: string, @Request() { user }: { user: IAuthResponse }): IMatch | void {
		const match = MatchService.get(id);
		if (match) {
			return match.data;
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Get('{id}/server/round_backups')
	async getRoundBackups(
		id: string,
		@Request() { user }: { user: IAuthResponse },
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

	@Post('{id}/server/round_backups/{file}')
	async loadRoundBackup(
		id: string,
		file: string,
		@Request() { user }: { user: IAuthResponse }
	): Promise<boolean | void> {
		const match = MatchService.get(id);
		if (match) {
			if (await Match.loadRoundBackup(match, file)) {
				return true;
			} else {
				this.setStatus(400);
				return false;
			}
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Put('{id}')
	async updateMatch(
		id: string,
		@Body() requestBody: IMatchUpdateDto,
		@Request() { user }: { user: IAuthResponse }
	): Promise<boolean | void> {
		const match = MatchService.get(id);
		if (match) {
			if (await Match.update(match, requestBody)) {
				return true;
			} else {
				this.setStatus(400);
				return false;
			}
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Delete('{id}')
	async deleteMatch(
		id: string,
		@Request() { user }: { user: IAuthResponse }
	): Promise<boolean | void> {
		if (await MatchService.remove(id)) {
			this.setStatus(200);
		} else {
			this.setStatus(404);
		}
	}

	@Get()
	getAllMatches(@Request() { user }: { user: IAuthResponse }): IMatch[] {
		return MatchService.getAll().map((match) => match.data);
	}

	@NoSecurity()
	@Post('{id}/server/log/{secret}')
	receiveLog(id: string, secret: string, @Body() requestBody: any): void {
		const match = MatchService.get(id);
		if (match && match.data.logSecret === secret) {
			this.setStatus(200);
			// async, so game server does not have to wait for processing (it will resend data if it takes too long)
			Match.onLog(match, requestBody.raw).catch((err) => {
				// console.error(err);
				match.log(`error in Match.onLog(): ${err}`);
			});
		} else if (MatchService.isStartingMatch(id)) {
			// drop logs for matches in startup phase
			this.setStatus(200);
		} else {
			// 410 tells the cs go server to stop send logs
			console.log(`return 410 to gameserver (match id: ${id})`);
			this.setStatus(410);
		}
	}

	@Delete()
	async deleteAll(@Request() { user }: { user: IAuthResponse }): Promise<void> {
		const a = MatchService.getAll();
		for (let i = 0; i < a.length; i++) {
			await MatchService.remove(a[i].data.id);
		}
	}
}
