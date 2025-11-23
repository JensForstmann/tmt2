import path from 'node:path';
import Database from 'better-sqlite3';
import { STORAGE_FOLDER } from './storage';
import { migration01 } from './migrations/01';

export const db = new Database(path.join(STORAGE_FOLDER, 'sqlite3.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const runMigrations = () => {
	migration01();
};
