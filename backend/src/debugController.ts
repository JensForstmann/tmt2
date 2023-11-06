import { Controller, Get, Route, Security } from '@tsoa/runtime';
import * as WebSocket from './webSocket';
import { PORT, TMT_LOG_ADDRESS, VERSION } from '.';
import { Settings } from './settings';
import { STORAGE_FOLDER } from './storage';

@Route('/api/debug')
@Security('bearer_token')
export class DebugController extends Controller {
	/**
	 * Get all connected web socket clients.
	 */
	@Get('webSockets')
	async getWebSocketClients() {
		return WebSocket.getClients();
	}

	@Get('/')
	async getInfos() {
		return {
			tmtVersion: VERSION,
			tmtStorageFolder: STORAGE_FOLDER,
			tmtPort: PORT,
			tmtLogAddress: TMT_LOG_ADDRESS,
			tmtSayPrefix: Settings.SAY_PREFIX,
			webSockets: WebSocket.getClients(),
		};
	}
}
