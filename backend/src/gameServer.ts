import { Rcon } from 'rcon-client';

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
		this.rconConnection.connect();
	}

	async setupRconConnection() {
		this.rconConnection = new Rcon({
			host: this.ip,
			port: this.port,
			password: this.rconPassword,
		});
		await this.rconConnection.connect();
	}

	async rcon(command: string, suppressError: boolean = true) {
		try {
			return await this.rconConnection.send(command);
		} catch (err) {
			if (suppressError) {
				console.warn('rcon error: ', command, err);
				return '';
			} else {
				throw err;
			}
		}
	}

	async kickAll() {
		const status = await this.rcon('status');
		//# userid name uniqueid connected ping loss state rate adr
		//#  2 1 "Yenz" STEAM_1:0:8520813 02:50 25 0 active 196608 172.24.16.1:27005
		const userIds = status
			.trim()
			.split('\n')
			.filter((line) => line.trim()[0] === '#')
			.filter((line, lineNumber) => lineNumber > 0) // remove header line
			.map((line) => line.substr(1).trim()) // remove # and trim line
			.map((line) => line.split(' ')[0]); // extract first part (the user id)
		userIds.forEach((userId) => this.rcon(`kickid ${userId}`));
	}

	quitServer() {
		this.rcon('quit');
	}
}
