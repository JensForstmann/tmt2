import { generate as shortUuid } from 'short-uuid';
import { IMatch, IMatchCreateDto } from '../../common';
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

	for (let i = 0; i < matchesFromStorage.length; i++) {
		const matchData = matchesFromStorage[i]!;
		if (matchData.state !== 'FINISHED' && !matchData.isStopped) {
			await loadMatchFromStorage(matchData);
		}
	}

	periodicSaver();
};

const loadMatchFromStorage = async (matchData: IMatch) => {
	try {
		console.info(`load match ${matchData.id} from storage`);
		startingMatches.add(matchData.id);
		matchData.parseIncomingLogs = false;
		const match = await Match.createFromData(matchData);
		matches.set(match.data.id, match);
		await save(match);
	} catch (err) {
		console.error(`error creating match ${matchData.id} from storage: ${err}`);
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
		await save(match);
		Events.onMatchCreate(match);
		return match;
	} catch (err) {
		console.error(`error creating new match: ${err}`);
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
				await save(match);
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
	const matchData: IMatch | undefined = await Storage.read(STORAGE_PREFIX + id + STORAGE_SUFFIX);
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
		const matchData: IMatch | undefined = await Storage.read(fileName);
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
		save(match);
		return true;
	} else {
		return false;
	}
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
	await loadMatchFromStorage(matchFromStorage);
	return true;
};

export const save = async (match: Match.Match) => {
	await Storage.write(STORAGE_PREFIX + match.data.id + STORAGE_SUFFIX, match.data);
};

export const saveAll = async () => {
	const allMatches = Array.from(matches.values());
	for (let i = 0; i < allMatches.length; i++) {
		await save(allMatches[i]!);
	}
};

export const isStartingMatch = (id: string) => {
	return startingMatches.has(id);
};
