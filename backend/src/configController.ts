import { Controller, Get, NoSecurity, Route, Security } from '@tsoa/runtime';
import { TMT_LOG_ADDRESS } from '.';

@Route('/api/config')
@Security('bearer_token')
export class ConfigController extends Controller {
	/**
	 * Get some internal config variables. Currently only the set TMT_LOG_ADDRESS.
	 */
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
