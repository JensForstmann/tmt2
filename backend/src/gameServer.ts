import { IGameServer } from '../../common';
import * as Match from './match';
import { parseMapParts } from './matchMap';
import { Rcon } from './rcon-client';

export const colors = {
	white: '\u0001', // #FFFFFF
	red: '\u0002', // #FF0000
	purple: '\u0003', // #BB82F0
	green: '\u0004', // #41FF41
	lightGreen: '\u0005', // #C0FF91
	lime: '\u0006', // #A3FF48
	lightRed: '\u0007', // #FF4141
	grey: '\u0008', // #C6CBD0
	lightOrange: '\u0009', // #EDE47B
	orange: '\u0010', // #E4AF3A
};

export const create = async (dto: IGameServer, log: (msg: string) => void): Promise<Rcon> => {
	const rcon = new Rcon({
		host: dto.ip,
		port: dto.port,
		password: dto.rconPassword,
	});

	rcon.on('error', (err) => log(`Rcon socket error: ${err}`));

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
			match.log(`Rcon error with command ${command}: ${err} -> return ''`);
			return '';
		} else {
			throw err;
		}
	}
};

type IngamePlayer = {
	userId: string;
	name: string;
};

export const getPlayers = async (match: Match.Match): Promise<IngamePlayer[]> => {
	/* Example output from "rcon status":
	...
	...
	...
	---------players--------
	id     time ping loss      state   rate adr name
	65535 [NoChan]    0    0 challenging      0unknown ''
	65535 [NoChan]    0    0 challenging      0unknown ''
	2    00:40    0    0     active 786432 127.0.0.1:65498 'Nickname'
	65535 [NoChan]    0    0 challenging      0unknown ''
	65535 [NoChan]    0    0 challenging      0unknown ''
	14      BOT    0    0     active      0 'Aspirant'
	15      BOT    0    0     active      0 'Rex'
	65535 [NoChan]    0    0 challenging      0unknown ''
	24      BOT    0    0     active      0 'Cavalry'
	65535 [NoChan]    0    0 challenging      0unknown ''
	#end
	*/
	const status = await exec(match, 'status');
	const playerLines =
		status
			.trim()
			.split('---------players--------')[1]
			?.trim()
			.split('\n')
			.filter((line, lineNumber) => lineNumber > 0) // remove header line
			.filter((line) => !line.startsWith('65535')) // remove these lines: 65535 [NoChan]    0    0 challenging      0unknown ''
			.map((line) => line.trim()) ?? [];

	// playerLines example:
	// 2    00:40    0    0     active 786432 127.0.0.1:65498 'Nickname'
	const players = playerLines
		.map((line) => {
			const matcher = line.match(/^(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+'(\S+)'$/);
			return matcher
				? {
						userId: matcher[1],
						name: matcher[2],
					}
				: null;
		})
		.filter((player): player is IngamePlayer => player !== null);

	return players;
};

export const kickAll = async (match: Match.Match) => {
	const players = await getPlayers(match);
	for (let i = 0; i < players.length; i++) {
		const userId = players[i]?.userId!;
		const name = players[i]?.name!;
		match.log(`Kick player id ${userId} (${name})`);
		await exec(match, `kickid ${userId}`);
	}
};

export const disconnect = async (match: Match.Match) => {
	try {
		await match.rconConnection?.end();
	} catch (err) {
		// ignore error
	}
};

export const formatMapName = (mapName: string | undefined) => {
	return colors.grey + parseMapParts(mapName ?? '').external + colors.white;
};
