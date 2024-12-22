import { ValidateError } from '@tsoa/runtime';
import express, { ErrorRequestHandler } from 'express';
import { existsSync, readFileSync } from 'fs';
import http from 'http';
import path from 'path';
import * as Auth from './auth';
import * as Election from './election';
import * as ManagedGameServers from './managedGameServers';
import * as Match from './match';
import { checkAndNormalizeLogAddress } from './match';
import * as MatchMap from './matchMap';
import * as MatchService from './matchService';
import * as Presets from './presets';
import { RegisterRoutes } from './routes';
import * as Storage from './storage';
import * as WebSocket from './webSocket';
import * as StatsLogger from './statsLogger';

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

const APP_DIR = (() => {
	if (__dirname.endsWith(path.join('/backend/dist/backend/src'))) {
		// in production: __dirname = /app/backend/dist/backend/src
		return path.join(__dirname, '../../../..');
	}
	if (__dirname.endsWith(path.join('/backend/src'))) {
		// in development: __dirname = /app/backend/src
		return path.join(__dirname, '../..');
	}
	console.error(`__dirname is ${__dirname}`);
	throw 'Could not determine APP_DIR';
})();

const FRONTEND_DIR = path.join(APP_DIR, '/frontend/dist');

export const PORT = process.env['TMT_PORT'] || 8080;
export const VERSION = process.env['TMT_VERSION'] || null;
export const COMMIT_SHA = process.env['TMT_COMMIT_SHA'] || null;
export const IMAGE_BUILD_TIMESTAMP = (() => {
	const file = path.join(APP_DIR, '.TMT_IMAGE_BUILD_TIMESTAMP');
	if (existsSync(file)) {
		return readFileSync(file).toString().trim();
	}
	return null;
})();

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

app.get('*', express.static(FRONTEND_DIR));
app.get('*', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

const main = async () => {
	console.info(
		`Start TMT (version ${VERSION ?? 'unknown'}, commit ${COMMIT_SHA ?? 'unknown'}, build timestamp ${IMAGE_BUILD_TIMESTAMP ?? 'unknown'})`
	);
	console.info(`App dir: ${APP_DIR}, frontend dir: ${FRONTEND_DIR}`);
	await Storage.setup();
	await ManagedGameServers.setup();
	await StatsLogger.setup();
	await Auth.setup();
	await WebSocket.setup(httpServer);
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
