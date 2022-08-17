import { Component, JSX, Show } from 'solid-js';

export const Modal: Component<{
	children: JSX.Element;
	show: boolean;
	onBackdropClick?: () => void;
}> = (props) => {
	return (
		<Show when={props.show}>
			<div
				class={`fixed inset-0 z-30 flex items-center justify-center bg-zinc-500/50`}
				style="margin: 0; padding: 0;"
				onClick={props.onBackdropClick}
			>
				<div
					class="relative mx-auto w-full max-w-2xl space-y-5 rounded-lg bg-zinc-100 p-5 transition-all dark:bg-zinc-800"
					onClick={(e) => e.stopPropagation()}
				>
					{props.children}
				</div>
			</div>
		</Show>
	);
};
