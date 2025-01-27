import { SqlAttribute, TableSchema } from './tableSchema';
import { createTableDB, queryDB, updateDB } from './storage';

export const PLAYERS_TABLE = 'players';
export const MATCHES_TABLE = 'matches';
export const PLAYER_MATCH_STATS_TABLE = 'playerMatchStats';

export const setup = async () => {
	// Create players global stats table
	const playersAttributes = [
		{ name: 'steamId', type: 'TEXT' },
		{ name: 'name', type: 'TEXT' },
		{ name: 'tKills', type: 'INTEGER' },
		{ name: 'tDeaths', type: 'INTEGER' },
		{ name: 'tAssists', type: 'INTEGER' },
		{ name: 'tDiff', type: 'INTEGER' },
		{ name: 'tHits', type: 'INTEGER' },
		{ name: 'tHeadshots', type: 'INTEGER' },
		{
			name: 'tHsPct',
			type: 'FLOAT',
			constraints: 'CHECK (tHeadshots >= 0 AND tHeadshots <= 100)',
		},
		{ name: 'tRounds', type: 'INTEGER' },
		{ name: 'tDamages', type: 'INTEGER' },
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
		{ name: 'hits', type: 'INTEGER' },
		{ name: 'headshots', type: 'INTEGER' },
		{
			name: 'hsPct',
			type: 'FLOAT',
			constraints: 'CHECK (headshots >= 0 AND headshots <= 100)',
		},
		{ name: 'rounds', type: 'INTEGER' },
		{ name: 'damages', type: 'INTEGER' },
		{ name: 'adr', type: 'FLOAT' },
	] as SqlAttribute[];
	const playerMatchStatsTableSchema = new TableSchema(
		PLAYER_MATCH_STATS_TABLE,
		playerMatchStatsAttributes,
		['steamId', 'matchId']
	);
	await createTableDB(playerMatchStatsTableSchema);
};

export const onDamage = async (
	matchId: string,
	attackerId: string,
	victimId: string,
	damage: number,
	damageArmor: number,
	headshot: boolean
) => {
	// TODO
};

export const onKill = async (matchId: string, killerId: string, victimId: string) => {
	const currentKillerMatchStats = (await queryDB(
		`SELECT kills FROM ${PLAYER_MATCH_STATS_TABLE} WHERE steamId = '${killerId}' AND matchId = '${matchId}'`
	)) as number;
	const currentVictimMatchStats = (await queryDB(
		`SELECT deaths FROM ${PLAYER_MATCH_STATS_TABLE} WHERE steamId = '${victimId}' AND matchId = '${matchId}'`
	)) as number;
	const currentKillerGlobalStats = (await queryDB(
		`SELECT tKills FROM ${PLAYERS_TABLE} WHERE steamId = '${killerId}'`
	)) as number;
	const currentVictimGlobalStats = (await queryDB(
		`SELECT tDeaths FROM ${PLAYERS_TABLE} WHERE steamId = '${victimId}'`
	)) as number;
	await updateDB(
		PLAYER_MATCH_STATS_TABLE,
		new Map<string, number>([['kills', currentKillerMatchStats + 1]]),
		`steamId = '${killerId}' AND matchId = '${matchId}'`
	);
	await updateDB(
		PLAYER_MATCH_STATS_TABLE,
		new Map<string, number>([['deaths', currentVictimMatchStats + 1]]),
		`steamId = '${victimId}' AND matchId = '${matchId}'`
	);
	await updateDB(
		PLAYERS_TABLE,
		new Map<string, number>([['tKills', currentKillerGlobalStats + 1]]),
		`steamId = '${killerId}'`
	);
	await updateDB(
		PLAYERS_TABLE,
		new Map<string, number>([['tDeaths', currentVictimGlobalStats + 1]]),
		`steamId = '${victimId}'`
	);
};

export const onAssist = async (matchId: string, attackerId: string) => {
	const currentAttackerMatchStats = (await queryDB(
		`SELECT assists FROM ${PLAYER_MATCH_STATS_TABLE} WHERE steamId = '${attackerId}' AND matchId = '${matchId}'`
	)) as number;
	const currentAttackerGlobalStats = (await queryDB(
		`SELECT tAssists FROM ${PLAYERS_TABLE} WHERE steamId = '${attackerId}'`
	)) as number;
	await updateDB(
		PLAYER_MATCH_STATS_TABLE,
		new Map<string, number>([['assists', currentAttackerMatchStats + 1]]),
		`steamId = '${attackerId}' AND matchId = '${matchId}'`
	);
	await updateDB(
		PLAYERS_TABLE,
		new Map<string, number>([['tAssists', currentAttackerGlobalStats + 1]]),
		`steamId = '${attackerId}'`
	);
};

export const onOtherDeath = async (matchId: string, victimId: string) => {
	const currentVictimMatchStats = (await queryDB(
		`SELECT deaths FROM ${PLAYER_MATCH_STATS_TABLE} WHERE steamId = '${victimId}' AND matchId = '${matchId}'`
	)) as number;
	const currentVictimGlobalStats = (await queryDB(
		`SELECT tDeaths FROM ${PLAYERS_TABLE} WHERE steamId = '${victimId}'`
	)) as number;
	await updateDB(
		PLAYER_MATCH_STATS_TABLE,
		new Map<string, number>([['deaths', currentVictimMatchStats + 1]]),
		`steamId = '${victimId}' AND matchId = '${matchId}'`
	);
	await updateDB(
		PLAYERS_TABLE,
		new Map<string, number>([['tDeaths', currentVictimGlobalStats + 1]]),
		`steamId = '${victimId}'`
	);
};

export const updateRoundCount = async (matchId: string) => {
	//TODO
};
