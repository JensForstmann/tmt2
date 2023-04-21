import { IGameServer, IPlayer } from '../../common';
import * as Match from './match';
import { Rcon } from './rcon-client';

export const create = async (dto: IGameServer, log: (msg: string) => void): Promise<Rcon> => {
	const rcon = new Rcon({
		host: dto.ip,
		port: dto.port,
		password: dto.rconPassword,
	});

	rcon.on('error', (err) => log(`rcon.on('error'): ${err}`));

	await rcon.connect();
	return rcon;
};

export const exec = async (match: Match.Match, command: string, suppressError: boolean = true) => {
	try {
		if (!match.rconConnection) {
			throw 'rconConnection is falsy';
		}
		return await match.rconConnection.send(command);
	} catch (err) {
		if (suppressError) {
			match.log(`rcon error with command ${command}: ${err} -> return ''`);
			return '';
		} else {
			throw err;
		}
	}
};

type IngamePlayer = {
	userId: string;
	name: string;
	steamId: string;
};

export const getPlayers = async (match: Match.Match): Promise<IngamePlayer[]> => {
	//# userid name uniqueid connected ping loss state rate adr
	//#  2 1 "PlayerName" STEAM_1:0:7426845 02:50 25 0 active 196608 172.24.16.1:27005
	const status = await exec(match, 'status');
	const playerLines = status
		.trim()
		.split('\n')
		.filter((line) => line.trim()[0] === '#')
		.filter((line, lineNumber) => lineNumber > 0) // remove header line
		.map((line) => line.substring(1).trim()); // remove # and trim line

	const players = playerLines
		.map((line) => {
			const matcher = line.match(/^(\d+) (\d+) "(.*)" (STEAM_\S*)/);
			return matcher
				? {
						userId: matcher[1],
						name: matcher[3],
						steamId: matcher[4],
				  }
				: null;
		})
		.filter((player): player is IngamePlayer => player !== null);

	return players;
};

export const kickAll = async (match: Match.Match) => {
	const players = await getPlayers(match);
	const userIds = players.map((player) => player.userId);
	for (let i = 0; i < userIds.length; i++) {
		await exec(match, `kickid ${userIds[i]}`);
	}
};

export const disconnect = async (match: Match.Match) => {
	try {
		await match.rconConnection?.end();
	} catch (err) {
		// ignore error
	}
};
