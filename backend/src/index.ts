import express, { ErrorRequestHandler } from 'express';
import { RegisterRoutes } from './routes';
import { ValidateError } from '@tsoa/runtime';
import * as MatchService from './matchService';
import * as Storage from './storage';

if (!process.env.TMT_LOG_ADDRESS) {
	throw 'environment variable TMT_LOG_ADDRESS is not set';
}

const PORT = process.env.TMT_PORT || 8080;

const app = express();

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
			console.log(`ERROR: ${req.method} ${req.url}:`, err);
			res.status(500).send(err + '');
		}
	} else {
		next(err);
	}
};

app.use(errorRequestHandler);

app.get('/api', (req, res) => {
	res.sendFile('swagger.json', { root: '.' });
});

const main = async () => {
	await Storage.setup();

	app.listen(PORT, async () => {
		console.log(`App listening on port ${PORT}`);
		await MatchService.setup(); // can only be done when http server is up and running (so that incoming logs can be handled)
	});
};

main().catch((err) => {
	console.error(err);
	console.error(`Error in main(): ${err}`);
});
