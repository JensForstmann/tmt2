import { A } from '@solidjs/router';
import { Component, createEffect, createSignal, For } from 'solid-js';
import { t } from '../utils/locale';

export const StatsTable: Component<{
	headers: string[];
	data: any[];
	columns: string[];
	loading: boolean;
	groupBy?: string;
	detailsPrefix?: string;
	detailsProp?: string;
}> = (props) => {
	const [uniqueGroups, setUniqueGroups] = createSignal<string[]>([]);

	createEffect(() => {
		if (props.groupBy && props.columns.includes(props.groupBy)) {
			let ug = new Set<string>();
			for (const d of props.data) {
				ug.add(d[props.groupBy]);
			}
			setUniqueGroups(Array.from(ug));
		}
	});

	const cell = (d: any, column: string) => {
		let result = '';
		for (const key of column.split('|')) {
			if (key in d) {
				result += d[key];
			} else {
				result += key;
			}
		}
		return <td>{result}</td>;
	};

	const detailsButton = (d: any) => (
		<td class="w-24 p-2">
			<A
				href={props.detailsPrefix + d[props.detailsProp ? props.detailsProp : '']}
				class="btn btn-outline btn-sm w-full hover:no-underline"
			>
				{t('Details')}
			</A>
		</td>
	);

	return (
		<>
			<table class="table">
				<thead>
					<tr class="border-b border-gray-700">
						<For each={props.headers}>{(header) => <th>{header}</th>}</For>
					</tr>
				</thead>
				<tbody>
					{props.groupBy && props.columns.includes(props.groupBy) ? (
						<For each={uniqueGroups()}>
							{(group) => (
								<>
									{props.data
										.filter((d) => props.groupBy && d[props.groupBy] === group)
										.map((d, index) => (
											<tr class="border-b border-gray-800 last:border-b-0">
												<For each={props.columns}>
													{(column) => {
														if (
															column != props.groupBy ||
															index === 0
														) {
															return cell(d, column);
														}
														return <td></td>;
													}}
												</For>
												{props.detailsPrefix && detailsButton(d)}
											</tr>
										))}
								</>
							)}
						</For>
					) : (
						<For each={props.data}>
							{(d) => (
								<tr class="border-b border-gray-800 last:border-b-0">
									<For each={props.columns}>{(column) => cell(d, column)}</For>
									{props.detailsPrefix && detailsButton(d)}
								</tr>
							)}
						</For>
					)}
				</tbody>
			</table>
			{props.loading && (
				<div class="p-4">
					<div class="flex justify-center items-center h-full p-4">
						<span class="text-gray-500">Loading...</span>
					</div>
				</div>
			)}
		</>
	);
};
