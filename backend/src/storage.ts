import * as fs from 'fs';
import * as path from 'path';

// TODO: make those constants configurable
const STORAGE_FOLDER = 'storage';
const STORAGE_PREFIX = 'match_';
const STORAGE_SUFFIX = '.json';

export class Storage {
	static init() {
		fs.mkdirSync(STORAGE_FOLDER, {
			recursive: true,
		});
	}

	private static getPath(id: string) {
		return path.join(STORAGE_FOLDER, STORAGE_PREFIX + id + STORAGE_SUFFIX);
	}

	static async read(id: string) {
		return fs.readFileSync(Storage.getPath(id), 'utf8');
	}

	static async write(id: string, content: string) {
		fs.writeFileSync(Storage.getPath(id), content, { encoding: 'utf8' });
	}

	static async list() {
		return fs
			.readdirSync(STORAGE_FOLDER)
			.filter((fileName) => {
				return fileName.startsWith(STORAGE_PREFIX) && fileName.endsWith(STORAGE_SUFFIX);
			})
			.map((fileName) => {
				return fileName.substring(
					STORAGE_PREFIX.length,
					fileName.length - STORAGE_SUFFIX.length
				);
			});
	}
}
