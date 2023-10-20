import { ValidateError } from '@tsoa/runtime';
import express, { ErrorRequestHandler } from 'express';
import { existsSync } from 'fs';
import http from 'http';
import path from 'path';
import * as Auth from './auth';
import * as Election from './election';
import * as ManagedGameServers from './managedGameServers';
import * as Presets from './presets';
import * as Match from './match';
import { checkAndNormalizeLogAddress } from './match';
import * as MatchMap from './matchMap';
import * as MatchService from './matchService';
import { RegisterRoutes } from './routes';
import * as Storage from './storage';
import * as WebSocket from './webSocket';

export const TMT_LOG_ADDRESS: string | null = (() => {
	if (!process.env['TMT_LOG_ADDRESS']) {
		console.warn('Environment variable TMT_LOG_ADDRESS is not set');
		console.warn('Every match must be init with tmtLogAddress');
		return null;
	}
	const addr = checkAndNormalizeLogAddress(process.env['TMT_LOG_ADDRESS']);
	if (!addr) {
		throw 'invalid environment variable: TMT_LOG_ADDRESS';
	}
	return addr;
})();

const STATIC_PATH = (() => {
	if (existsSync(path.join(__dirname, '../../frontend/dist'))) {
		return path.join(__dirname, '../../frontend/dist');
	}
	if (existsSync(path.join(__dirname, '../../../../frontend/dist'))) {
		return path.join(__dirname, '../../../../frontend/dist');
	}
	throw 'Could not determine static path';
})();

export const PORT = process.env['TMT_PORT'] || 8080;
export const VERSION = process.env['COMMIT_SHA'] || null;

const app = express();
const httpServer = http.createServer(app);

// CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Access-Control-Allow-Headers', '*');
	next();
});

app.use((req, res, next) => {
	if (req.is('text/plain')) {
		req.body = { raw: '' };
		req.setEncoding('utf8');
		req.on('data', function (chunk) {
			req.body.raw += chunk;
		});
		req.on('end', next);
	} else {
		next();
	}
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

RegisterRoutes(app);

const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (req.url.startsWith('/api/')) {
		if (err instanceof ValidateError) {
			res.status(400).send(err);
		} else {
			const status =
				typeof err?.status === 'number' &&
				Number.isInteger(err?.status) &&
				err?.status >= 100 &&
				err?.status <= 599
					? err.status
					: 500;
			if (status !== 401) {
				console.error(err);
				console.error(`ERROR: ${req.method} ${req.url}: ${err}`);
			}
			if (err + '' !== '[object Object]') {
				res.status(status).send(err + '');
			} else {
				res.sendStatus(status);
			}
		}
	} else {
		next(err);
	}
};

app.use(errorRequestHandler);

app.get('/api', (req, res) => {
	res.sendFile('swagger.json', { root: '.' });
});

app.get('*', express.static(STATIC_PATH));
app.get('*', (req, res) => res.sendFile(path.join(STATIC_PATH, 'index.html')));

const main = async () => {
	console.info(`Start TMT (version ${VERSION ? VERSION : 'unknown'})`);
	await Storage.setup();
	await Auth.setup();
	await WebSocket.setup(httpServer);
	await ManagedGameServers.setup();
	await Presets.setup();
	Match.registerCommandHandlers();
	MatchMap.registerCommandHandlers();
	Election.registerCommandHandlers();

	httpServer.listen(PORT, async () => {
		console.info(`App listening on port ${PORT}`);
		await MatchService.setup(); // can only be done when http server is up and running (so that incoming logs can be handled)
	});
};

main().catch((err) => {
	console.error(err);
	console.error(`Error in main(): ${err}`);
});
