import {
	Body,
	Controller,
	Delete,
	Get,
	NoSecurity,
	Post,
	Put,
	Request,
	Route,
	Security,
	SuccessResponse,
} from '@tsoa/runtime';
import { generate as shortUuid } from 'short-uuid';
import { IPreset, IPresetCreateDto } from '../../common/types/preset';
import { IAuthResponse } from './auth';
import { deletePreset, getPresets, setPreset } from './preset';

@Route('/api/presets')
@Security('bearer_token')
export class PresetsController extends Controller {
	@Get()
	@NoSecurity()
	async getPresets(@Request() { user }: { user: IAuthResponse }): Promise<IPreset[]> {
		return getPresets();
	}

	@Post()
	@SuccessResponse(201)
	async createPreset(
		@Body() requestBody: IPresetCreateDto,
		@Request() { user }: { user: IAuthResponse }
	): Promise<IPreset> {
		const id = shortUuid();
		const preset: IPreset = { ...requestBody, id: id };
		setPreset(preset);
		this.setStatus(201);
		return preset;
	}

	@Put('')
	async updatePreset(@Body() requestBody: IPreset, @Request() { user }: { user: IAuthResponse }) {
		const presets = await getPresets();
		const preset = presets.find((preset) => preset.id === requestBody.id);
		if (preset) {
			setPreset({ ...requestBody });
		} else {
			this.setStatus(404);
		}
	}

	@Delete('{id}')
	async deletePreset(id: string, @Request() { user }: { user: IAuthResponse }): Promise<void> {
		if (!(await deletePreset(id))) {
			this.setStatus(404);
		}
	}
}
