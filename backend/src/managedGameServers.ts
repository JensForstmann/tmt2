import { IGameServer, IManagedGameServer, IManagedGameServerUpdateDto } from '../../common';
import { db } from './database';
import * as GameServer from './gameServer';

const managedGameServers = new Map<string, IManagedGameServer>();

const key = (gameServer: IManagedGameServerUpdateDto) => {
	return gameServer.ip + ':' + gameServer.port;
};

export const setup = () => {
	const rows = db.prepare<[], TDbManagedGameServer>('SELECT * FROM managedGameServer').all();
	rows.map((row) => managedGameServerFromDb(row)).forEach((managedGameServer) =>
		add(managedGameServer, false)
	);
};

export const get = (ip: string, port: number) => {
	return managedGameServers.get(ip + ':' + port);
};

export const getAll = () => {
	return Array.from(managedGameServers.values());
};

export const add = (managedGameServer: IManagedGameServer, writeToDisk = true) => {
	if (managedGameServers.has(key(managedGameServer))) {
		throw 'this is already a managed game server';
	}
	managedGameServers.set(key(managedGameServer), managedGameServer);
	if (writeToDisk) {
		saveManagedGameServerToDb(managedGameServer);
	}
};

export const update = (dto: IManagedGameServerUpdateDto) => {
	const managedGameServer = managedGameServers.get(key(dto));
	if (!managedGameServer) {
		throw 'this is not a managed game server';
	}
	const updated = { ...managedGameServer, ...dto };
	managedGameServers.set(key(dto), updated);
	saveManagedGameServerToDb(updated);
	return updated;
};

export const remove = (gameServer: IManagedGameServerUpdateDto) => {
	const removed = managedGameServers.delete(key(gameServer));
	if (removed) {
		db.prepare<{ ip: string; port: number }>(
			'DELETE FROM managedGameServer WHERE ip = :ip AND port = :port'
		).run({ ip: gameServer.ip, port: gameServer.port });
	}
};

export const getFree = (matchId: string): IGameServer | undefined => {
	const free = getAll().find(
		(managedGameServer) => managedGameServer.usedBy === null && managedGameServer.canBeUsed
	);
	if (free) {
		free.usedBy = matchId;
		saveManagedGameServerToDb(free);
		return {
			ip: free.ip,
			port: free.port,
			rconPassword: free.rconPassword,
			hideRconPassword: true,
		};
	}
	return undefined;
};

export const free = (gameServer: IManagedGameServerUpdateDto, matchId: string) => {
	const managedGameServer = managedGameServers.get(key(gameServer));
	if (managedGameServer?.usedBy === matchId) {
		managedGameServer.usedBy = null;
		saveManagedGameServerToDb(managedGameServer);
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

export type TDbManagedGameServer = {
	ip: string;
	port: number;
	rconPassword: string;
	canBeUsed: number;
	usedBy: string | null;
};

const managedGameServerToDb = (managedGameServer: IManagedGameServer): TDbManagedGameServer => {
	return {
		ip: managedGameServer.ip,
		port: managedGameServer.port,
		rconPassword: managedGameServer.rconPassword,
		canBeUsed: managedGameServer.canBeUsed ? 1 : 0,
		usedBy: managedGameServer.usedBy,
	};
};

const managedGameServerFromDb = (dbManagedGameServer: TDbManagedGameServer): IManagedGameServer => {
	return {
		ip: dbManagedGameServer.ip,
		port: dbManagedGameServer.port,
		rconPassword: dbManagedGameServer.rconPassword,
		canBeUsed: !!dbManagedGameServer.canBeUsed,
		usedBy: dbManagedGameServer.usedBy,
	};
};

const saveManagedGameServerToDb = (managedGameServer: IManagedGameServer) => {
	db.prepare<TDbManagedGameServer>(
		`
		INSERT INTO managedGameServer (
            ip,
            port,
            rconPassword,
            canBeUsed,
            usedBy
        ) VALUES (
            :ip,
            :port,
            :rconPassword,
            :canBeUsed,
            :usedBy
        ) ON CONFLICT (ip, port) DO UPDATE SET
            ip = :ip,
            port = :port,
            rconPassword = :rconPassword,
            canBeUsed = :canBeUsed,
            usedBy = :usedBy
		WHERE ip = :ip AND port = :port
	`
	).run(managedGameServerToDb(managedGameServer));
};
