import Datastore from 'nedb-promises';
import { Match } from './match';
import { v4 as uuidv4 } from 'uuid';
import { ISerializedMatchInitData } from '../interfaces/matchInitData';
import { EMatchSate, SerializedMatch } from '../interfaces/match';
import { SerializedMatchMap } from '../interfaces/matchMap';

export const matchesDb = new Datastore({ filename: 'matches.db', autoload: true });

const matches: Map<string, Match> = new Map();

export class MatchService {
	static async create(matchInitData: ISerializedMatchInitData): Promise<string> {
		const id =
			process.env.NODE_ENV === 'development'
				? '00000000-0000-0000-0000-000000000000'
				: uuidv4();
		const match = new Match(id, matchInitData);
		matches.set(id, match);

		matchesDb.update(
			{
				_id: match.id,
			},
			{
				_id: match.id,
				...SerializedMatch.fromNormalToSerialized(match),
			},
			{
				upsert: true,
			}
		);

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

	static async init() {
		const matchesFromDb = await matchesDb.find({
			state: {
				$ne: EMatchSate.FINISHED	
			}
		});

		for (let i = 0; i < matchesFromDb.length; i++) {
			console.log("load match from db");
			const matchFromDb: SerializedMatch = matchesFromDb[i] as any;
			const match = SerializedMatch.fromSerializedToNormal(matchFromDb);
			await match.init();
			matches.set(match.id, match);
		}
	}
}
