import { useSearchParams } from '@solidjs/router';
import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { connectionState, fetchMatches, globalStore } from '../App';
import { SvgSettings } from '../assets/Icons';
import { Card } from '../components/Card';
import { ErrorComponent } from '../components/ErrorComponent';
import { SelectInput } from '../components/Inputs';
import {
	MatchList,
	MatchTableColumnLabels,
	MatchTableColumns,
	TColumnsToShow,
} from '../components/MatchList';
import { t } from '../utils/locale';

const defaultColumns: TColumnsToShow = {
	TEAM_A: true,
	TEAM_B: true,
	ONLINE_PLAYER_COUNT: false,
	AGE: true,
	BEST_OF: true,
	MATCH_STATE: true,
	CURRENT_MAP: true,
	MAP_STATE: true,
	MAP_SCORE: true,
	DETAILS: true,
	GAME_SERVER: true,
};

type FilterOption = {
	title: string;
	filter: string;
	label: string;
};
export const MatchesNeedingAttention: FilterOption = {
	title: t('Matches needing Attention'),
	filter: 'isLive=true&needsAttention=true',
	label: t('Show matches which needs attention'),
};
const filterOptions: FilterOption[] = [
	{
		title: t('Live Matches'),
		filter: 'isLive=true',
		label: t('Only show matches that are currently being supervised'),
	},
	{
		title: t('Not Live'),
		filter: 'isLive=false',
		label: t('Only show offline matches (not supervised)'),
	},
	{
		title: t('Dangling Matches'),
		filter: 'isLive=false&isStopped=false&states=ELECTION,MATCH_MAP',
		label: t('Only show offline matches which have not been properly stopped'),
	},
	MatchesNeedingAttention,
];
const DEFAULT_FILTER = filterOptions[0];

export const MatchesPage: Component = () => {
	const [searchParams, setSearchParams] = useSearchParams<{
		filter?: string;
		columns?: string;
	}>();
	const [filterLabel, setFilterLabel] = createSignal('');
	const [errorMessage, setErrorMessage] = createSignal('');

	const getCurrentFilterOption = () =>
		!searchParams.filter
			? DEFAULT_FILTER
			: filterOptions.find((fo) => fo.filter === searchParams.filter);

	createEffect(() => {
		const filterOption = getCurrentFilterOption();
		if (filterOption) {
			setFilterLabel(filterOption.label);
		} else {
			setFilterLabel(t('A custom filter from the URL is used'));
		}
	});

	const matchesToShow = () => {
		const filter = new URLSearchParams(searchParams.filter ?? DEFAULT_FILTER.filter);
		const wantedStates = filter.get('states')?.split(',') ?? [];
		const convertToBoolean = (value: string | null) => {
			return value === 'true' ? true : value === 'false' ? false : undefined;
		};
		const isLive = convertToBoolean(filter.get('isLive'));
		const isStopped = convertToBoolean(filter.get('isStopped'));
		const needsAttention = convertToBoolean(filter.get('needsAttention'));
		return globalStore.matches?.filter((m) => {
			return (
				(wantedStates.length === 0 || wantedStates.includes(m.data.state)) &&
				(isLive === undefined || m.data.isLive === isLive) &&
				(isStopped === undefined || m.data.isStopped === isStopped) &&
				(needsAttention === undefined ||
					(needsAttention === true
						? m.data.needsAttentionSince !== null
						: m.data.needsAttentionSince === null))
			);
		});
	};

	const columnsToShow = (): TColumnsToShow => {
		const fromStorage = localStorage.getItem('columns');
		if (!searchParams.columns && !fromStorage) {
			return { ...defaultColumns };
		}
		const src = searchParams.columns || fromStorage;
		const parts = src?.toUpperCase().split(',');
		const result: TColumnsToShow = {};
		MatchTableColumns.forEach((mtc) => {
			result[mtc] = parts?.includes(mtc);
		});
		return result;
	};

	const updateColumnsSearchParam = (columnsToShow: TColumnsToShow) => {
		const columns: string[] = [];
		MatchTableColumns.forEach((mtc) => {
			if (columnsToShow[mtc]) {
				columns.push(mtc);
			}
		});
		const str = columns.join(',').toLowerCase();
		localStorage.setItem('columns', str);
		setSearchParams({ columns: str }, { replace: true });
	};

	createEffect(() => {
		const matches = globalStore.matches;
		const state = connectionState();
		if (!matches && state === 'AUTHED') {
			fetchMatches(undefined).catch((err) => setErrorMessage(err + ''));
		}
	});

	return (
		<Card>
			<div class="flex w-full flex-row space-x-8 place-items-end">
				<SelectInput
					onInput={(e) =>
						setSearchParams({ filter: e.currentTarget.value }, { replace: true })
					}
					labelBottomLeft={filterLabel()}
				>
					<Show when={getCurrentFilterOption() === undefined}>
						<option selected={getCurrentFilterOption() === undefined}>
							{t('Custom Filter')}
						</option>
					</Show>
					<For each={filterOptions}>
						{(filterOption, i) => (
							<option
								value={filterOption.filter}
								selected={searchParams.filter === filterOption.filter}
							>
								{filterOption.title}
							</option>
						)}
					</For>
				</SelectInput>

				<div class="flex-grow"></div>

				<div class="dropdown dropdown-end">
					<label tabindex="0" class="btn btn-ghost m-1">
						<SvgSettings />
						{t('Column Settings')}
					</label>
					<div
						tabindex="0"
						class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
					>
						<For each={MatchTableColumns}>
							{(column) => (
								<div>
									<label class="label justify-normal cursor-pointer space-x-2">
										<input
											type="checkbox"
											checked={columnsToShow()[column]}
											onInput={(e) => {
												const cts = columnsToShow();
												cts[column] = e.currentTarget.checked;
												updateColumnsSearchParam(cts);
											}}
											class="checkbox"
										/>
										<span class="label-text">
											{MatchTableColumnLabels[column]}
										</span>
									</label>
								</div>
							)}
						</For>
					</div>
				</div>
			</div>
			<ErrorComponent errorMessage={errorMessage()} />
			<Show when={matchesToShow()}>
				{(matches) => (
					<MatchList
						matches={matches().map((m) => m.data)}
						columnsToShow={columnsToShow()}
					/>
				)}
			</Show>
		</Card>
	);
};
