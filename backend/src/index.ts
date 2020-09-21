import express, { ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import { RegisterRoutes } from './routes';
import { ValidateError } from 'tsoa';
import axios from 'axios';
import * as path from 'path';
import { ISerializedMatchInitData } from './interfaces/matchInitData';
import { EMapMode, ESideFixed, ESideMode } from './interfaces/election';
import { MatchService } from './match/matchService';

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

app.get('/swagger.json', (req, res) => {
	res.sendFile(path.join(__dirname, 'swagger.json'));
});

app.listen(port, async () => {
	console.log(`App listening on port ${port}`);
	await MatchService.init();
	if (MatchService.getAll().length === 0 && process.env.NODE_ENV === 'development') {
		console.log('init match');
		const matchInitData: ISerializedMatchInitData = {
			mapPool: ['de_dust2'],
			teamA: {
				name: 'teamA',
			},
			teamB: {
				name: 'teamB',
			},
			electionSteps: [
				{
					map: {
						mode: EMapMode.FIXED,
						fixed: 'de_dust2',
					},
					side: {
						mode: ESideMode.FIXED,
						fixed: ESideFixed.TEAM_1_CT,
					},
				},
				{
					map: {
						mode: EMapMode.FIXED,
						fixed: 'de_dust2',
					},
					side: {
						mode: ESideMode.FIXED,
						fixed: ESideFixed.TEAM_1_T,
					},
				},
				{
					map: {
						mode: EMapMode.FIXED,
						fixed: 'de_dust2',
					},
					side: {
						mode: ESideMode.RANDOM,
					},
				},
			],
			gameServer: {
				ip: 'localhost',
				port: 27016,
				rconPassword: 'blob',
			},
			rconCommands: {
				init: ['mp_autokick 0', 'say init rcon loaded'],
				knife: [
					'exec esl5on5bl.cfg',
					'mp_give_player_c4 0; mp_startmoney 0; mp_ct_default_secondary ""; mp_t_default_secondary ""',
					'mp_roundtime 60; mp_roundtime_defuse 0; mp_roundtime_deployment 0; mp_roundtime_hostage 0',
					'say "> Special Knife Config Loaded <"',
				],
				match: [
					'mp_give_player_c4 1; mp_startmoney 800; mp_ct_default_secondary "weapon_hkp2000"; mp_t_default_secondary "weapon_glock"',
					'mp_roundtime 1.92; mp_roundtime_defuse 1.92; mp_roundtime_deployment 0; mp_roundtime_hostage 0',
					'exec esl5on5bl.cfg',
				],
				end: ['say end rcon loaded'],
			},
		};
		axios.post(`http://localhost:${port}/api/matches`, matchInitData).catch((err) => {
			err && err.response && err.response.data
				? console.error(err.response.data)
				: console.error(err);
		});
	}
});
