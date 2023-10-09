import { useNavigate } from '@solidjs/router';
import { Component, createEffect, createSignal, Show } from 'solid-js';
import {
	getOtherTeamAB,
	IElectionStep,
	IMatch,
	IMatchCreateDto,
	TMatchMode,
	TTeamAB,
} from '../../../common';
import { TextArea } from '../components/TextArea';
import { TextInput } from '../components/TextInput';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { Card } from '../components/Card';
import { SelectInput } from '../components/SelectInput';
import { ToggleInput } from '../components/ToggleInput';

const DEFAULT_MAPS = [
	'de_ancient',
	'de_anubis',
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
	const [useOwnGameServer, setUseOwnGameServer] = createSignal(true);
	const [ip, setIp] = createSignal('');
	const [port, setPort] = createSignal(27015);
	const [rconPassword, setRconPassword] = createSignal('');
	const [electionPreset, setElectionPreset] = createSignal('bo1');
	const [mode, setMode] = createSignal<TMatchMode>('SINGLE');
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
			gameServer: useOwnGameServer()
				? {
						ip: ip(),
						port: port(),
						rconPassword: rconPassword(),
				  }
				: null,
			tmtLogAddress: window.location.protocol + '//' + window.location.host,
			mode: mode(),
		};
	};

	const getElectionSteps = (): IElectionStep[] => {
		const electionSteps: IElectionStep[] = [];
		const mapPoolCount = getMapPool().length;
		let currentTeam: TTeamAB = 'TEAM_A';
		let mapCount = 0;

		if (electionPreset() === 'bo1') {
			mapCount = 1;
		}

		if (electionPreset() === 'bo3') {
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
		<Card>
			<TextArea
				label={t('Map Pool')}
				value={maps()}
				onInput={(e) => setMaps(e.currentTarget.value)}
				rows="8"
			/>

			<TextInput
				label={t('Name Team A')}
				value={teamAName()}
				onInput={(e) => setTeamAName(e.currentTarget.value)}
			/>

			<TextInput
				label={t('Name Team B')}
				value={teamBName()}
				onInput={(e) => setTeamBName(e.currentTarget.value)}
			/>

			<ToggleInput
				label={t('Use Own Game Server')}
				checked={useOwnGameServer()}
				onInput={(e) => setUseOwnGameServer(e.currentTarget.checked)}
			/>

			<TextInput
				label={t('Game Server IP Address')}
				value={ip()}
				disabled={!useOwnGameServer()}
				onInput={(e) => setIp(e.currentTarget.value)}
			/>

			<TextInput
				label={t('Game Server Port')}
				type="number"
				value={port()}
				disabled={!useOwnGameServer()}
				onInput={(e) => setPort(parseInt(e.currentTarget.value))}
			/>

			<TextInput
				label={t('Game Server Rcon Password')}
				value={rconPassword()}
				disabled={!useOwnGameServer()}
				onInput={(e) => setRconPassword(e.currentTarget.value)}
			/>

			<SelectInput
				label={t('Map Election')}
				labelBottomLeft={
					electionPreset() === 'bo1'
						? t('Alternate map bans, last map will be played, knife for side.')
						: electionPreset() === 'bo3'
						? t('Alternate map bans, last three maps will be played, knife for side.')
						: false
				}
				onInput={(e) => setElectionPreset(e.currentTarget.value)}
				value={electionPreset()}
			>
				<option value="bo1">{t('Best of 1')}</option>
				<option value="bo3">{t('Best of 3')}</option>
			</SelectInput>

			<SelectInput
				label={t('Mode')}
				labelBottomLeft={
					mode() === 'SINGLE'
						? t('Single mode: stops when match is finished')
						: mode() === 'LOOP'
						? t('Loop mode: starts again after match is finished')
						: false
				}
				onInput={(e) => setMode(e.currentTarget.value as TMatchMode)}
				value={mode()}
			>
				<option value="SINGLE">{t('Single')}</option>
				<option value="LOOP">{t('Loop')}</option>
			</SelectInput>

			<TextArea
				label={t('Expert/Dev Mode')}
				rows="25"
				value={json()}
				onInput={(e) => setJson(e.currentTarget.value)}
				class="font-mono"
			/>

			<div class="pt-4 text-center">
				<button class="btn btn-primary" onClick={() => createMatch()}>
					{t('Create Match')}
				</button>
			</div>
		</Card>
	);
};
