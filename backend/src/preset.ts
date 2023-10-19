import { IPreset } from '../../common/types/preset';
import * as Storage from './storage';

const FILE_NAME = 'presets.json';

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
