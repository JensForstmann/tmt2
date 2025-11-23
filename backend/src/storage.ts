import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

export const STORAGE_FOLDER = process.env['TMT_STORAGE_FOLDER'] || 'storage';

export const setup = async () => {
	await fsp.mkdir(STORAGE_FOLDER, {
		recursive: true,
	});
};

export const write = async <T>(fileName: string, content: T) => {
	await fsp.writeFile(path.join(STORAGE_FOLDER, fileName), JSON.stringify(content, null, 4));
};

type TRead = {
	<T>(fileName: string, fallback: T): Promise<T>;
	<T>(fileName: string, fallback?: T): Promise<T | undefined>;
};
export const read: TRead = async <T>(fileName: string, fallback?: T) => {
	try {
		const fullPath = path.join(STORAGE_FOLDER, fileName);
		if (!fs.existsSync(fullPath) && fallback) {
			await write(fileName, fallback);
		}
		const content = await fsp.readFile(fullPath, { encoding: 'utf-8' });
		return JSON.parse(content);
	} catch (err) {
		console.warn(`Error storage read ${fileName}: ${err}. Use fallback.`);
		return fallback;
	}
};
