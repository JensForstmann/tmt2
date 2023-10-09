import { Component, JSX } from 'solid-js';

export const Card: Component<{
	children: JSX.Element;
	class?: string;
}> = (props) => {
	return (
		<div class="bg-base-300 relative overflow-x-auto rounded-lg p-5 shadow transition-all hover:shadow-lg">
			<div class={props.class}>{props.children}</div>
		</div>
	);
};
