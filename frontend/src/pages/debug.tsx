import { Component, createEffect, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { createFetcher } from '../utils/fetcher';
import { IDebugResponse } from '../../../common';

export const DebugPage: Component = () => {
	const fetcher = createFetcher();
	const [debugData, setDebugData] = createSignal<IDebugResponse>();
	createEffect(() => {
		fetcher<IDebugResponse>('GET', '/api/debug').then((debug) => {
			setDebugData(debug);
		});
	});

	return (
		<Card>
			<pre>{JSON.stringify(debugData(), null, 4)}</pre>
		</Card>
	);
};
