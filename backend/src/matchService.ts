import { generate as shortUuid } from 'short-uuid';
import { IGameServer, IMatch, IMatchCreateDto, IMatchResponse } from '../../common';
import * as Events from './events';
import * as Match from './match';
import * as Storage from './storage';

const STORAGE_PREFIX = 'match_';
const STORAGE_SUFFIX = '.json';

const matches: Map<string, Match.Match> = new Map();

/**
 * Match ids which are in setup phase right now.
 * We need to accept the log (send 200), but we can just drop it.
 * (Since we do not care about the initial wall of logs after adding a log address.)
 */
const startingMatches: Set<string> = new Set();

const matchesToSave: Set<string> = new Set();

let timeout: NodeJS.Timeout;

export const setup = async () => {
	const matchesFromStorage = await getAllFromStorage();

	// begin with recent matches so when there are multiple matches
	// with the same game server we recreate the correct (most recent) one
	matchesFromStorage.sort((a, b) => (b.lastSavedAt ?? 0) - (a.lastSavedAt ?? 0));

	for (let i = 0; i < matchesFromStorage.length; i++) {
		const matchData = matchesFromStorage[i]!;
		if (matchData.state !== 'FINISHED' && !matchData.isStopped) {
			try {
				await loadMatchFromStorage(matchData, '(TMT restarted)');
			} catch (err) {
				console.error(`Error creating match ${matchData.id} from storage: ${err}`);
				if (err instanceof Match.GameServerInUseError) {
					matchData.isStopped = true;
					await save(matchData);
				}
			}
		}
	}

	periodicSaver();
};

const loadMatchFromStorage = async (matchData: IMatch, logMessageSuffix?: string) => {
	try {
		console.info(`Load match ${matchData.id} from storage`);
		startingMatches.add(matchData.id);
		matchData.parseIncomingLogs = false;
		const match = await Match.createFromData(
			matchData,
			`Load match from storage ${logMessageSuffix ?? ''}`.trim()
		);
		matches.set(match.data.id, match);
		await save(match.data);
	} finally {
		startingMatches.delete(matchData.id);
	}
};

export const create = async (dto: IMatchCreateDto) => {
	const id = shortUuid();
	try {
		const logSecret = shortUuid();
		startingMatches.add(id);
		const match = await Match.createFromCreateDto(dto, id, logSecret);
		matches.set(match.data.id, match);
		await save(match.data);
		Events.onMatchCreate(match);
		return match;
	} catch (err) {
		console.error(`Error creating new match: ${err}`);
		throw err;
	} finally {
		startingMatches.delete(id);
	}
};

const periodicSaver = async () => {
	if (timeout) {
		clearTimeout(timeout);
	}
	const ids = Array.from(matchesToSave.values());
	matchesToSave.clear();
	for (let i = 0; i < ids.length; i++) {
		const id = ids[i]!;
		const match = get(id);
		if (match) {
			try {
				await save(match.data);
			} catch (err) {
				match.log(`Error saving match: ${err}`);
				matchesToSave.add(id);
			}
		}
	}
	timeout = setTimeout(periodicSaver, 2_000);
};

export const scheduleSave = (match: Match.Match) => {
	matchesToSave.add(match.data.id);
};

export const get = (id: string) => {
	return matches.get(id);
};

export const getFromStorage = async (id: string) => {
	const matchData: IMatch | undefined = await Storage.readJson(
		STORAGE_PREFIX + id + STORAGE_SUFFIX
	);
	return matchData;
};

export const getAllLive = () => {
	return Array.from(matches.values()).map((match) => match.data);
};

export const getAllFromStorage = async () => {
	const matchesFromStorage = await Storage.list(STORAGE_PREFIX, STORAGE_SUFFIX);

	const matches: IMatch[] = [];

	for (let i = 0; i < matchesFromStorage.length; i++) {
		const fileName = matchesFromStorage[i]!;
		const matchData: IMatch | undefined = await Storage.readJson(fileName);
		if (matchData && fileName === STORAGE_PREFIX + matchData.id + STORAGE_SUFFIX) {
			matches.push(matchData);
		}
	}

	return matches;
};

export const getAll = async () => {
	const live = getAllLive();
	const storage = await getAllFromStorage();
	const notLive = storage.filter((match) => !live.find((m) => match.id === m.id));
	return {
		live,
		notLive,
	};
};

export const remove = async (id: string) => {
	const match = matches.get(id);
	if (match) {
		await Match.stop(match);
		matches.delete(id);
		save(match.data);
		return true;
	} else {
		return false;
	}
};

export const removeStopped = async (id: string) => {
	const matchFromStorage = await getFromStorage(id);
	if (!matchFromStorage) {
		return false;
	}
	matchFromStorage.isStopped = true;
	await save(matchFromStorage);
	return true;
};

export const revive = async (id: string) => {
	const match = matches.get(id);
	if (match) {
		return false;
	}
	const matchFromStorage = await getFromStorage(id);
	if (!matchFromStorage) {
		return false;
	}
	matchFromStorage.isStopped = false;
	await loadMatchFromStorage(matchFromStorage, '(revive)');
	return true;
};

export const save = async (matchData: IMatch) => {
	const previousLastSavedAt = matchData.lastSavedAt;
	matchData.lastSavedAt = Date.now();
	try {
		await Storage.writeJson(STORAGE_PREFIX + matchData.id + STORAGE_SUFFIX, matchData);
	} catch (err) {
		matchData.lastSavedAt = previousLastSavedAt;
		throw err;
	}
};

export const saveAll = async () => {
	const allMatches = Array.from(matches.values());
	for (let i = 0; i < allMatches.length; i++) {
		await save(allMatches[i]!.data);
	}
};

export const isStartingMatch = (id: string) => {
	return startingMatches.has(id);
};

export const hideRconPassword = <T extends IMatch | IMatchResponse>(
	match: T,
	isLoggedIn: boolean
): T => {
	return {
		...match,
		gameServer: {
			...match.gameServer,
			rconPassword:
				match.gameServer.hideRconPassword && !isLoggedIn
					? ''
					: match.gameServer.rconPassword,
		},
	};
};

export const getLiveMatchesByGameServer = (gameServer: IGameServer) => {
	return getAllLive().filter(
		(match) =>
			match.gameServer.ip === gameServer.ip && match.gameServer.port === gameServer.port
	);
};
