import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';
import { MatchInitData, Match, IMatch } from './match';
import { MatchService } from './matchService';

@Route('/api/matches')
export class MatchesController extends Controller {
	@Post()
	async createMatch(@Body() requestBody: MatchInitData): Promise<{ id: string }> {
		const id = await MatchService.create(requestBody);
		this.setHeader('Location', `/api/matches/${id}`);
		this.setStatus(201);
		return { id };
	}

	@Get('{id}')
	async getMatches(id: string): Promise<IMatch | void> {
		const match = MatchService.get(id);
		if (match) {
			return match;
		} else {
			this.setStatus(404);
			return;
		}
	}

	@Post('{id}/server/log/{secret}')
	async receiveLog(id: string, secret: string, @Body() requestBody: any): Promise<void> {
		const match = MatchService.get(id);
		if (match && match.logSecret === secret) {
			this.setStatus(200);
			await match.onLog(requestBody.raw);
		} else {
			this.setStatus(410);
		}
	}
}
