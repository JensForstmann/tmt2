import { Controller, Get, Route, Security } from '@tsoa/runtime';
import * as WebSocket from './webSocket';

@Route('/api/debug')
@Security('bearer_token')
export class DebugController extends Controller {
	@Get('webSockets')
	async getWebSocketClients() {
		return WebSocket.getClients();
	}
}
