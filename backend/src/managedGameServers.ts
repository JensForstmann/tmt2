import { IGameServer, IManagedGameServer, IManagedGameServerUpdateDto } from '../../common';
import * as GameServer from './gameServer';
import * as Storage from './storage';
import { SqlAttribute, TableSchema } from './tableSchema';

const managedGameServers = new Map<string, IManagedGameServer>();
const GAME_SERVERS_TABLE = 'gameServers';

const write = async () => {
	await Storage.flushDB(GAME_SERVERS_TABLE);
	for (const managedGameServer of managedGameServers.values()) {
		await Storage.insertDB(
			GAME_SERVERS_TABLE,
			new Map<string, any>(Object.entries(managedGameServer))
		);
	}
};

const key = (gameServer: IManagedGameServerUpdateDto) => {
	return gameServer.ip + ':' + gameServer.port;
};

export const setup = async () => {
	const attributes = [
		{ name: 'ip', type: 'TEXT' },
		{ name: 'port', type: 'INTEGER' },
		{ name: 'rconPassword', type: 'TEXT' },
		{ name: 'usedBy', type: 'TEXT' },
		{ name: 'canBeUsed', type: 'INTEGER' },
	] as SqlAttribute[];	
	const tableSchema = new TableSchema(GAME_SERVERS_TABLE, attributes, ['ip', 'port']);
	await Storage.createTableDB(tableSchema);

	const data = (await Storage.queryDB(
		`SELECT * FROM ${GAME_SERVERS_TABLE}`
	)) as IManagedGameServer[];
	data.forEach((managedGameServer) => add(managedGameServer, false));
};

export const get = (ip: string, port: number) => {
	return managedGameServers.get(ip + ':' + port);
};

export const getAll = () => {
	return Array.from(managedGameServers.values());
};

export const add = async (managedGameServer: IManagedGameServer, writeToDisk = true) => {
	if (managedGameServers.has(key(managedGameServer))) {
		throw 'this is already a managed game server';
	}
	managedGameServers.set(key(managedGameServer), managedGameServer);
	if (writeToDisk) {
		await write();
	}
};

export const update = async (dto: IManagedGameServerUpdateDto) => {
	const managedGameServer = managedGameServers.get(key(dto));
	if (!managedGameServer) {
		throw 'this is not a managed game server';
	}
	const updated = { ...managedGameServer, ...dto };
	managedGameServers.set(key(dto), updated);
	await write();
	return updated;
};

export const remove = async (gameServer: IManagedGameServerUpdateDto) => {
	const removed = managedGameServers.delete(key(gameServer));
	if (removed) {
		await write();
	}
};

export const getFree = async (matchId: string): Promise<IGameServer | undefined> => {
	const free = getAll().find(
		(managedGameServer) => managedGameServer.usedBy === null && managedGameServer.canBeUsed
	);
	if (free) {
		free.usedBy = matchId;
		await write();
		return {
			ip: free.ip,
			port: free.port,
			rconPassword: free.rconPassword,
			hideRconPassword: true,
		};
	}
	return;
};

export const free = async (gameServer: IManagedGameServerUpdateDto, matchId: string) => {
	const managedGameServer = managedGameServers.get(key(gameServer));
	if (managedGameServer?.usedBy === matchId) {
		managedGameServer.usedBy = null;
		await write();
	}
};

export const execManyRcon = async (managedGameServer: IManagedGameServer, commands: string[]) => {
	const responses = [];

	const rconConnection = await GameServer.create(
		{
			ip: managedGameServer.ip,
			port: managedGameServer.port,
			rconPassword: managedGameServer.rconPassword,
		},
		(msg) => responses.push(`ERROR: ${msg}`)
	);

	for (let i = 0; i < commands.length; i++) {
		responses.push(await rconConnection.send(commands[i]!));
	}

	try {
		await rconConnection.end();
	} catch (err) {
		responses.push(`ERROR: ${err}`);
	}

	return responses;
};
