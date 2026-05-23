import Database from 'better-sqlite3';
import path from 'node:path';
import { STORAGE_FOLDER } from './storage';

export const db = new Database(path.join(STORAGE_FOLDER, 'sqlite3.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
