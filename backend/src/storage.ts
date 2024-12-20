import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { Database } from 'sqlite3';

export const STORAGE_FOLDER = process.env['TMT_STORAGE_FOLDER'] || 'storage';
export const DATABASE_PATH = path.join(STORAGE_FOLDER, 'database.sqlite');
export const GAME_SERVERS_TABLE = 'gameServers';
export const PLAYERS_TABLE = 'players';
export const MATCHES_TABLE = 'matches';
export const PLAYER_MATCH_STATS_TABLE = 'playerMatchStats';

export const setup = async () => {
	await fsp.mkdir(STORAGE_FOLDER, {
		recursive: true,
	});

	const db = new Database(DATABASE_PATH);
	db.serialize(() => {
		db.run(
			`CREATE TABLE IF NOT EXISTS ${GAME_SERVERS_TABLE} (
				ip TEXT,
				port INTEGER,
				rconPassword TEXT,
				usedBy TEXT,
				canBeUsed BOOLEAN,
				PRIMARY KEY (ip, port)
			)`,
			(err) => {
				if (err) {
					console.error(err);
				}
			}
		);

		db.run(
			`CREATE TABLE IF NOT EXISTS ${PLAYERS_TABLE} ( 
				steamId TEXT PRIMARY KEY, 
				name TEXT, 
				tKills INTEGER, 
				tDeaths INTEGER, 
				tAssists INTEGER, 
				tDiff INTEGER, 
				tHeadshots INTEGER, 
				tAdr INTEGER)`,
			(err) => {
				if (err) {
					console.error(err);
				}
			}
		);

		db.run(
			`CREATE TABLE IF NOT EXISTS ${MATCHES_TABLE} ( 
				matchId TEXT PRIMARY KEY, 
				teamA TEXT, 
				teamAScore TEXT, 
				teamB TEXT, 
				teamBScore TEXT, 
				map TEXT, 
				winner TEXT)`,
			(err) => {
				if (err) {
					console.error(err);
				}
			}
		);

		db.run(
			`CREATE TABLE IF NOT EXISTS ${PLAYER_MATCH_STATS_TABLE} ( 
				steamId TEXT REFERENCES ${PLAYERS_TABLE}(steamId), 
				matchId TEXT REFERENCES ${MATCHES_TABLE}(matchId), 
				kills INTEGER, 
				deaths INTEGER, 
				assists INTEGER, 
				diff INTEGER, 
				headshots FLOAT, 
				adr FLOAT, 
				CHECK (headshots >= 0 AND headshots <= 100), 
				PRIMARY KEY (steamId, matchId))`,
			(err) => {
				if (err) {
					console.error(err);
				}
			}
		);
	});
	db.close((err) => {
		if (err) {
			console.error('Error closing the database:', err.message);
		}
	});
};

export const writeJson = async <T>(fileName: string, content: T) => {
	await fsp.writeFile(path.join(STORAGE_FOLDER, fileName), JSON.stringify(content, null, 4));
};

export const writeDB = async (query: string) => {
	console.log(query);
	const db = new Database(DATABASE_PATH);
	db.serialize(() => {
		db.run(query, (err) => {
			if (err) {
				console.error(err);
			}
		});
	});
	db.close((err) => {
		if (err) {
			console.error('Error closing the database:', err.message);
		}
	});
};

type TRead = {
	<T>(fileName: string, fallback: T): Promise<T>;
	<T>(fileName: string, fallback?: T): Promise<T | undefined>;
};
export const readJson: TRead = async <T>(fileName: string, fallback?: T) => {
	try {
		const fullPath = path.join(STORAGE_FOLDER, fileName);
		if (!fs.existsSync(fullPath) && fallback) {
			await writeJson(fileName, fallback);
		}
		const content = await fsp.readFile(fullPath, { encoding: 'utf-8' });
		return JSON.parse(content);
	} catch (err) {
		console.warn(`Error storage read ${fileName}: ${err}. Use fallback.`);
		return fallback;
	}
};

export const readDB = async (query: string) => {
	return new Promise((resolve, reject) => {
		const db = new Database(DATABASE_PATH);
		db.serialize(() => {
			db.all(query, (err, rows) => {
				if (err) {
					console.error(err);
					reject(err);
				} else {
					console.log(rows);
					resolve(rows);
				}
			});
		});
		db.close((err) => {
			if (err) {
				console.error('Error closing the database:', err.message);
			}
		});
	});
};

export const appendLineJson = async (fileName: string, content: any) => {
	try {
		await fsp.appendFile(path.join(STORAGE_FOLDER, fileName), JSON.stringify(content) + '\n');
	} catch (err) {
		console.warn(`Error storage appendLine ${fileName}: ${err}`);
	}
};

export const readLinesJson = async (
	fileName: string,
	fallback: Array<any>,
	numberLastOfLines?: number
) => {
	try {
		const fullPath = path.join(STORAGE_FOLDER, fileName);
		if (!fs.existsSync(fullPath) && fallback) {
			throw 'file does not exist';
		}
		const content = await fsp.readFile(fullPath, { encoding: 'utf8' });
		return content
			.split('\n')
			.filter((line) => line.trim().length > 0)
			.map((line) => JSON.parse(line))
			.slice(-(numberLastOfLines ?? 0));
	} catch (err) {
		console.warn(`Error storage readLines ${fileName}: ${err}. Use fallback.`);
		return fallback;
	}
};

/**
 * Returns a list of all files in the storage folder which does match the given prefix and suffix.
 * The returned file names still include the prefix and suffix.
 */
export const list = async (prefix: string, suffix: string) => {
	const files = await fsp.readdir(STORAGE_FOLDER);
	return files.filter((fileName) => fileName.startsWith(prefix) && fileName.endsWith(suffix));
};
