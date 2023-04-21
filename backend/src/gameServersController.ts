import { Body, Controller, Delete, Get, Patch, Post, Route, Security } from '@tsoa/runtime';
import {
	IManagedGameServer,
	IManagedGameServerCreateDto,
	IManagedGameServerUpdateDto,
} from '../../common';
import * as ManagedGameServers from './managedGameServers';

@Route('/api/gameservers')
@Security('bearer_token')
export class GameServersController extends Controller {
	@Get()
	async getGameServers(): Promise<IManagedGameServer[]> {
		return ManagedGameServers.getAll();
	}

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

	@Patch('{ip}/{port}')
	async updateGameServer(
		@Body() requestBody: IManagedGameServerUpdateDto
	): Promise<IManagedGameServer> {
		return await ManagedGameServers.update(requestBody);
	}

	@Delete('{ip}/{port}')
	async deleteGameServer(ip: string, port: number): Promise<void> {
		await ManagedGameServers.remove({
			ip: ip,
			port: port,
		});
	}
}
