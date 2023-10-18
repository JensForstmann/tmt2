import { Component, For, createSignal } from 'solid-js';
import {
	IElectionStep,
	IElectionStepAdd,
	IFixedSide,
	MapModes,
	SideFixeds,
	SideModes,
	TMapMode,
	TSideFixed,
	TSideMode,
	TWho,
	Whos,
	isElectionStepAdd,
	isElectionStepSkip,
} from '../../../common';
import { t } from '../utils/locale';
import { SelectInput, TextArea, TextInput } from './Inputs';

export const AddElectionStep: Component<{
	index: number;
	add: (step: IElectionStep) => void;
}> = (props) => {
	const [selectedMapMode, setSelectedMapMode] = createSignal<TMapMode>('AGREE');
	const [selectedMapWho, setSelectedMapWho] = createSignal<TWho>('TEAM_A');
	const [fixedMap, setFixedMap] = createSignal('de_anubis');

	const [selectedSideMode, setSelectedSideMode] = createSignal<TSideMode>('FIXED');
	const [selectedSideWho, setSelectedSideWho] = createSignal<TWho>('TEAM_A');
	const [selectedSideFixed, setSelectedSideFixed] = createSignal<TSideFixed>('TEAM_A_CT');

	const getElectionStepSide = (): IElectionStepAdd['side'] => {
		const sideMode = selectedSideMode();
		switch (sideMode) {
			case 'FIXED':
				return {
					mode: sideMode,
					fixed: selectedSideFixed(),
				};
			case 'KNIFE':
				return {
					mode: sideMode,
				};
			case 'PICK':
				return {
					mode: sideMode,
					who: selectedSideWho(),
				};
			case 'RANDOM':
				return {
					mode: sideMode,
				};
		}
	};

	const getElectionStep = (): IElectionStep => {
		const mapMode = selectedMapMode();
		switch (mapMode) {
			case 'AGREE':
				return {
					map: {
						mode: mapMode,
					},
					side: getElectionStepSide(),
				};
			case 'BAN':
				return {
					map: {
						mode: mapMode,
						who: selectedMapWho(),
					},
				};
			case 'FIXED':
				return {
					map: {
						mode: mapMode,
						fixed: fixedMap(),
					},
					side: getElectionStepSide(),
				};
			case 'PICK':
				return {
					map: {
						mode: mapMode,
						who: selectedMapWho(),
					},
					side: getElectionStepSide(),
				};
			case 'RANDOM_PICK':
				return {
					map: {
						mode: mapMode,
					},
					side: getElectionStepSide(),
				};
			case 'RANDOM_BAN':
				return {
					map: {
						mode: mapMode,
					},
				};
		}
	};

	return (
		<div>
			<div class="flex space-x-4">
				<div class="w-1/3">
					<SelectInput
						label={t('Map Mode')}
						onInput={(e) => setSelectedMapMode(e.currentTarget.value as TMapMode)}
					>
						<For each={(MapModes as unknown as string[]).sort()}>
							{(MapMode) => (
								<option value={MapMode} selected={selectedMapMode() === MapMode}>
									{MapMode}
								</option>
							)}
						</For>
					</SelectInput>
				</div>
				<div class="w-1/3">
					<SelectInput
						label={t('Map Who')}
						onInput={(e) => setSelectedMapWho(e.currentTarget.value as TWho)}
						disabled={
							selectedMapMode() === 'AGREE' ||
							selectedMapMode() === 'FIXED' ||
							selectedMapMode() === 'RANDOM_BAN' ||
							selectedMapMode() === 'RANDOM_PICK'
						}
					>
						<For each={(Whos as unknown as string[]).sort()}>
							{(Who) => (
								<option value={Who} selected={selectedMapWho() === Who}>
									{Who}
								</option>
							)}
						</For>
					</SelectInput>
				</div>
				<div class="w-1/3">
					<TextInput
						label={t('Map Fixed')}
						value={fixedMap()}
						onInput={(e) => setFixedMap(e.currentTarget.value)}
						disabled={selectedMapMode() !== 'FIXED'}
					/>
				</div>
			</div>

			<div class="flex space-x-4">
				<div class="w-1/3">
					<SelectInput
						label={t('Side Mode')}
						onInput={(e) => setSelectedSideMode(e.currentTarget.value as TSideMode)}
						disabled={isElectionStepSkip(getElectionStep())}
					>
						<For each={(SideModes as unknown as string[]).sort()}>
							{(SideMode) => (
								<option value={SideMode} selected={selectedSideMode() === SideMode}>
									{SideMode}
								</option>
							)}
						</For>
					</SelectInput>
				</div>
				<div class="w-1/3">
					<SelectInput
						label={t('Side Who')}
						onInput={(e) => setSelectedSideWho(e.currentTarget.value as TWho)}
						disabled={
							isElectionStepSkip(getElectionStep()) || selectedSideMode() !== 'PICK'
						}
					>
						<For each={(Whos as unknown as string[]).sort()}>
							{(Who) => (
								<option value={Who} selected={selectedSideWho() === Who}>
									{Who}
								</option>
							)}
						</For>
					</SelectInput>
				</div>
				<div class="w-1/3">
					<SelectInput
						label={t('Side Fixed')}
						onInput={(e) => setSelectedSideFixed(e.currentTarget.value as TSideFixed)}
						disabled={
							isElectionStepSkip(getElectionStep()) || selectedSideMode() !== 'FIXED'
						}
					>
						<For each={(SideFixeds as unknown as string[]).sort()}>
							{(SideFixed) => (
								<option
									value={SideFixed}
									selected={selectedSideFixed() === SideFixed}
								>
									{SideFixed}
								</option>
							)}
						</For>
					</SelectInput>
				</div>
			</div>

			<div>{getElectionStepString(getElectionStep())}</div>
			<div class="text-center">
				<button class="btn btn-primary" onClick={() => props.add(getElectionStep())}>
					{t('Add')}
				</button>
			</div>
		</div>
	);
};

