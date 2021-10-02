import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

const STORAGE_DIR = process.env.STORAGE_DIR || 'storage';

export const setup = async () => {
	await fsp.mkdir(STORAGE_DIR, {
		recursive: true,
	});
};

export const write = async <T>(fileName: string, content: T) => {
	await fsp.writeFile(path.join(STORAGE_DIR, fileName), JSON.stringify(content, null, 4));
};

type TRead = {
	<T>(fileName: string, fallback: T): Promise<T>;
	<T>(fileName: string, fallback?: T): Promise<T | undefined>;
};
export const read: TRead = async <T>(fileName: string, fallback?: T) => {
	try {
		const fullPath = path.join(STORAGE_DIR, fileName);
		if (!fs.existsSync(fullPath) && fallback) {
			write(fileName, fallback);
		}
		const content = await fsp.readFile(fullPath, { encoding: 'utf-8' });
		return JSON.parse(content);
	} catch (err) {
		console.warn(`error storage read ${fileName}: ${err}. Use fallback.`);
		return fallback;
	}
};

export const appendLine = async (fileName: string, content: object) => {
	await fsp.appendFile(path.join(STORAGE_DIR, fileName), JSON.stringify(content) + '\n');
};

export const readLines = async (fileName: string, fallback: Array<any>) => {
	try {
		const fullPath = path.join(STORAGE_DIR, fileName);
		if (!fs.existsSync(fullPath) && fallback) {
			throw 'file does not exist';
		}
		const content = await fsp.readFile(fullPath, { encoding: 'utf8' });
		return content
			.split('\n')
			.filter((line) => line.trim().length > 0)
			.map((line) => JSON.parse(line));
	} catch (err) {
		console.warn(`error storage readLines ${fileName}: ${err}. Use fallback.`);
		return fallback;
	}
};

/**
 * Returns a list of all files in the storage folder which does match the given prefix and suffix.
 * The returned file names still include the prefix and suffix.
 */
export const list = async (prefix: string, suffix: string) => {
	const files = await fsp.readdir(STORAGE_DIR);
	return files.filter((fileName) => fileName.startsWith(prefix) && fileName.endsWith(suffix));
};
