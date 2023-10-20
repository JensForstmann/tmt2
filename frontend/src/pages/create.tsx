import autoAnimate from '@formkit/auto-animate';
import { useNavigate } from '@solidjs/router';
import { Component, createEffect, createSignal, For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
	getOtherTeamAB,
	IElectionStep,
	IMatch,
	IMatchCreateDto,
	TMatchEndAction,
	TMatchMode,
	TTeamAB,
} from '../../../common';
import { IPreset, IPresetCreateDto } from '../../../common/types/preset';
import {
	SvgAdd,
	SvgDelete,
	SvgKeyboardArrowDown,
	SvgKeyboardArrowUp,
	SvgSave,
} from '../assets/Icons';
import { Card } from '../components/Card';
import { AddElectionStep, getElectionStepString } from '../components/ElectionStep';
import { SelectInput, TextArea, TextInput, ToggleInput } from '../components/Inputs';
import { Modal } from '../components/Modal';
import { createFetcher, isLoggedIn } from '../utils/fetcher';
import { t } from '../utils/locale';

const DEFAULT_MAPS = [
	'de_ancient',
	'de_anubis',
	'de_inferno',
	'de_mirage',
	'de_nuke',
	'de_overpass',
	'de_vertigo',
];

const DEFAULT_RCON_INIT = [
	'game_type 0; game_mode 1; sv_game_mode_flags 0; sv_skirmish_id 0',
	'say > RCON INIT LOADED <',
];
const DEFAULT_RCON_KNIFE = [
	'mp_give_player_c4 0; mp_startmoney 0; mp_ct_default_secondary ""; mp_t_default_secondary ""',
	'say > SPECIAL KNIFE CONFIG LOADED <',
];
const DEFAULT_RCON_MATCH = [
	'mp_give_player_c4 1; mp_startmoney 800; mp_ct_default_secondary "weapon_hkp2000"; mp_t_default_secondary "weapon_glock"',
	'mp_overtime_enable 1',
	'say > MATCH CONFIG LOADED <',
];
const DEFAULT_RCON_END = ['say > MATCH END RCON LOADED <'];

