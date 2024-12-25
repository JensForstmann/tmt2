import { SqlAttribute, TableSchema } from './tableSchema';
import { createTableDB } from './storage';

const PLAYERS_TABLE = 'players';
const MATCHES_TABLE = 'matches';
const PLAYER_MATCH_STATS_TABLE = 'playerMatchStats';

export const setup = async () => {
	// Create players global stats table
	const playersAttributes = [
		{ name: 'steamId', type: 'TEXT' },
		{ name: 'name', type: 'TEXT' },
		{ name: 'tKills', type: 'INTEGER' },
		{ name: 'tDeaths', type: 'INTEGER' },
		{ name: 'tAssists', type: 'INTEGER' },
		{ name: 'tDiff', type: 'INTEGER' },
		{ name: 'tHeadshots', type: 'INTEGER' },
		{ name: 'tAdr', type: 'INTEGER' },
	] as SqlAttribute[];
	const playersTableSchema = new TableSchema(PLAYERS_TABLE, playersAttributes, ['steamId']);
	await createTableDB(playersTableSchema);

	// Create matches table
	const matchesAttributes = [
		{ name: 'matchId', type: 'TEXT' },
		{ name: 'teamA', type: 'TEXT' },
		{ name: 'teamAScore', type: 'TEXT' },
		{ name: 'teamB', type: 'TEXT' },
		{ name: 'teamBScore', type: 'TEXT' },
		{ name: 'map', type: 'TEXT' },
		{ name: 'winner', type: 'TEXT' },
	] as SqlAttribute[];
	const matchesTableSchema = new TableSchema(MATCHES_TABLE, matchesAttributes, ['matchId']);
	await createTableDB(matchesTableSchema);

	// Create player match stats table
	const playerMatchStatsAttributes = [
		{
			name: 'steamId',
			type: 'TEXT',
			constraints: `REFERENCES ${PLAYERS_TABLE}(steamId)`,
		},
		{
			name: 'matchId',
			type: 'TEXT',
			constraints: `REFERENCES ${MATCHES_TABLE}(matchId)`,
		},
		{ name: 'kills', type: 'INTEGER' },
		{ name: 'deaths', type: 'INTEGER' },
		{ name: 'assists', type: 'INTEGER' },
		{ name: 'diff', type: 'INTEGER' },
		{
			name: 'headshots',
			type: 'FLOAT',
			constraints: 'CHECK (headshots >= 0 AND headshots <= 100)',
		},
		{ name: 'adr', type: 'FLOAT' },
	] as SqlAttribute[];
	const playerMatchStatsTableSchema = new TableSchema(
		PLAYER_MATCH_STATS_TABLE,
		playerMatchStatsAttributes,
		['steamId', 'matchId']
	);
	await createTableDB(playerMatchStatsTableSchema);
};
