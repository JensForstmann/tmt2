import { Controller, Get, NoSecurity, Route, Security } from '@tsoa/runtime';
import { TMT_LOG_ADDRESS } from '.';

@Route('/api/config')
@Security('bearer_token')
export class ConfigController extends Controller {
	@Get()
	@NoSecurity()
	async getConfig(): Promise<{
		tmtLogAddress: string | null;
	}> {
		return {
			tmtLogAddress: TMT_LOG_ADDRESS,
		};
	}
}
