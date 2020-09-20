import { Match } from './match';
import { v4 as uuidv4 } from 'uuid';
import { ISerializedMatchInitData } from '../interfaces/matchInitData';

const matches: Map<string, Match> = new Map();

export class MatchService {
	static async create(matchInitData: ISerializedMatchInitData): Promise<string> {
		const id =
			process.env.NODE_ENV === 'development'
				? '00000000-0000-0000-0000-000000000000'
				: uuidv4();
		const match = new Match(id, matchInitData);
		matches.set(id, match);
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
			return true;
		} else {
			return false;
		}
	}
}
