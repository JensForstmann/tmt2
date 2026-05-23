import { basename, extname } from 'node:path';
import { db } from '../database';
import { migration001 } from './001';

type TDbMigration = {
	file: string;
};
let migrations: TDbMigration[] | null = null;

export const isMigrationDone = (filename: string) => {
	if (migrations === null) {
		migrations = db.prepare<[], TDbMigration>('SELECT file FROM migration').all();
	}

	const file = basename(filename, extname(filename));
	return migrations.find((m) => m.file === file) !== undefined;
};

export const setMigrationDone = (filename: string) => {
	const file = basename(filename, extname(filename));
	db.prepare<TDbMigration>('INSERT INTO migration (file) VALUES (:file)').run({ file: file });
};

export const runMigrations = () => {
	db.prepare(
		`CREATE TABLE IF NOT EXISTS migration (
            file TEXT PRIMARY KEY
        ) STRICT`
	).run();
	migration001();
};
