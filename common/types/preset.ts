import { IMatchCreateDto } from './match';

export interface IPresetCreateDto {
	name: string;
	data: IMatchCreateDto;
}

export interface IPreset extends IPresetCreateDto {
	id: string;
}
