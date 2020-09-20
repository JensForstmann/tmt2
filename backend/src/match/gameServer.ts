import { Rcon } from 'rcon-client/lib';

export class GameServer {
	rconConnection: Rcon;
	ip: string;
	port: number;
	rconPassword: string;

	constructor(ip: string, port: number, rconPassword: string) {
		this.ip = ip;
		this.port = port;
		this.rconPassword = rconPassword;
		this.rconConnection = new Rcon({
			host: this.ip,
			port: this.port,
			password: this.rconPassword,
		});
		this.setupRconConnection();
	}

	setupRconConnection() {
		this.rconConnection = new Rcon({
			host: this.ip,
			port: this.port,
			password: this.rconPassword,
		});
		this.rconConnection.connect();
	}

	async rcon(command: string, suppressError: boolean = true) {
		try {
			return await this.rconConnection.send(command);
		} catch (err) {
			if (suppressError) {
				console.warn('rcon error: ', err);
				return '';
			} else {
				throw err;
			}
		}
	}
}
