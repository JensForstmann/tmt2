import { Match } from './match';
import { generate as shortUuid } from 'short-uuid';
import { ISerializedMatchInitData } from './interfaces/matchInitData';
import { EMatchSate, SerializedMatch } from './interfaces/match';
import { Storage } from './storage';

const matches: Map<string, Match> = new Map();

export class MatchService {
	static async create(matchInitData: ISerializedMatchInitData): Promise<string> {
		const id = process.env.NODE_ENV === 'development' ? '0' : shortUuid();
		const match = new Match(id, matchInitData);
		matches.set(id, match);

		MatchService.save(match);

		await match.init();

		return id;
	}

	static get(id: string) {
		return matches.get(id);
	}

	static getAll() {
		return Array.from(matches.values());
	}

	static delete(id: string) {
		const match = matches.get(id);
		if (match) {
			match.stop();
			matches.delete(id);
			return true;
		} else {
			return false;
		}
	}

	static async init() {
		setInterval(() => {
			MatchService.saveAll();
		}, 60000);

		const matchesFromStorage = await Storage.list();
		console.log('TCL: MatchService -> init -> matchesFromStorage', matchesFromStorage);
		for (let i = 0; i < matchesFromStorage.length; i++) {
			const matchId = matchesFromStorage[i];
			const matchFromStorage: SerializedMatch = JSON.parse(await Storage.read(matchId));
			if (matchFromStorage.state !== EMatchSate.FINISHED && matchId === matchFromStorage.id) {
				console.log('load match from db', matchId);
				const match = SerializedMatch.fromSerializedToNormal(matchFromStorage);
				matches.set(match.id, match);
				await match.init();
			}
		}
	}

	static async save(match: Match) {
		await Storage.write(
			match.id,
			JSON.stringify(SerializedMatch.fromNormalToSerialized(match))
		);
	}

	static async saveAll() {
		console.log(`save ${matches.size} match${matches.size === 1 ? '' : 'es'}`);

		const allMatches = Array.from(matches.values());

		for (let i = 0; i < allMatches.length; i++) {
			await MatchService.save(allMatches[i]);
		}
	}
}
