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
import { IPreset, IPresetCreateDto } from '../../common';
import { ExpressRequest, IAuthResponse } from './auth';
import * as Presets from './presets';

@Route('/api/presets')
@Security('bearer_token')
export class PresetsController extends Controller {
	/**
	 * Get all configured presets.
	 */
	@Get()
	@Security('bearer_token_optional')
	async getPresets(@Request() req: ExpressRequest<IAuthResponse>): Promise<IPreset[]> {
		return Presets.getAll().filter((preset) => preset.isPublic || req.user.type === 'GLOBAL');
	}

	/**
	 * Create a new preset.
	 */
	@Post()
	@SuccessResponse(201)
	async createPreset(
		@Body() requestBody: IPresetCreateDto,
		@Request() req: ExpressRequest<IAuthResponse>
	): Promise<IPreset> {
		const preset = Presets.add(requestBody);
		this.setStatus(201);
		return preset;
	}

	/**
	 * Update an existing preset.
	 */
	@Put()
	async updatePreset(
		@Body() requestBody: IPreset,
		@Request() req: ExpressRequest<IAuthResponse>
	) {
		if (!(await Presets.update(requestBody))) {
			this.setStatus(404);
		}
	}

	/**
	 * Delete an existing preset.
	 */
	@Delete('{id}')
	async deletePreset(id: string, @Request() req: ExpressRequest<IAuthResponse>): Promise<void> {
		if (!(await Presets.remove(id))) {
			this.setStatus(404);
		}
	}
}
