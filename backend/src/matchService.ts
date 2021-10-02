import { generate as shortUuid } from 'short-uuid';
import * as Match from './match';
import * as Storage from './storage';
import { EMatchSate, IMatch, IMatchCreateDto } from './interfaces/match';

const STORAGE_PREFIX = process.env.TMT_STORAGE_PREFIX || 'match_';
const STORAGE_SUFFIX = process.env.TMT_STORAGE_SUFFIX || '.json';

const matches: Map<string, Match.Match> = new Map();

/**
 * Match ids which are in setup phase right now.
 * We need to accept the log (send 200), but we can just drop it.
 * (Since we do not care about the initial wall of logs after adding a log address.)
 */
const startingMatches: Set<string> = new Set();

export const setup = async () => {
	setInterval(() => {
		saveAll(); // TODO: change so that every map can save independently as soon as something happened
	}, 60000);

	const matchesFromStorage = await Storage.list(STORAGE_PREFIX, STORAGE_SUFFIX);

	for (let i = 0; i < matchesFromStorage.length; i++) {
		const fileName = matchesFromStorage[i];
		const matchData: IMatch | undefined = await Storage.read(fileName);
		if (matchData) {
			if (
				matchData.state !== EMatchSate.FINISHED &&
				!matchData.isStopped &&
				fileName === STORAGE_PREFIX + matchData.id + STORAGE_SUFFIX
			) {
				console.log(`load match ${matchData.id} from storage`);
				startingMatches.add(matchData.id);
				matchData.parseIncomingLogs = false;
				const match = await Match.createFromData(matchData);
				matches.set(match.data.id, match);
				startingMatches.delete(matchData.id);
				await save(match);
			}
		}
	}
};

export const create = async (dto: IMatchCreateDto) => {
	const id = shortUuid();
	const logSecret = shortUuid();
	startingMatches.add(id);
	const match = await Match.createFromCreateDto(dto, id, logSecret);
	matches.set(match.data.id, match);
	startingMatches.delete(id);
	await save(match);
	return match.data.id;
};

export const get = (id: string) => {
	return matches.get(id);
};

export const getAll = () => {
	return Array.from(matches.values());
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
