import autoAnimate from '@formkit/auto-animate';
import { Component, For, Match, Show, Switch, createEffect, createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
	IConfig,
	IElectionStep,
	IMatchCreateDto,
	IMatchResponse,
	IMatchUpdateDto,
	IPreset,
	IPresetCreateDto,
	TMatchEndAction,
	TMatchMode,
	TTeamAB,
	getOtherTeamAB,
} from '../../../common';
import {
	SvgAdd,
	SvgDelete,
	SvgKeyboardArrowDown,
	SvgKeyboardArrowUp,
	SvgSave,
	SvgVisiblity,
	SvgVisiblityOff,
} from '../assets/Icons';
import { copyObject } from '../utils/copyObject';
import { createFetcher, isLoggedIn } from '../utils/fetcher';
import { t } from '../utils/locale';
import { AddElectionStep, getElectionStepString } from './ElectionStep';
import { SelectInput, TextArea, TextInput, ToggleInput } from './Inputs';
import { Modal } from './Modal';

const Presets: Component<{
	onSelect: (preset: IPreset) => void;
	matchCreateDto: IMatchCreateDto;
}> = (props) => {
	const fetcher = createFetcher();
	const [presets, setPresets] = createSignal<IPreset[]>([]);
	const [presetName, setPresetName] = createSignal('');
	const [selectedPresetId, setSelectedPresetId] = createSignal('');

	createEffect(() => {
		if (isLoggedIn()) {
			refreshPresets();
		}
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
			data: props.matchCreateDto,
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
			data: props.matchCreateDto,
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

	const setMatchDataFromPreset = (presetId: string) => {
		const preset = getPresetById(presetId);
		if (preset) {
			props.onSelect(copyObject(preset.data));
		}
	};

	const getPresetById = (presetId: string) => {
		return presets().find((preset) => preset.id === presetId);
	};
	return (
		<>
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
		</>
	);
};

export const getSimpleElectionSteps = (mode: 'BO1' | 'BO3', mapPool: string[]): IElectionStep[] => {
	const electionSteps: IElectionStep[] = [];
	const mapPoolCount = mapPool.length;
	let currentTeam: TTeamAB = 'TEAM_A';
	let mapCount = 0;

	if (mode === 'BO1') {
		mapCount = 1;
	} else if (mode === 'BO3') {
		mapCount = 3;
	}

	const banCount = mapPoolCount - mapCount;

	if (banCount < 0) {
		throw t('The map pool has too few maps.');
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

const minifyMapPool = (maps: string[]) => {
	return maps.map((map) => map.trim()).filter((l) => l.length > 0);
};

export const CreateUpdateMatch: Component<
	(
		| {
				mode: 'CREATE';
				match: IMatchCreateDto;
		  }
		| {
				mode: 'UPDATE';
				match: IMatchResponse;
		  }
	) & {
		callback: (data: IMatchUpdateDto & IMatchCreateDto) => Promise<void>;
		getFinalDto?: (data: IMatchUpdateDto & IMatchCreateDto) => string;
	}
> = (props) => {
	const fetcher = createFetcher();
	let addElectionStepIndex = 0;
	let electionStepModalRef: HTMLDialogElement | undefined;
	let electionStepsRef: HTMLDivElement | undefined;
	const [errorMessage, setErrorMessage] = createSignal('');
	const [electionErrorMessage, setElectionErrorMessage] = createSignal('');
	const [dto, setDto] = createStore<IMatchUpdateDto & IMatchCreateDto>(copyObject(props.match));
	const [showAdvanced, setShowAdvanced] = createSignal(false);
	const [json, setJson] = createSignal('');

	createEffect(() => {
		try {
			const tempDto = copyObject(dto);
			tempDto.mapPool = minifyMapPool(tempDto.mapPool);
			setJson(props.getFinalDto?.(tempDto) ?? JSON.stringify(tempDto, undefined, 4));
		} catch (err) {
			setJson('ERROR!\n' + err);
		}
	});

	const setTmtLogAddress = () => {
		fetcher<IConfig>('GET', `/api/config`)
			.then((resp) => {
				const tmtLogAddress =
					resp?.tmtLogAddress ?? window.location.protocol + '//' + window.location.host;
				setDto('tmtLogAddress', tmtLogAddress);
			})
			.catch((err) => console.error('Cannot get config' + err));
	};

	onMount(() => {
		if (electionStepsRef) {
			autoAnimate(electionStepsRef);
		}
		if (props.mode === 'CREATE') {
			setTmtLogAddress();
		}
	});

	const getChangedClasses = <T,>(pre: T, post: T, className: string) => {
		return props.mode === 'UPDATE' && pre !== post ? className : '';
	};

	return (
		<>
			<Show when={props.mode === 'CREATE'}>
				<Presets
					matchCreateDto={dto}
					onSelect={(preset) => {
						setDto(copyObject(preset));
						if (!dto.tmtLogAddress) {
							setTmtLogAddress();
						}
					}}
				/>
			</Show>
			<div class="prose pt-4">
				<h2>{t('Teams')}</h2>
			</div>
			<TextInput
				label={t('Team A Name')}
				value={dto.teamA.name}
				class={getChangedClasses(
					props.match.teamA.name,
					dto.teamA.name,
					'input-accent border-2'
				)}
				onInput={(e) => setDto('teamA', 'name', e.currentTarget.value)}
			/>
			<TextInput
				label={t('Team B Name')}
				value={dto.teamB.name}
				class={getChangedClasses(
					props.match.teamB.name,
					dto.teamB.name,
					'input-accent border-2'
				)}
				onInput={(e) => setDto('teamB', 'name', e.currentTarget.value)}
			/>
			<div class="prose pt-4">
				<h2>{t('Game Server')}</h2>
			</div>
			<Show when={props.mode === 'CREATE'}>
				<ToggleInput
					label={t('Use Own Game Server')}
					checked={dto.gameServer !== null}
					onInput={(e) =>
						e.currentTarget.checked
							? setDto('gameServer', {
									ip: '',
									port: 27015,
									rconPassword: '',
								})
							: setDto('gameServer', null)
					}
				/>
			</Show>
			<TextInput
				label={t('Game Server IP Address')}
				value={dto.gameServer?.ip ?? ''}
				disabled={dto.gameServer === null}
				class={getChangedClasses(
					props.match.gameServer?.ip,
					dto.gameServer?.ip,
					'input-accent border-2'
				)}
				onInput={(e) => setDto('gameServer', 'ip', e.currentTarget.value)}
			/>
			<TextInput
				label={t('Game Server Port')}
				type="number"
				value={dto.gameServer?.port ?? 27015}
				disabled={dto.gameServer === null}
				class={getChangedClasses(
					props.match.gameServer?.port,
					dto.gameServer?.port,
					'input-accent border-2'
				)}
				onInput={(e) => setDto('gameServer', 'port', parseInt(e.currentTarget.value))}
			/>
			<TextInput
				label={t('Game Server Rcon Password')}
				value={dto.gameServer?.rconPassword ?? ''}
				disabled={dto.gameServer === null}
				class={getChangedClasses(
					props.match.gameServer?.rconPassword,
					dto.gameServer?.rconPassword,
					'input-accent border-2'
				)}
				onInput={(e) => setDto('gameServer', 'rconPassword', e.currentTarget.value)}
			/>
			<div class="prose pt-4 pb-2">
				<h2>{t('Map Pool')}</h2>
			</div>
			<TextArea
				value={dto.mapPool.join('\n')}
				class={
					'border-2 ' +
					getChangedClasses(
						props.match.mapPool.join('\n'),
						dto.mapPool.join('\n'),
						'input-accent'
					)
				}
				onInput={(e) => setDto('mapPool', e.currentTarget.value.split('\n'))}
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
						onClick={() => {
							setDto('mapPool', minifyMapPool(dto.mapPool));
							try {
								setDto('electionSteps', getSimpleElectionSteps('BO1', dto.mapPool));
								setElectionErrorMessage('');
							} catch (err) {
								setElectionErrorMessage(err + '');
							}
						}}
					>
						{t('Best of 1')}
					</button>
					<button
						class="btn btn-sm join-item"
						onClick={() => {
							setDto('mapPool', minifyMapPool(dto.mapPool));
							try {
								setDto('electionSteps', getSimpleElectionSteps('BO3', dto.mapPool));
								setElectionErrorMessage('');
							} catch (err) {
								setElectionErrorMessage(err + '');
							}
						}}
					>
						{t('Best of 3')}
					</button>
					<button
						class="btn btn-sm join-item"
						onClick={() => {
							setDto('electionSteps', []);
							setElectionErrorMessage('');
						}}
					>
						{t('Empty')}
					</button>
				</div>
			</div>
			<Show when={electionErrorMessage()}>
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
					<span>{electionErrorMessage()}</span>
				</div>
			</Show>
			<div
				class={
					'space-y-1 pt-4 ' +
					getChangedClasses(
						JSON.stringify(props.match.electionSteps),
						JSON.stringify(dto.electionSteps),
						'border-2 border-accent'
					)
				}
				ref={electionStepsRef}
			>
				<For each={dto.electionSteps}>
					{(electionStep, index) => (
						<div class="flex items-center">
							<div class="join leading-none">
								<button
									class="btn btn-square btn-xs join-item"
									onClick={() => {
										const newSteps = dto.electionSteps.filter(
											(step, stepIndex) => stepIndex !== index()
										);
										setDto('electionSteps', newSteps);
									}}
								>
									<SvgDelete />
								</button>
								<button
									class="btn btn-square btn-xs join-item"
									disabled={index() === 0}
									onClick={() => {
										const newSteps = [...dto.electionSteps];
										newSteps.splice(index(), 1);
										newSteps.splice(index() - 1, 0, electionStep);
										setDto('electionSteps', newSteps);
									}}
								>
									<SvgKeyboardArrowUp />
								</button>
								<button
									class="btn btn-square btn-xs join-item"
									disabled={index() === dto.electionSteps.length - 1}
									onclick={() => {
										const newSteps = [...dto.electionSteps];
										newSteps.splice(index(), 1);
										newSteps.splice(index() + 1, 0, electionStep);
										setDto('electionSteps', newSteps);
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
			<Show when={dto.electionSteps.length === 0}>
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
						const newSteps = [...dto.electionSteps];
						newSteps.splice(addElectionStepIndex, 0, step);
						setDto('electionSteps', newSteps);
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
				value={dto.rconCommands?.init?.join('\n') ?? ''}
				class={
					'font-mono border-2 ' +
					getChangedClasses(
						props.match.rconCommands?.init?.join('\n'),
						dto.rconCommands?.init?.join('\n'),
						'input-accent'
					)
				}
				onInput={(e) => setDto('rconCommands', 'init', e.currentTarget.value.split('\n'))}
			/>
			<TextArea
				label={t('Knife')}
				labelTopRight={t('Executed at the start of a knife round')}
				rows="4"
				value={dto.rconCommands?.knife?.join('\n') ?? ''}
				class={
					'font-mono border-2 ' +
					getChangedClasses(
						props.match.rconCommands?.knife?.join('\n'),
						dto.rconCommands?.knife?.join('\n'),
						'input-accent'
					)
				}
				onInput={(e) => setDto('rconCommands', 'knife', e.currentTarget.value.split('\n'))}
			/>
			<TextArea
				label={t('Match')}
				labelTopRight={t('Executed at the start of each match map')}
				rows="4"
				value={dto.rconCommands?.match?.join('\n') ?? ''}
				class={
					'font-mono border-2 ' +
					getChangedClasses(
						props.match.rconCommands?.match?.join('\n'),
						dto.rconCommands?.match?.join('\n'),
						'input-accent'
					)
				}
				onInput={(e) => setDto('rconCommands', 'match', e.currentTarget.value.split('\n'))}
			/>
			<TextArea
				label={t('End')}
				labelTopRight={t('Executed only once: after the end of the last map')}
				rows="4"
				value={dto.rconCommands?.end?.join('\n') ?? ''}
				class={
					'font-mono border-2 ' +
					getChangedClasses(
						props.match.rconCommands?.end?.join('\n'),
						dto.rconCommands?.end?.join('\n'),
						'input-accent'
					)
				}
				onInput={(e) => setDto('rconCommands', 'end', e.currentTarget.value.split('\n'))}
			/>

			<div class="prose pt-4 grid grid-cols-[auto_auto_1fr] place-items-center">
				<h2 class="m-0">{t('Advanced Settings')}</h2>
				<Switch>
					<Match when={showAdvanced()}>
						<button
							class="ml-1 btn btn-sm btn-ghost"
							onclick={() => setShowAdvanced(false)}
						>
							<SvgVisiblityOff />
							{t('Hide')}
						</button>
					</Match>
					<Match when={!showAdvanced()}>
						<button
							class="ml-1 btn btn-sm btn-ghost"
							onclick={() => setShowAdvanced(true)}
						>
							<SvgVisiblity />
							{t('Show')}
						</button>
					</Match>
				</Switch>
			</div>
			<div
				class={
					'collapse collapse-arrow border ' +
					(showAdvanced() ? 'collapse-open' : 'collapse-close')
				}
			>
				<div class="collapse-content px-0">
					<SelectInput
						label={t('Mode')}
						class={getChangedClasses(
							props.match.mode,
							dto.mode,
							'input-accent border-2'
						)}
						onInput={(e) => setDto('mode', e.currentTarget.value as TMatchMode)}
					>
						<option value="SINGLE" selected={dto.mode === 'SINGLE'}>
							{t('Single match (stops when match is finished)')}
						</option>
						<option value="LOOP" selected={dto.mode === 'LOOP'}>
							{t('Loop mode (starts again after match is finished)')}
						</option>
					</SelectInput>
					<SelectInput
						label={t('Match End Action')}
						class={getChangedClasses(
							props.match.matchEndAction,
							dto.matchEndAction,
							'input-accent border-2'
						)}
						onInput={(e) =>
							setDto('matchEndAction', e.currentTarget.value as TMatchEndAction)
						}
					>
						<option value="NONE" selected={dto.matchEndAction === 'NONE'}>
							{t('None')}
						</option>
						<option value="KICK_ALL" selected={dto.matchEndAction === 'KICK_ALL'}>
							{t('Kick all players after match end')}
						</option>
						<option value="QUIT_SERVER" selected={dto.matchEndAction === 'QUIT_SERVER'}>
							{t('Quit server via Rcon after match end')}
						</option>
					</SelectInput>
					<TextInput
						label={t('TMT Log Address')}
						labelTopRight={t(
							'HTTP log receiver from the perspective of the game server'
						)}
						value={dto.tmtLogAddress ?? ''}
						class={getChangedClasses(
							props.match.tmtLogAddress,
							dto.tmtLogAddress,
							'input-accent border-2'
						)}
						onInput={(e) => setDto('tmtLogAddress', e.currentTarget.value)}
					/>
					<TextInput
						label={t('Webhook URL')}
						labelTopRight={t("HTTP address to receive TMT's webhooks")}
						value={dto.webhookUrl ?? ''}
						class={getChangedClasses(
							props.match.webhookUrl,
							dto.webhookUrl,
							'input-accent border-2'
						)}
						onInput={(e) => setDto('webhookUrl', e.currentTarget.value)}
					/>
					<TextInput
						label={t('Match Passthrough')}
						labelTopRight={t('Custom value to identify the match in 3rd party tools')}
						min={0}
						value={dto.passthrough ?? ''}
						class={getChangedClasses(
							props.match.passthrough,
							dto.passthrough,
							'input-accent border-2'
						)}
						onInput={(e) => setDto('passthrough', e.currentTarget.value)}
					/>
					<TextInput
						label={t('Team A Advantage')}
						type="number"
						min={0}
						value={dto.teamA.advantage ?? 0}
						class={getChangedClasses(
							props.match.teamA.advantage,
							dto.teamA.advantage,
							'input-accent border-2'
						)}
						onInput={(e) =>
							setDto('teamA', 'advantage', parseInt(e.currentTarget.value))
						}
					/>
					<TextInput
						label={t('Team A Passthrough')}
						labelTopRight={t('Custom value to identify this team in 3rd party tools')}
						min={0}
						value={dto.teamA.passthrough ?? ''}
						class={getChangedClasses(
							props.match.teamA.passthrough,
							dto.teamA.passthrough,
							'input-accent border-2'
						)}
						onInput={(e) => setDto('teamA', 'passthrough', e.currentTarget.value)}
					/>
					<TextInput
						label={t('Team B Advantage')}
						type="number"
						min={0}
						value={dto.teamB.advantage ?? 0}
						class={getChangedClasses(
							props.match.teamB.advantage,
							dto.teamB.advantage,
							'input-accent border-2'
						)}
						onInput={(e) =>
							setDto('teamB', 'advantage', parseInt(e.currentTarget.value))
						}
					/>
					<TextInput
						label={t('Team B Passthrough')}
						labelTopRight={t('Custom value to identify this team in 3rd party tools')}
						min={0}
						value={dto.teamB.passthrough ?? ''}
						class={getChangedClasses(
							props.match.teamB.passthrough,
							dto.teamB.passthrough,
							'input-accent border-2'
						)}
						onInput={(e) => setDto('teamB', 'passthrough', e.currentTarget.value)}
					/>
					<ToggleInput
						label={t('Can Clinch')}
						labelTopRight={t('Ends match series after a map if a winner is determined')}
						checked={dto.canClinch}
						class={getChangedClasses(
							props.match.canClinch,
							dto.canClinch,
							'input-accent border-2'
						)}
						onInput={(e) => setDto('canClinch', e.currentTarget.checked)}
					/>
					<Show when={props.mode === 'UPDATE'}>
						<SelectInput
							label={t('Match State')}
							labelTopRight={t(
								'Overrides the match state (does not execute anything)'
							)}
							class={getChangedClasses(
								props.mode === 'UPDATE' && props.match.state,
								dto.state,
								'input-accent border-2'
							)}
							onInput={(e) => setDto('mode', e.currentTarget.value as TMatchMode)}
						>
							<option value="ELECTION" selected={dto.state === 'ELECTION'}>
								{t('Election')}
							</option>
							<option value="MATCH_MAP" selected={dto.state === 'MATCH_MAP'}>
								{t('Match Map')}
							</option>
							<option value="FINISHED" selected={dto.state === 'FINISHED'}>
								{t('Finished')}
							</option>
						</SelectInput>
					</Show>
					<TextArea
						label={t('JSON Payload')}
						labelTopRight={
							props.mode === 'CREATE'
								? t('This will be used to create the match')
								: t('This will be used to update the match')
						}
						rows="25"
						value={json()}
						onInput={(e) => setJson(e.currentTarget.value)}
						class="font-mono"
					/>
				</div>
			</div>

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
				<button
					class="btn btn-primary"
					onClick={() => {
						let dtoFromJson;
						try {
							dtoFromJson = JSON.parse(json());
						} catch (err) {
							setErrorMessage(t('JSON parse error: Invalid JSON'));
							return;
						}
						if (dtoFromJson.mapPool) {
							dtoFromJson.mapPool = minifyMapPool(dtoFromJson.mapPool);
						}
						props.callback(dtoFromJson).catch((err) => setErrorMessage(err + ''));
					}}
				>
					{props.mode === 'CREATE' ? t('Create Match') : t('Update Match')}
				</button>
			</div>
		</>
	);
};
