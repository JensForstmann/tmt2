import express, { ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import { RegisterRoutes } from './routes';
import { ValidateError } from 'tsoa';
import axios from 'axios';
import { IMatchInitData } from './match/match';
import { EMapMode, ESideFixed, EWho, ESideMode } from './match/election';

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
	console.log(`App listening on port ${port}`);
	if (process.env.DO_AXIOS) {
		console.log('init match');
		const matchInitData: IMatchInitData = {
			mapPool: ['de_dust2'],
			team1: {
				name: 'team1',
			},
			team2: {
				name: 'team2',
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
			rcon: {
				init: ['say init rcon loaded'],
				knife: [
					'sv_buy_status_override 3; mp_give_player_c4 0; mp_startmoney 0; mp_ct_default_secondary ""; mp_t_default_secondary ""',
					'mp_freezetime 0; mp_roundtime 60; mp_roundtime_defuse 0; mp_roundtime_deployment 0; mp_roundtime_hostage 0',
					'say knife rcon loaded',
				],
				match: [
					'sv_buy_status_override 0; mp_give_player_c4 1; mp_startmoney 800; mp_ct_default_secondary "weapon_hkp2000"; mp_t_default_secondary "weapon_glock"',
					'mp_roundtime 5; mp_roundtime_defuse 0; mp_roundtime_deployment 0; mp_roundtime_hostage 0',
					'mp_maxrounds 6',
					'say match rcon loaded',
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
