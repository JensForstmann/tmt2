import { generate as shortUuid } from 'short-uuid';
import { EMatchSate, IMatch, IMatchCreateDto } from './interfaces/match';
import * as Match from './match';
import * as Storage from './storage';

const STORAGE_PREFIX = process.env.TMT_STORAGE_PREFIX || 'match_';
const STORAGE_SUFFIX = process.env.TMT_STORAGE_SUFFIX || '.json';

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
		const matchData = matchesFromStorage[i];
		if (matchData.state !== EMatchSate.FINISHED && !matchData.isStopped) {
			console.log(`load match ${matchData.id} from storage`);
			startingMatches.add(matchData.id);
			matchData.parseIncomingLogs = false;
			try {
				const match = await Match.createFromData(matchData);
				matches.set(match.data.id, match);
				await save(match);
			} catch (err) {
				console.error(`error creating match ${matchData.id} from storage: ${err}`);
			}
			startingMatches.delete(matchData.id);
		}
	}

	periodicSaver();
};

const periodicSaver = async () => {
	if (timeout) {
		clearTimeout(timeout);
	}
	const ids = Array.from(matchesToSave.values());
	matchesToSave.clear();
	for (let i = 0; i < ids.length; i++) {
		const match = get(ids[i]);
		if (match) {
			try {
				match.log(`Save match to disk`);
				await save(match);
			} catch (err) {
				match.log(`Error saving match: ${err}`);
				matchesToSave.add(ids[i]);
			}
		}
	}
	timeout = setTimeout(periodicSaver, 2_000);
};

export const scheduleSave = (match: Match.Match) => {
	matchesToSave.add(match.data.id);
};

export const create = async (dto: IMatchCreateDto) => {
	const id = shortUuid();
	const logSecret = shortUuid();
	startingMatches.add(id);
	const match = await Match.createFromCreateDto(dto, id, logSecret);
	matches.set(match.data.id, match);
	startingMatches.delete(id);
	await save(match);
	return match;
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
		const fileName = matchesFromStorage[i];
		const matchData: IMatch | undefined = await Storage.read(fileName);
		if (matchData && fileName === STORAGE_PREFIX + matchData.id + STORAGE_SUFFIX) {
			matches.push(matchData);
		}
	}

	return matches;
};

export const getAll = async () => {
	return [...getAllLive(), ...(await getAllFromStorage())];
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

export const save = async (match: Match.Match) => {
	await Storage.write(STORAGE_PREFIX + match.data.id + STORAGE_SUFFIX, match.data);
};

export const saveAll = async () => {
	const allMatches = Array.from(matches.values());
	for (let i = 0; i < allMatches.length; i++) {
		await save(allMatches[i]);
	}
};

export const isStartingMatch = (id: string) => {
	return startingMatches.has(id);
};
