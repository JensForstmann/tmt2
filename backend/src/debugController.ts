import { Controller, Get, Route, Security } from '@tsoa/runtime';
import { COMMIT_SHA, IMAGE_BUILD_TIMESTAMP, PORT, TMT_LOG_ADDRESS, VERSION } from '.';
import { IDebugResponse } from '../../common';
import { Settings } from './settings';
import { STORAGE_FOLDER } from './storage';
import * as WebSocket from './webSocket';

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
	async getInfos(): Promise<IDebugResponse> {
		return {
			tmtVersion: VERSION,
			tmtCommitSha: COMMIT_SHA,
			tmtImageBuildTimestamp: IMAGE_BUILD_TIMESTAMP,
			tmtStorageFolder: STORAGE_FOLDER,
			tmtPort: PORT,
			tmtLogAddress: TMT_LOG_ADDRESS,
			tmtSayPrefix: Settings.SAY_PREFIX,
			webSockets: WebSocket.getClients(),
		};
	}
}
