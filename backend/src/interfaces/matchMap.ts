import { MatchMap } from '../match/matchMap';

export interface ISerializedMatchMap {}

export class SerializedMatchMap implements ISerializedMatchMap {
	constructor(matchMap: MatchMap) {}

	static fromSerializedToNormal(serializedMatchMap: ISerializedMatchMap): MatchMap {
		// TODO
		return {} as MatchMap;
	}

	static fromNormalToSerialized(matchMap: MatchMap): ISerializedMatchMap {
		return new this(matchMap);
	}
}
