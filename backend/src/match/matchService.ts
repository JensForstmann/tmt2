import { MatchInitData, Match } from './match';

const matches: Map<string, Match> = new Map();

export class MatchService {
	static async create(matchInitData: MatchInitData): Promise<string> {
		if (!matches.has(matchInitData.id)) {
			const match = new Match(matchInitData);
			matches.set(matchInitData.id, match);
			await match.init();
			return matchInitData.id;
		} else {
			throw 'match already exists';
		}
	}

	static get(id: string) {
		return matches.get(id);
	}

	static getAll() {
		return [];
		// return Array.from(matches.values());
	}
}
