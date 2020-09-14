import express, { ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import { RegisterRoutes } from './routes';
import { ValidateError } from 'tsoa';
import axios from 'axios';

const app = express();

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

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

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

const port = process.env.PORT || 8080;

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
	if (process.env.DO_AXIOS) {
		console.log('init match');
		axios.post(`http://localhost:${port}/api/matches`, {
			id: '1',
			mapPool: ['de_dust2'],
			team1: {
				id: '1',
				name: 'team1',
			},
			team2: {
				id: '2',
				name: 'team2',
			},
			electionSteps: [
				{
					map: {
						mode: 'PICK',
						who: 'TEAM_1',
					},
					side: {
						mode: 'PICK',
						who: 'TEAM_1',
					},
				},
			],
			gameServer: {
				ip: 'localhost',
				port: 27016,
				rconPassword: 'blob',
			},
			rconInit: ['sv_password 123'],
			rconConfig: ['say config loaded'],
			rconEnd: ['thx for travelling with deutsche bahn'],
		}); //.then(data => console.log("data", data));
	}
});
