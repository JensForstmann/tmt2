import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query,
	Route,
	SuccessResponse,
} from '@tsoa/runtime';
import { ISerializedMatch, SerializedMatch, IMatchChange } from './interfaces/match';
import { ISerializedMatchInitData } from './interfaces/matchInitData';
import { MatchService } from './matchService';

@Route('/api/matches')
export class MatchesController extends Controller {
	@Post()
	@SuccessResponse(201)
	async createMatch(@Body() requestBody: ISerializedMatchInitData): Promise<{ id: string }> {
		const id = await MatchService.create(requestBody);
		this.setHeader('Location', `/api/matches/${id}`);
		this.setStatus(201);
		return { id };
	}

	@Get('{id}')
	getMatch(id: string): ISerializedMatch | void {
		const match = MatchService.get(id);
		if (match) {
			return SerializedMatch.fromNormalToSerialized(match);
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Get('{id}/server/round_backups')
	async getRoundBackups(
		id: string,
		@Query('count') count?: number
	): Promise<{ latestFiles: string[]; total: number } | void> {
		const match = MatchService.get(id);
		if (match) {
			return await match.getRoundBackups(count);
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Post('{id}/server/round_backups/{file}')
	async loadRoundBackup(id: string, file: string): Promise<boolean | void> {
		const match = MatchService.get(id);
		if (match) {
			return await match.loadRoundBackup(file);
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Post('{id}')
	changeMatch(id: string, @Body() requestBody: IMatchChange): boolean | void {
		const match = MatchService.get(id);
		if (match) {
			return match.change(requestBody);
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Delete('{id}')
	deleteMatch(id: string): void {
		if (MatchService.delete(id)) {
			this.setStatus(200);
		} else {
			this.setStatus(404);
		}
	}

	@Get()
	getAllMatches(): ISerializedMatch[] {
		return MatchService.getAll().map((match) => SerializedMatch.fromNormalToSerialized(match));
	}

	@Post('{id}/server/log/{secret}')
	async receiveLog(id: string, secret: string, @Body() requestBody: any): Promise<void> {
		const match = MatchService.get(id);
		if (match && match.logSecret === secret) {
			this.setStatus(200);
			await match.onLog(requestBody.raw);
		} else {
			this.setStatus(410); // indicate the cs go server that we do not want to receive any more logs
		}
	}
}
