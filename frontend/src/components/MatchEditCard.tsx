import { Component, For, JSX, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
	IMatchResponse,
	IMatchUpdateDto,
	MatchEndActions,
	MatchStates,
	TMatchEndAction,
	TMatchSate,
} from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';
import { TextArea } from './TextArea';
import { TextInput } from './TextInput';

export const MatchEditCard: Component<{
	match: IMatchResponse;
	onUpdate: (dt: IMatchUpdateDto) => void;
}> = (props) => {
	const [store, setStore] = createStore<IMatchUpdateDto>(JSON.parse(JSON.stringify(props.match)));

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
			<h2 class="text-lg font-bold">{t('Edit Match')}</h2>
			<form
				class="table"
				onSubmit={(e) => {
					e.preventDefault();
					const dto = getMatchUpdateDto();
					props.onUpdate(dto);
				}}
			>
				<table>
					<thead>
						<tr>
							<th></th>
							<th></th>
							<th>{t('changed?')}</th>
						</tr>
					</thead>
					<tbody>
						<Row label={t('Match State')} changed={store.state !== props.match.state}>
							<select
								value={store.state}
								onInput={(e) =>
									setStore('state', e.currentTarget.value as TMatchSate)
								}
							>
								<For each={MatchStates}>
									{(state) => <option value={state}>{t(state)}</option>}
								</For>
							</select>
						</Row>
						<Row
							label={t('Match End Action')}
							changed={store.matchEndAction !== props.match.matchEndAction}
						>
							<select
								value={store.matchEndAction}
								onInput={(e) =>
									setStore(
										'matchEndAction',
										e.currentTarget.value as TMatchEndAction
									)
								}
							>
								<For each={MatchEndActions}>
									{(state) => <option value={state}>{t(state)}</option>}
								</For>
							</select>
						</Row>
						<Row
							label={t('Webhook URL')}
							changed={store.webhookUrl !== props.match.webhookUrl}
						>
							<TextInput
								value={store.webhookUrl ?? ''}
								onInput={(e) =>
									setStore('webhookUrl', e.currentTarget.value || null)
								}
							/>
						</Row>
						<Row
							label={t('Team A Name')}
							changed={store.teamA?.name !== props.match.teamA.name}
						>
							<TextInput
								value={store.teamA?.name}
								onInput={(e) => setStore('teamA', 'name', e.currentTarget.value)}
							/>
						</Row>
						<Row
							label={t('Team A Advantage')}
							changed={store.teamA?.advantage !== props.match.teamA.advantage}
						>
							<TextInput
								value={store.teamA?.advantage}
								type="number"
								min="0"
								onInput={(e) =>
									setStore('teamA', 'advantage', parseInt(e.currentTarget.value))
								}
							/>
						</Row>
						<Row
							label={t('Team B Name')}
							changed={store.teamB?.name !== props.match.teamB.name}
						>
							<TextInput
								value={store.teamB?.name}
								onInput={(e) => setStore('teamB', 'name', e.currentTarget.value)}
							/>
						</Row>
						<Row
							label={t('Team B Advantage')}
							changed={store.teamB?.advantage !== props.match.teamB.advantage}
						>
							<TextInput
								value={store.teamB?.advantage}
								type="number"
								min="0"
								onInput={(e) =>
									setStore('teamB', 'advantage', parseInt(e.currentTarget.value))
								}
							/>
						</Row>
						<Row
							label={t('Current Map')}
							changed={store.currentMap !== props.match.currentMap}
						>
							<TextInput
								value={store.currentMap}
								type="number"
								min="0"
								onInput={(e) =>
									setStore('currentMap', parseInt(e.currentTarget.value))
								}
							/>
						</Row>
						<Row
							label={t('Map Pool')}
							changed={store.mapPool?.join('\n') !== props.match.mapPool.join('\n')}
						>
							<TextArea
								value={store.mapPool?.join('\n')}
								onInput={(e) =>
									setStore('mapPool', e.currentTarget.value.split('\n'))
								}
							/>
						</Row>
						<Row
							label={t('TMT Log Address')}
							changed={store.tmtLogAddress !== props.match.tmtLogAddress}
						>
							<TextInput
								value={store.tmtLogAddress}
								onInput={(e) => setStore('tmtLogAddress', e.currentTarget.value)}
							/>
						</Row>
						<Row
							label={t('Can Clinch')}
							changed={store.canClinch !== props.match.canClinch}
						>
							<input
								type="checkbox"
								checked={store.canClinch}
								onInput={(e) => setStore('canClinch', e.currentTarget.checked)}
							/>
						</Row>
					</tbody>
				</table>
				<input
					type="reset"
					onClick={(e) => {
						e.preventDefault();
						setStore(props.match);
					}}
					value={t('Undo')}
				/>
				<br />
				<input type="submit" value={t('Save')} />
			</form>
		</Card>
	);
};

const Row: Component<{
	label: string;
	children: JSX.Element;
	changed: boolean;
}> = (props) => {
	return (
		<tr>
			<td>{props.label}</td>
			<td>{props.children}</td>
			<td>
				<Show when={props.changed}>{t('Changed')}</Show>
			</td>
		</tr>
	);
};
