import { useSearchParams } from '@solidjs/router';
import { Component, createEffect, createSignal, For, onCleanup, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Event, IMatchResponse } from '../../../common';
import { SvgSettings } from '../assets/Icons';
import { Card } from '../components/Card';
import { SelectInput } from '../components/Inputs';
import {
	MatchList,
	MatchTableColumnLabels,
	MatchTableColumns,
	TColumnsToShow,
} from '../components/MatchList';
import { createFetcher, getToken } from '../utils/fetcher';
import { t } from '../utils/locale';
import { createWebSocket } from '../utils/webSocket';

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
	search: string;
	label: string;
	/** indicates, if new matches should be appended to the table */
	includeNewMatches: boolean;
};
const filterOptions: FilterOption[] = [
	{
		title: t('Live Matches'),
		search: '?isLive=true',
		label: t('Only show matches that are currently being supervised'),
		includeNewMatches: true,
	},
	{
		title: t('Not Live'),
		search: '?isLive=false',
		label: t('Only show offline matches (not supervised)'),
		includeNewMatches: false,
	},
	{
		title: t('Dangling Matches'),
		search: '?isLive=false&isStopped=false&state=ELECTION&state=MATCH_MAP',
		label: t('Only show offline matches which have not been properly stopped'),
		includeNewMatches: false,
	},
];

export const MatchesPage: Component = () => {
	const [searchParams, setSearchParams] = useSearchParams<{
		searchString?: string;
		columns?: string;
		includeNewMatches?: string;
	}>();
	const fetcher = createFetcher();
	const [data, setData] = createStore<{
		matches?: IMatchResponse[];
	}>({});
	const [filterLabel, setFilterLabel] = createSignal('');

	const getCurrentFilterOption = () =>
		!searchParams.searchString
			? filterOptions[0]
			: filterOptions.find((fo) => fo.search === searchParams.searchString);

	createEffect(() => {
		fetcher<IMatchResponse[]>(
			'GET',
			`/api/matches${searchParams.searchString || filterOptions[0].search}`
		).then((matches) => {
			setData('matches', matches);
		});
	});

	createEffect(() => {
		const filterOption = getCurrentFilterOption();
		if (filterOption) {
			setFilterLabel(filterOption.label);
		} else {
			setFilterLabel(t('A custom filter from the URL is used'));
		}
	});

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
		const columns: string[] = [' '];
		MatchTableColumns.forEach((mtc) => {
			if (columnsToShow[mtc]) {
				columns.push(mtc);
			}
		});
		const str = columns.join(',').toLowerCase();
		localStorage.setItem('columns', str);
		setSearchParams({ columns: str }, { replace: true });
	};

	const onWsMsg = (msg: Event) => {
		if (msg.type === 'MATCH_UPDATE') {
			const mapIndex = data.matches?.findIndex((match) => match.id === msg.matchId);
			if (mapIndex !== undefined && mapIndex >= 0) {
				(setData as any)('matches', mapIndex, ...msg.path, msg.value);
			}
		} else if (msg.type === 'MATCH_CREATE') {
			if (
				searchParams.includeNewMatches === 'true' ||
				getCurrentFilterOption()?.includeNewMatches
			) {
				setData('matches', (existing) => [...(existing ?? []), msg.match]);
			}
		}
	};

	const { state, subscribe, subscribeSys, unsubscribe, disconnect } = createWebSocket(onWsMsg, {
		autoReconnect: true,
		connect: true,
	});

	createEffect(() => {
		const token = getToken();
		if (state() === 'OPEN' && token) {
			subscribeSys(token);
		}
	});

	createEffect((previousSubs?: string[]): string[] => {
		const subs = previousSubs ?? [];
		if (state() === 'OPEN') {
			// unsubscribe
			subs.forEach((matchId) => {
				if (!data.matches?.find((match) => match.id === matchId)) {
					console.info(`Unsub from ${matchId}`);
					unsubscribe(matchId);
				}
			});
			// subscribe
			data.matches?.forEach((match) => {
				if (!subs.includes(match.id)) {
					console.info(`Sub to ${match.id}`);
					subscribe({
						matchId: match.id,
						token: match.tmtSecret,
					});
				}
			});
			// update subscription list
			return data.matches?.map((match) => match.id) ?? [];
		}
		return [];
	});

	onCleanup(() => disconnect());

	return (
		<Card>
			<div class="flex w-full flex-row space-x-8 place-items-end">
				<SelectInput
					onInput={(e) =>
						setSearchParams({ searchString: e.currentTarget.value }, { replace: true })
					}
					labelBottomLeft={filterLabel()}
				>
					<Show when={getCurrentFilterOption() === undefined}>
						<option selected={getCurrentFilterOption() === undefined}>
							{t('Custom Filter')}
						</option>
					</Show>
					<For each={filterOptions}>
						{(filterOption) => (
							<option
								value={filterOption.search}
								selected={searchParams.searchString === filterOption.search}
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
			<Show when={data.matches}>
				{(matches) => <MatchList matches={matches()} columnsToShow={columnsToShow()} />}
			</Show>
		</Card>
	);
};
