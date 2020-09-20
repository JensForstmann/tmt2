import Datastore from 'nedb-promises';
import { Match } from './match';

export const MatchesDB = new Datastore({ filename: 'matches.db', autoload: true });

export class Database {
	static saveMatch(match: Match) {
		// MatchesDB.update({ _id: match._id }, {
		//     ...match
		// }, {
		//     upsert: true
		// });
	}
}