const stepToMapString = (step: IElectionStep): string => {
	switch (step.map.mode) {
		case 'BAN':
			return t('Map ban by') + ' ' + whoToString(step.map.who);
		case 'PICK':
			return t('Map pick by') + ' ' + whoToString(step.map.who);
		case 'FIXED':
			return t('Fixed map') + ' ' + step.map.fixed;
		case 'AGREE':
			return t('Map must be agreed on');
		case 'RANDOM_BAN':
			return t('Random map ban');
		case 'RANDOM_PICK':
			return t('Random map pick');
	}
};

const fixedSideToString = (fixed: TSideFixed): string => {
	switch (fixed) {
		case 'TEAM_A_CT':
			return t('Team A starts as CT');
		case 'TEAM_A_T':
			return t('Team A starts as T');
		case 'TEAM_B_CT':
			return t('Team B starts as CT');
		case 'TEAM_B_T':
			return t('Team B starts as T');
		case 'TEAM_X_CT':
			return t('Team X starts as CT');
		case 'TEAM_X_T':
			return t('Team X starts as T');
		case 'TEAM_Y_CT':
			return t('Team Y starts as CT');
		case 'TEAM_Y_T':
			return t('Team Y starts as T');
	}
};

const whoToString = (who: TWho): string => {
	switch (who) {
		case 'TEAM_A':
			return t('Team A');
		case 'TEAM_B':
			return t('Team B');
		case 'TEAM_X':
			return t('Team X');
		case 'TEAM_Y':
			return t('Team Y');
	}
};

const stepToSideString = (step: IElectionStep): string => {
	if (isElectionStepAdd(step)) {
		switch (step.side.mode) {
			case 'FIXED':
				return fixedSideToString(step.side.fixed);
			case 'PICK':
				return t('Side pick by') + ' ' + whoToString(step.side.who);
			case 'KNIFE':
				return t('Knife for side');
			case 'RANDOM':
				return t('Random sides');
		}
	} else {
		return '';
	}
};

export const getElectionStepString = (step: IElectionStep): string => {
	return stepToMapString(step) + (isElectionStepAdd(step) ? ', ' : '') + stepToSideString(step);
};
