import { Component, JSX } from 'solid-js';

export const Card: Component<{
	children: JSX.Element;
}> = (props) => {
	return (
		<div class="relative overflow-x-auto rounded-lg bg-zinc-200 p-5 text-center shadow shadow-zinc-400 transition-all hover:shadow-lg dark:bg-zinc-700 dark:shadow-zinc-900">
			{props.children}
		</div>
	);
};