const getElectionStepsFromPreset = (preset: 'BO1' | 'BO3', mapPool: string[]): IElectionStep[] => {
	const electionSteps: IElectionStep[] = [];
	const mapPoolCount = mapPool.length;
	let currentTeam: TTeamAB = 'TEAM_A';
	let mapCount = 0;

	if (preset === 'BO1') {
		mapCount = 1;
	} else if (preset === 'BO3') {
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

const minifyMapPool = (maps: string) => {
	return maps
		.trim()
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l.length > 0);
};

export const CreatePage: Component = () => {
	const navigate = useNavigate();
	const fetcher = createFetcher();
	const [presets, setPresets] = createSignal<IPreset[]>([]);
	const [presetName, setPresetName] = createSignal('');
	const [selectedPresetId, setSelectedPresetId] = createSignal('');

	createEffect(() => {
		refreshPresets();
	});

	const refreshPresets = () => {
		fetcher<IPreset[]>('GET', `/api/presets`).then((presets) => {
			if (presets) {
				setPresets(presets);
			}
		});
	};

	const addPreset = () => {
		if (!presetName()) {
			return;
		}
		const presetCreateDto: IPresetCreateDto = {
			name: presetName(),
			data: matchCreateDto,
		};
		fetcher<IPreset>('POST', `/api/presets`, presetCreateDto).then((preset) => {
			if (preset) {
				setPresets((presets) => [...presets, preset]);
				setSelectedPresetId(preset.id);
				setPresetName(preset.name);
			}
		});
	};

	const updatePreset = () => {
		if (!selectedPresetId() || !presetName()) {
			return;
		}
		const updatePresetDto: IPreset = {
			id: selectedPresetId(),
			name: presetName(),
			data: matchCreateDto,
		};
		fetcher('PUT', `/api/presets`, updatePresetDto).then(() => {
			setPresets((presets) =>
				presets.map((preset) =>
					preset.id === updatePresetDto.id ? updatePresetDto : preset
				)
			);
		});
	};

	const deletePreset = () => {
		const presetIdToDelete = selectedPresetId();
		if (!presetIdToDelete) {
			return;
		}
		fetcher('DELETE', `/api/presets/${presetIdToDelete}`).then(() => {
			setPresets((presets) => presets.filter((preset) => preset.id !== presetIdToDelete));
			setSelectedPresetId('');
			setPresetName('');
		});
	};

	let addElectionStepIndex = 0;
	let electionStepModalRef: HTMLDialogElement | undefined;
	let electionStepsRef: HTMLDivElement | undefined;
	const [json, setJson] = createSignal('');
	const [errorMessage, setErrorMessage] = createSignal('');
	const [matchCreateDto, setMatchCreateDto] = createStore<IMatchCreateDto>({
		teamA: {
			name: 'Team A',
			advantage: 0,
		},
		teamB: {
			name: 'Team B',
			advantage: 0,
		},
		gameServer: null,
		mapPool: DEFAULT_MAPS,
		electionSteps: getElectionStepsFromPreset('BO1', DEFAULT_MAPS),
		rconCommands: {
			init: DEFAULT_RCON_INIT,
			knife: DEFAULT_RCON_KNIFE,
			match: DEFAULT_RCON_MATCH,
			end: DEFAULT_RCON_END,
		},
		matchEndAction: 'NONE',
		mode: 'SINGLE',
		tmtLogAddress: window.location.protocol + '//' + window.location.host,
		canClinch: true,
	});

	const createMatch = async () => {
		try {
			const response = await fetcher<IMatch>('POST', '/api/matches', JSON.parse(json()));
			if (response?.id) {
				navigate(`/matches/${response.id}`);
			} else {
				setErrorMessage(response + '');
			}
		} catch (err) {
			setErrorMessage(err + '');
		}
	};

	createEffect(() => {
		try {
			setJson(JSON.stringify(matchCreateDto, undefined, 4));
		} catch (err) {
			setJson('ERROR!\n' + err);
		}
	});

	onMount(() => {
		if (electionStepsRef) {
			autoAnimate(electionStepsRef);
		}
	});

	const setMatchDataFromPreset = (presetId: string) => {
		const preset = getPresetById(presetId);
		if (preset) {
			setMatchCreateDto(JSON.parse(JSON.stringify(preset.data)));
		}
	};

	const getPresetById = (presetId: string) => {
		return presets().find((preset) => preset.id === presetId);
	};

	return (
		<Card>
			<Show when={isLoggedIn()}>
				<div class="flex items-end space-x-2">
					<div class="flex-grow">
						<SelectInput
							label={t('Select Preset')}
							value={selectedPresetId()}
							onInput={(e) => {
								setSelectedPresetId(e.currentTarget.value);
								setPresetName(getPresetById(e.currentTarget.value)?.name ?? '');
								setMatchDataFromPreset(e.currentTarget.value);
							}}
							disabled={presets().length === 0}
						>
							<option value=""></option>
							<For each={presets()}>
								{(preset) => (
									<option
										value={preset.id}
										selected={selectedPresetId() === preset.id}
									>
										{preset.name}
									</option>
								)}
							</For>
						</SelectInput>
					</div>
					<button
						class="btn"
						onClick={() => deletePreset()}
						disabled={selectedPresetId() === ''}
					>
						<SvgDelete />
						{t('Delete preset')}
					</button>
				</div>
				<div class="flex items-end space-x-2">
					<div class="flex-grow">
						<TextInput
							label={t('Preset Name')}
							value={presetName()}
							onInput={(e) => setPresetName(e.currentTarget.value)}
						/>
					</div>
					<button
						class="btn"
						onClick={() => addPreset()}
						disabled={presetName().trim() === ''}
					>
						<SvgAdd />
						{t('Add new preset')}
					</button>
					<button
						class="btn"
						onClick={() => updatePreset()}
						disabled={presetName().trim() === '' || selectedPresetId() === ''}
					>
						<SvgSave />
						{t('Update preset')}
					</button>
				</div>
			</Show>
			<div class="prose pt-4">
				<h2>{t('Teams')}</h2>
			</div>
			<TextInput
				label={t('Team A Name')}
				value={matchCreateDto.teamA.name}
				onInput={(e) => setMatchCreateDto('teamA', 'name', e.currentTarget.value)}
			/>
			<TextInput
				label={t('Team A Advantage')}
				type="number"
				min={0}
				value={matchCreateDto.teamA.advantage ?? 0}
				onInput={(e) =>
					setMatchCreateDto('teamA', 'advantage', parseInt(e.currentTarget.value))
				}
			/>

			<TextInput
				label={t('Team B Name')}
				value={matchCreateDto.teamB.name}
				onInput={(e) => setMatchCreateDto('teamB', 'name', e.currentTarget.value)}
			/>

			<TextInput
				label={t('Team B Advantage')}
				type="number"
				min={0}
				value={matchCreateDto.teamB.advantage ?? 0}
				onInput={(e) =>
					setMatchCreateDto('teamB', 'advantage', parseInt(e.currentTarget.value))
				}
			/>

			<div class="prose pt-4">
				<h2>{t('Game Server')}</h2>
			</div>
			<ToggleInput
				label={t('Use Own Game Server')}
				checked={false}
				onInput={(e) =>
					e.currentTarget.checked
						? setMatchCreateDto('gameServer', {
								ip: '',
								port: 27015,
								rconPassword: '',
						  })
						: setMatchCreateDto('gameServer', null)
				}
			/>
			<TextInput
				label={t('Game Server IP Address')}
				value={matchCreateDto.gameServer?.ip ?? ''}
				disabled={matchCreateDto.gameServer === null}
				onInput={(e) => setMatchCreateDto('gameServer', 'ip', e.currentTarget.value)}
			/>
			<TextInput
				label={t('Game Server Port')}
				type="number"
				value={matchCreateDto.gameServer?.port ?? 27015}
				disabled={matchCreateDto.gameServer === null}
				onInput={(e) =>
					setMatchCreateDto('gameServer', 'port', parseInt(e.currentTarget.value))
				}
			/>

			<TextInput
				label={t('Game Server Rcon Password')}
				value={matchCreateDto.gameServer?.rconPassword ?? ''}
				disabled={matchCreateDto.gameServer === null}
				onInput={(e) =>
					setMatchCreateDto('gameServer', 'rconPassword', e.currentTarget.value)
				}
			/>

			<div class="prose pt-4 pb-2">
				<h2>{t('Map Pool')}</h2>
			</div>
			<TextArea
				value={DEFAULT_MAPS.join('\n')}
				onInput={(e) => setMatchCreateDto('mapPool', minifyMapPool(e.currentTarget.value))}
				rows="8"
			/>

			<div class="prose pt-4 pb-2">
				<h2>{t('Election Steps')}</h2>
			</div>
			<div class="flex items-baseline">
				<div class="pr-2">{t('Quick Load:')}</div>
				<div class="join">
					<button
						class="btn btn-sm join-item"
						onClick={() =>
							setMatchCreateDto(
								'electionSteps',
								getElectionStepsFromPreset('BO1', matchCreateDto.mapPool)
							)
						}
					>
						{t('Best of 1')}
					</button>
					<button
						class="btn btn-sm join-item"
						onClick={() =>
							setMatchCreateDto(
								'electionSteps',
								getElectionStepsFromPreset('BO3', matchCreateDto.mapPool)
							)
						}
					>
						{t('Best of 3')}
					</button>
					<button
						class="btn btn-sm join-item"
						onClick={() => setMatchCreateDto('electionSteps', [])}
					>
						{t('Empty')}
					</button>
				</div>
			</div>

			<div class="space-y-1 pt-4" ref={electionStepsRef}>
				<For each={matchCreateDto.electionSteps}>
					{(electionStep, index) => (
						<div class="flex items-center">
							<div class="join leading-none">
								<button
									class="btn btn-square btn-xs join-item"
									onClick={() => {
										const newSteps = matchCreateDto.electionSteps.filter(
											(step, stepIndex) => stepIndex !== index()
										);
										setMatchCreateDto('electionSteps', newSteps);
									}}
								>
									<SvgDelete />
								</button>
								<button
									class="btn btn-square btn-xs join-item"
									disabled={index() === 0}
									onClick={() => {
										const newSteps = [...matchCreateDto.electionSteps];
										newSteps.splice(index(), 1);
										newSteps.splice(index() - 1, 0, electionStep);
										setMatchCreateDto('electionSteps', newSteps);
									}}
								>
									<SvgKeyboardArrowUp />
								</button>
								<button
									class="btn btn-square btn-xs join-item"
									disabled={index() === matchCreateDto.electionSteps.length - 1}
									onclick={() => {
										const newSteps = [...matchCreateDto.electionSteps];
										newSteps.splice(index(), 1);
										newSteps.splice(index() + 1, 0, electionStep);
										setMatchCreateDto('electionSteps', newSteps);
									}}
								>
									<SvgKeyboardArrowDown />
								</button>
								<div class="tooltip" data-tip={t('Add new Step')}>
									<button
										class="btn btn-square btn-xs join-item"
										onClick={() => {
											addElectionStepIndex = index() + 1;
											electionStepModalRef?.showModal();
										}}
									>
										<SvgAdd />
									</button>
								</div>
							</div>
							<div class="pl-2 font-light">{getElectionStepString(electionStep)}</div>
						</div>
					)}
				</For>
			</div>
			<Show when={matchCreateDto.electionSteps.length === 0}>
				<button
					class="btn btn-square btn-xs join-item"
					onClick={() => {
						addElectionStepIndex = 1;
						electionStepModalRef?.showModal();
					}}
				>
					<SvgAdd />
				</button>
			</Show>
			<Modal ref={electionStepModalRef} class="bg-base-300">
				<AddElectionStep
					index={addElectionStepIndex}
					add={(step) => {
						const newSteps = [...matchCreateDto.electionSteps];
						newSteps.splice(addElectionStepIndex, 0, step);
						setMatchCreateDto('electionSteps', newSteps);
						electionStepModalRef?.close();
					}}
				/>
			</Modal>

			<div class="prose pt-4">
				<h2>{t('Rcon Commands')}</h2>
			</div>
			<TextArea
				label={t('Init')}
				labelTopRight={t('Executed only once: when the match is created')}
				rows="4"
				value={DEFAULT_RCON_INIT.join('\n')}
				onInput={(e) =>
					setMatchCreateDto('rconCommands', 'init', e.currentTarget.value.split('\n'))
				}
				class="font-mono"
			/>
			<TextArea
				label={t('Knife')}
				labelTopRight={t('Executed at the start of a knife round')}
				rows="4"
				value={DEFAULT_RCON_KNIFE.join('\n')}
				onInput={(e) =>
					setMatchCreateDto('rconCommands', 'knife', e.currentTarget.value.split('\n'))
				}
				class="font-mono"
			/>
			<TextArea
				label={t('Match')}
				labelTopRight={t('Executed at the start of each match map')}
				rows="4"
				value={DEFAULT_RCON_MATCH.join('\n')}
				onInput={(e) =>
					setMatchCreateDto('rconCommands', 'match', e.currentTarget.value.split('\n'))
				}
				class="font-mono"
			/>
			<TextArea
				label={t('End')}
				labelTopRight={t('Executed only once: after the end of the last map')}
				rows="4"
				value={DEFAULT_RCON_END.join('\n')}
				onInput={(e) =>
					setMatchCreateDto('rconCommands', 'end', e.currentTarget.value.split('\n'))
				}
				class="font-mono"
			/>

			<div class="prose pt-4">
				<h2>{t('Advanced Settings')}</h2>
			</div>
			<SelectInput
				label={t('Mode')}
				onInput={(e) => setMatchCreateDto('mode', e.currentTarget.value as TMatchMode)}
			>
				<option value="SINGLE">{t('Single match (stops when match is finished)')}</option>
				<option value="LOOP">
					{t('Loop mode (starts again after match is finished)')}
				</option>
			</SelectInput>
			<SelectInput
				label={t('Match End Action')}
				onInput={(e) =>
					setMatchCreateDto('matchEndAction', e.currentTarget.value as TMatchEndAction)
				}
			>
				<option value="NONE">{t('None')}</option>
				<option value="KICK_ALL">{t('Kick all players after match end')}</option>
				<option value="QUIT_SERVER">{t('Quit server via Rcon after match end')}</option>
			</SelectInput>

			<TextArea
				label={t('Match Init Payload Data (JSON)')}
				rows="25"
				value={json()}
				onInput={(e) => setJson(e.currentTarget.value)}
				class="font-mono"
			/>

			<Show when={errorMessage()}>
				<div class="h-4"></div>
				<div class="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{errorMessage()}</span>
				</div>
			</Show>

			<div class="pt-4 text-center">
				<button class="btn btn-primary" onClick={() => createMatch()}>
					{t('Create Match')}
				</button>
			</div>
		</Card>
	);
};
