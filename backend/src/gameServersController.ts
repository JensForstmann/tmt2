import {
	Body,
	Controller,
	Delete,
	Get,
	OperationId,
	Patch,
	Post,
	Route,
	Security,
} from '@tsoa/runtime';
import {
	IManagedGameServer,
	IManagedGameServerCreateDto,
	IManagedGameServerUpdateDto,
} from '../../common';
import * as ManagedGameServers from './managedGameServers';

@Route('/api/gameservers')
@Security('bearer_token')
export class GameServersController extends Controller {
	/**
	 * Get all managed game servers.
	 */
	@Get()
	async getGameServers(): Promise<IManagedGameServer[]> {
		return ManagedGameServers.getAll();
	}

	/**
	 * Add a new managed game server.
	 */
	@Post()
	async createGameServer(
		@Body() requestBody: IManagedGameServerCreateDto
	): Promise<IManagedGameServer> {
		const managedGameServer: IManagedGameServer = {
			canBeUsed: true,
			...requestBody,
			usedBy: null,
		};
		if (!requestBody.ip) {
			throw 'invalid ip';
		}
		await ManagedGameServers.add(managedGameServer);
		return managedGameServer;
	}

	/**
	 * Change an existing managed game server.
	 */
	@Patch('{ip}/{port}')
	async updateGameServer(
		@Body() requestBody: IManagedGameServerUpdateDto,
		ip: string,
		port: number
	): Promise<IManagedGameServer> {
		return await ManagedGameServers.update(requestBody);
	}

	/**
	 * Delete an existing managed game server.
	 */
	@Delete('{ip}/{port}')
	async deleteGameServer(ip: string, port: number): Promise<void> {
		await ManagedGameServers.remove({
			ip: ip,
			port: port,
		});
	}

	/**
	 * Execute a rcon command on the game server.
	 */
	@Post('{ip}/{port}')
	@OperationId('GameServerRcon')
	async rcon(ip: string, port: number, @Body() requestBody: string[]): Promise<string[] | void> {
		const managedGameServers = ManagedGameServers.get(ip, port);
		if (!managedGameServers) {
			this.setStatus(404);
			return;
		}
		return await ManagedGameServers.execManyRcon(managedGameServers, requestBody);
	}
}
