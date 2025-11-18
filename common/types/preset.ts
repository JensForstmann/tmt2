import { IMatchCreateDto } from './match';

export interface IPresetCreateDto {
	name: string;
	isPublic?: boolean | null;
	data: IMatchCreateDto;
}

export interface IPreset extends IPresetCreateDto {
	id: string;
}

export interface IPresetUpdateDto extends IPreset {}
