import { Controller, Post, Route, Security } from '@tsoa/runtime';

@Route('/api/login')
@Security('bearer_token')
export class LoginController extends Controller {
	/**
	 * Dummy endpoint to check if given token is valid without executing anything.
	 */
	@Post()
	async login() {}
}
