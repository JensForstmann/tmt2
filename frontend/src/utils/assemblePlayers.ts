import { IPlayerStats } from '../../../common';

export const assemblePlayers = (players: IPlayerStats[]) => {
	let addedSteamIds: Set<string> = new Set();
	let result: IPlayerStats[] = [];
	for (const player of players) {
		if (!addedSteamIds.has(player.steamId)) {
			result.push({ ...player });
			addedSteamIds.add(player.steamId);
		} else {
			for (const rplayer of result) {
				if (rplayer.steamId === player.steamId) {
					const i = result.indexOf(rplayer);
					result[i].kills += player.kills;
					result[i].deaths += player.deaths;
					result[i].assists += player.assists;
					result[i].hits += player.hits;
					result[i].headshots += player.headshots;
					result[i].rounds += player.rounds;
					result[i].damages += player.damages;
					continue;
				}
			}
		}
	}
	for (const player of result) {
		player.diff = player.kills - player.deaths;
		player.hsPct = Math.round((player.headshots / player.hits) * 100);
		player.adr = Math.round(player.damages / player.rounds);
	}
	return result;
};
