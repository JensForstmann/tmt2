import { Controller, Post, Route, Security } from '@tsoa/runtime';

@Route('/api/login')
@Security('bearer_token')
export class LoginController extends Controller {
	@Post()
	async login() {}
}
