import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Request,
	Route,
	Security,
	SuccessResponse,
} from '@tsoa/runtime';
import { IPreset, IPresetCreateDto } from '../../common/types/preset';
import { IAuthResponse } from './auth';
import * as Presets from './presets';

@Route('/api/presets')
@Security('bearer_token')
export class PresetsController extends Controller {
	@Get()
	async getPresets(@Request() { user }: { user: IAuthResponse }): Promise<IPreset[]> {
		return Presets.getAll();
	}

	@Post()
	@SuccessResponse(201)
	async createPreset(
		@Body() requestBody: IPresetCreateDto,
		@Request() { user }: { user: IAuthResponse }
	): Promise<IPreset> {
		const preset = Presets.add(requestBody);
		this.setStatus(201);
		return preset;
	}

	@Put()
	async updatePreset(@Body() requestBody: IPreset, @Request() { user }: { user: IAuthResponse }) {
		if (!(await Presets.update(requestBody))) {
			this.setStatus(404);
		}
	}

	@Delete('{id}')
	async deletePreset(id: string, @Request() { user }: { user: IAuthResponse }): Promise<void> {
		if (!(await Presets.remove(id))) {
			this.setStatus(404);
		}
	}
}
