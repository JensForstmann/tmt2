import { IGameServer, IManagedGameServer, IManagedGameServerUpdateDto } from '../../common';
import * as Storage from './storage';

const FILE_NAME = 'managed_game_servers.json';
const managedGameServers = new Map<string, IManagedGameServer>();

const write = async () => {
	await Storage.write(FILE_NAME, Array.from(managedGameServers.values()));
};

const key = (gameServer: IManagedGameServerUpdateDto) => {
	return gameServer.ip + ':' + gameServer.port;
};

export const setup = async () => {
	const data = await Storage.read(FILE_NAME, [] as IManagedGameServer[]);
	data.forEach((managedGameServer) => add(managedGameServer, false));
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
