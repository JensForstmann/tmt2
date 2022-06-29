import { Component, JSX, Show } from 'solid-js';

export const Modal: Component<{
	children: JSX.Element;
	show: boolean;
	onBackdropClick?: () => void;
}> = (props) => {
	return (
		<Show when={props.show}>
			<div
				class={`fixed z-30 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center`}
				style="margin: 0; padding: 0;"
				onClick={props.onBackdropClick}
			>
				<div
					class="relative bg-gray-100 rounded-lg transition-all space-y-5 p-5 max-w-2xl mx-auto w-full"
					onClick={(e) => e.stopPropagation()}
				>
					{props.children}
				</div>
			</div>
		</Show>
	);
};
