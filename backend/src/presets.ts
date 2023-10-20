import { generate as shortUuid } from 'short-uuid';
import { IPreset, IPresetCreateDto, IPresetUpdateDto } from '../../common/types/preset';
import * as Storage from './storage';

const FILE_NAME = 'presets.json';
const presets = new Map<string, IPreset>();

const write = async () => {
	await Storage.write(FILE_NAME, Array.from(presets.values()));
};

export const setup = async () => {
	const data = await Storage.read(FILE_NAME, [] as IPreset[]);
	data.forEach((preset) => presets.set(preset.id, preset));
};

export const getAll = () => {
	return Array.from(presets.values());
};

export const add = async (dto: IPresetCreateDto) => {
	let id: string;
	do {
		id = shortUuid();
	} while (presets.has(id));
	const preset = {
		id: id,
		name: dto.name,
		data: dto.data,
	};
	presets.set(id, preset);
	await write();
	return preset;
};

export const update = async (dto: IPresetUpdateDto) => {
	const preset = presets.get(dto.id);
	if (!preset) {
		return false;
	}
	presets.set(dto.id, dto);
	await write();
	return true;
};

export const remove = async (id: string) => {
	const removed = presets.delete(id);
	if (removed) {
		await write();
	}
	return removed;
};
/*

export const getPresets = async () => {
	return await Storage.read<IPreset[]>(FILE_NAME, []);
};

export const writePresets = async (presets: IPreset[]) => {
	return await Storage.write(FILE_NAME, presets);
};

export const setPreset = async (data: IPreset) => {
	const presets = await getPresets();
	presets.push(data);
	writePresets(presets);
};

export const deletePreset = async (id: string) => {
	const oldPresets = await getPresets();
	const newPresets = oldPresets.filter((preset) => preset.id !== id);
	if (oldPresets.length === newPresets.length) {
		return false;
	} else {
		writePresets(newPresets);
		return true;
	}
};
*/
