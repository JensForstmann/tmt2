import { IMatchInitData, Match } from './match';
import { v4 as uuidv4 } from 'uuid';

const matches: Map<string, Match> = new Map();

export class MatchService {
	static async create(matchInitData: IMatchInitData): Promise<string> {
		const id = uuidv4();
		const match = new Match(id, matchInitData);
		matches.set(id, match);
		await match.init();
		return id;
	}

	static get(id: string) {
		return matches.get(id);
	}

	static getAll() {
		return [];
		// return Array.from(matches.values());
	}
}
