import { useNavigate } from '@solidjs/router';
import { Component, createEffect, createSignal, Show } from 'solid-js';
import { getOtherTeamAB, IElectionStep, IMatch, IMatchCreateDto, TTeamAB } from '../../../common';
import { TextArea } from '../components/TextArea';
import { TextInput } from '../components/TextInput';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';

const DEFAULT_MAPS = [
	'de_ancient',
	'de_dust2',
	'de_inferno',
	'de_mirage',
	'de_nuke',
	'de_overpass',
	'de_vertigo',
];

export const CreatePage: Component = () => {
	const navigate = useNavigate();

	const [maps, setMaps] = createSignal(DEFAULT_MAPS.join('\n'));
	const [teamAName, setTeamAName] = createSignal('');
	const [teamBName, setTeamBName] = createSignal('');
	const [ip, setIp] = createSignal('');
	const [port, setPort] = createSignal(27015);
	const [rconPassword, setRconPassword] = createSignal('');
	const [mode, setMode] = createSignal('bo1');
	const [json, setJson] = createSignal('');

	const fetcher = createFetcher();

	createEffect(() => {
		try {
			const dto = getMatchCreateDto();
			setJson(JSON.stringify(dto, undefined, 4));
		} catch (err) {
			setJson('ERROR!\n' + err);
		}
	});

	const getMapPool = () => {
		return maps()
			.trim()
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => l.length > 0);
	};

	const getMatchCreateDto = (): IMatchCreateDto => {
		return {
			mapPool: getMapPool(),
			teamA: {
				name: teamAName().trim(),
			},
			teamB: {
				name: teamBName().trim(),
			},
			electionSteps: getElectionSteps(),
			gameServer: {
				ip: ip(),
				port: port(),
				rconPassword: rconPassword(),
			},
			tmtLogAddress: window.location.protocol + '//' + window.location.host,
		};
	};

	const getElectionSteps = (): IElectionStep[] => {
		const electionSteps: IElectionStep[] = [];
		const mapPoolCount = getMapPool().length;
		let currentTeam: TTeamAB = 'TEAM_A';
		let mapCount = 0;

		if (mode() === 'bo1') {
			mapCount = 1;
		}

		if (mode() === 'bo3') {
			mapCount = 3;
		}

		const banCount = mapPoolCount - mapCount;

		if (banCount < 0) {
			throw 'map pool to small';
		}
		for (let i = 0; i < banCount; i++) {
			electionSteps.push({
				map: {
					mode: 'BAN',
					who: currentTeam,
				},
			});
			currentTeam = getOtherTeamAB(currentTeam);
		}
		for (let i = 0; i < mapCount; i++) {
			electionSteps.push({
				map: {
					mode: 'RANDOM_PICK',
				},
				side: {
					mode: 'KNIFE',
				},
			});
		}

		return electionSteps;
	};

	const createMatch = async () => {
		const response = await fetcher<IMatch>('POST', '/api/matches', JSON.parse(json()));
		if (response?.id) {
			navigate(`/matches/${response.id}`);
		}
	};

	return (
		<div class="mb-20">
			<h4>{t('map pool')}</h4>
			<TextArea rows="8" value={maps()} onInput={(e) => setMaps(e.currentTarget.value)} />

			<h4>{t('name team a')}</h4>
			<TextInput value={teamAName()} onInput={(e) => setTeamAName(e.currentTarget.value)} />

			<h4>{t('name team b')}</h4>
			<TextInput value={teamBName()} onInput={(e) => setTeamBName(e.currentTarget.value)} />

			<h4>{t('game server ip')}</h4>
			<TextInput value={ip()} onInput={(e) => setIp(e.currentTarget.value)} />

			<h4>{t('game server port')}</h4>
			<TextInput
				type="number"
				value={port()}
				onInput={(e) => setPort(parseInt(e.currentTarget.value))}
			/>

			<h4>{t('game server rcon password')}</h4>
			<TextInput
				value={rconPassword()}
				onInput={(e) => setRconPassword(e.currentTarget.value)}
			/>

			<h4>{t('Map Election')}</h4>
			<select onInput={(e) => setMode(e.currentTarget.value)} value={mode()}>
				<option value="bo1">{t('best of 1')}</option>
				<option value="bo3">{t('best of 3')}</option>
			</select>
			<p>
				<Show when={mode() === 'bo1'}>
					{t('alternate map bans, last map will be played, knife for side')}
				</Show>
				<Show when={mode() === 'bo3'}>
					{t('alternate map bans, last three maps will be played, knife for side')}
				</Show>
			</p>

			<h4>{t('Expert/Dev Mode')}</h4>
			<TextArea
				rows="25"
				value={json()}
				onInput={(e) => setJson(e.currentTarget.value)}
				class="font-mono"
			/>

			<div class="text-center">
				<button onClick={() => createMatch()}>{t('create match')}</button>
			</div>
		</div>
	);
};
