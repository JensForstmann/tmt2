import { Rcon } from './rcon-client';
import { IGameServer } from './interfaces/gameServer';
import * as Match from './match';

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

export const kickAll = async (match: Match.Match) => {
	const status = await exec(match, 'status');
	//# userid name uniqueid connected ping loss state rate adr
	//#  2 1 "Yenz" STEAM_1:0:8520813 02:50 25 0 active 196608 172.24.16.1:27005
	const userIds = status
		.trim()
		.split('\n')
		.filter((line) => line.trim()[0] === '#')
		.filter((line, lineNumber) => lineNumber > 0) // remove header line
		.map((line) => line.substring(1).trim()) // remove # and trim line
		.map((line) => line.split(' ')[0]); // extract first part (the user id)
	for (let i = 0; i < userIds.length; i++) {
		await exec(match, `kickid ${userIds[i]}`);
	}
};

export const disconnect = async (match: Match.Match) => {
	try {
		await match.rconConnection.end();
	} catch (err) {
		// ignore error
	}
};
