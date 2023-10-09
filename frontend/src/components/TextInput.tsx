import { Component, ComponentProps, Show, splitProps } from 'solid-js';

export const TextInput: Component<
	ComponentProps<'input'> & {
		label?: string;
		containerClass?: string;
	}
> = (props) => {
	const [local, others] = splitProps(props, ['label', 'class', 'containerClass']);
	return (
		<div class={(local.containerClass ?? '') + ' form-control'}>
			<Show when={local.label !== undefined}>
				<label class="label">
					<span class="label-text">{local.label}</span>
				</label>
			</Show>
			<input class={(local.class ?? '') + ' input w-full'} type="text" {...others} />
		</div>
	);
};
