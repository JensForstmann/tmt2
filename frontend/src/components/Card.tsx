import { Component, JSX } from 'solid-js';

export const Card: Component<{
	children: JSX.Element;
	class?: string;
}> = (props) => {
	return (
		<div
			class={
				'relative text-center bg-gray-100 rounded-lg shadow-gray-300 shadow-md hover:shadow-lg transition-all p-5 ' +
					props.class || ''
			}
		>
			{props.children}
		</div>
	);
};
