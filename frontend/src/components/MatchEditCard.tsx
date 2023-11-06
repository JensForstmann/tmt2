import { Component, For, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
	IMatchResponse,
	IMatchUpdateDto,
	MatchEndActions,
	MatchStates,
	TMatchEndAction,
	TMatchState,
} from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';
import { SelectInput, TextArea, TextInput, ToggleInput } from './Inputs';

export const MatchEditCard: Component<{
	match: IMatchResponse;
	onUpdate: (dt: IMatchUpdateDto) => void;
}> = (props) => {
	const [store, setStore] = createStore<IMatchUpdateDto>(JSON.parse(JSON.stringify(props.match)));
	const [electionSteps, setElectionSteps] = createSignal(
		JSON.stringify(props.match.electionSteps, null, 4)
	);

	const getChangedValueFromStore = <K extends keyof IMatchUpdateDto>(
		key: K
	): IMatchUpdateDto[K] | undefined => {
		if (key === 'teamA' || key === 'teamB') {
			const pre = (props.match as any)[key] as IMatchUpdateDto['teamA'];
			const post = store[key] as IMatchUpdateDto['teamA'];
			if (
				pre?.advantage !== post?.advantage ||
				pre?.name !== post?.name ||
				pre?.passthrough !== post?.passthrough
			) {
				return { ...post } as IMatchUpdateDto[K];
			}
			return undefined;
		}
		if (key === 'mapPool') {
			const pre = (props.match as any)[key] as IMatchUpdateDto['mapPool'];
			const post = (store[key] as IMatchUpdateDto['mapPool'])
				?.map((x) => x.trim())
				.filter((x) => x !== '');
			if (post && pre?.join('\n').trim() !== post?.join('\n').trim()) {
				return [...post] as IMatchUpdateDto[K];
			}
			return undefined;
		}
		if (key === 'electionSteps') {
			const pre = JSON.stringify(props.match.electionSteps);
			const post = JSON.stringify(JSON.parse(electionSteps()));
			if (pre !== post) {
				return JSON.parse(electionSteps());
			}
			return undefined;
		}
		return store[key] === (props.match as any)[key] ? undefined : store[key];
	};

	const getMatchUpdateDto = () => {
		const dto: IMatchUpdateDto = {
			state: getChangedValueFromStore('state'),
			matchEndAction: getChangedValueFromStore('matchEndAction'),
			webhookUrl: getChangedValueFromStore('webhookUrl'),
			teamA: getChangedValueFromStore('teamA'),
			teamB: getChangedValueFromStore('teamB'),
			currentMap: getChangedValueFromStore('currentMap'),
			mapPool: getChangedValueFromStore('mapPool'),
			tmtLogAddress: getChangedValueFromStore('tmtLogAddress'),
			canClinch: getChangedValueFromStore('canClinch'),
			electionSteps: getChangedValueFromStore('electionSteps'),
		};
		Object.keys(dto).forEach((key) => {
			if ((dto as any)[key] === undefined) {
				delete (dto as any)[key];
			}
		});
		return dto;
	};

	return (
		<Card>
			<h2 class="text-center text-lg font-bold">{t('Edit Match')}</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const dto = getMatchUpdateDto();
					props.onUpdate(dto);
				}}
			>
				<SelectInput
					label={t('Match State')}
					labelTopRight={store.state !== props.match.state ? t('Changed') : ''}
					onInput={(e) => setStore('state', e.currentTarget.value as TMatchState)}
				>
					<For each={MatchStates}>
						{(state) => (
							<option value={state} selected={store.state === state}>
								{t(state)}
							</option>
						)}
					</For>
				</SelectInput>
				<SelectInput
					label={t('Match End Action')}
					labelTopRight={
						store.matchEndAction !== props.match.matchEndAction ? t('Changed') : ''
					}
					onInput={(e) =>
						setStore('matchEndAction', e.currentTarget.value as TMatchEndAction)
					}
				>
					<For each={MatchEndActions}>
						{(state) => (
							<option value={state} selected={store.matchEndAction === state}>
								{t(state)}
							</option>
						)}
					</For>
				</SelectInput>
				<TextInput
					label={t('Match Passthrough')}
					labelTopRight={
						store.passthrough !== props.match.passthrough ? t('Changed') : ''
					}
					value={store.passthrough ?? ''}
					onInput={(e) =>
						setStore(
							'passthrough',
							e.currentTarget.value ||
								(props.match.passthrough === undefined
									? undefined
									: e.currentTarget.value)
						)
					}
				/>
				<TextInput
					label={t('Webhook URL')}
					labelTopRight={store.webhookUrl !== props.match.webhookUrl ? t('Changed') : ''}
					value={store.webhookUrl ?? ''}
					onInput={(e) => setStore('webhookUrl', e.currentTarget.value || null)}
				/>
				<TextInput
					label={t('Team A Name')}
					labelTopRight={store.teamA?.name !== props.match.teamA.name ? t('Changed') : ''}
					value={store.teamA?.name}
					onInput={(e) => setStore('teamA', 'name', e.currentTarget.value)}
				/>
				<TextInput
					label={t('Team A Passthrough')}
					labelTopRight={
						store.teamA?.passthrough !== props.match.teamA.passthrough
							? t('Changed')
							: ''
					}
					value={store.teamA?.passthrough ?? ''}
					onInput={(e) =>
						setStore(
							'teamA',
							'passthrough',
							e.currentTarget.value ||
								(props.match.teamA.passthrough === undefined
									? undefined
									: e.currentTarget.value)
						)
					}
				/>
				<TextInput
					label={t('Team A Advantage')}
					labelTopRight={
						store.teamA?.advantage !== props.match.teamA.advantage ? t('Changed') : ''
					}
					value={store.teamA?.advantage}
					type="number"
					min="0"
					onInput={(e) => setStore('teamA', 'advantage', parseInt(e.currentTarget.value))}
				/>
				<TextInput
					label={t('Team B Name')}
					labelTopRight={store.teamB?.name !== props.match.teamB.name ? t('Changed') : ''}
					value={store.teamB?.name}
					onInput={(e) => setStore('teamB', 'name', e.currentTarget.value)}
				/>
				<TextInput
					label={t('Team B Passthrough')}
					labelTopRight={
						store.teamB?.passthrough !== props.match.teamB.passthrough
							? t('Changed')
							: ''
					}
					value={store.teamB?.passthrough ?? ''}
					onInput={(e) =>
						setStore(
							'teamB',
							'passthrough',
							e.currentTarget.value ||
								(props.match.teamB.passthrough === undefined
									? undefined
									: e.currentTarget.value)
						)
					}
				/>
				<TextInput
					label={t('Team B Advantage')}
					labelTopRight={
						store.teamB?.advantage !== props.match.teamB.advantage ? t('Changed') : ''
					}
					value={store.teamB?.advantage}
					type="number"
					min="0"
					onInput={(e) => setStore('teamB', 'advantage', parseInt(e.currentTarget.value))}
				/>
				<TextInput
					label={t('Current Map')}
					labelTopRight={store.currentMap !== props.match.currentMap ? t('Changed') : ''}
					value={store.currentMap}
					type="number"
					min="0"
					onInput={(e) => setStore('currentMap', parseInt(e.currentTarget.value))}
				/>
				<TextArea
					label={t('Map Pool')}
					labelTopRight={
						store.mapPool?.join('\n') !== props.match.mapPool.join('\n')
							? t('Changed')
							: ''
					}
					value={store.mapPool?.join('\n')}
					onInput={(e) => setStore('mapPool', e.currentTarget.value.split('\n'))}
					rows={8}
				/>
				<TextInput
					label={t('TMT Log Address')}
					labelTopRight={
						store.tmtLogAddress !== props.match.tmtLogAddress ? t('Changed') : ''
					}
					value={store.tmtLogAddress}
					onInput={(e) => setStore('tmtLogAddress', e.currentTarget.value)}
				/>
				<ToggleInput
					label={t('Can Clinch')}
					labelTopRight={store.canClinch !== props.match.canClinch ? t('Changed') : ''}
					type="checkbox"
					checked={store.canClinch}
					onInput={(e) => setStore('canClinch', e.currentTarget.checked)}
				/>
				<TextArea
					label={t('Election Steps')}
					labelTopRight={
						(() => {
							try {
								return (
									JSON.stringify(props.match.electionSteps) !==
									JSON.stringify(JSON.parse(electionSteps()))
								);
							} catch (err) {
								return true;
							}
						})()
							? t('Changed')
							: ''
					}
					value={electionSteps()}
					onInput={(e) => setElectionSteps(e.currentTarget.value)}
					rows={20}
				/>
				<div class="space-x-4 pt-4 text-center">
					<input class="btn btn-primary" type="submit" value={t('Save')} />
				</div>
			</form>
		</Card>
	);
};
