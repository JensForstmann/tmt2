import { Component, ComponentProps, Show, splitProps } from 'solid-js';

export const ToggleInput: Component<
	ComponentProps<'input'> & {
		label?: string;
	}
> = (props) => {
	const [local, others] = splitProps(props, ['label', 'class']);
	return (
		<div class="form-control">
			<Show when={local.label !== undefined}>
				<label class="label">
					<span class="label-text">{local.label}</span>
				</label>
			</Show>
			<input type="checkbox" class={(local.class ?? '') + ' toggle'} {...others} />
		</div>
	);
};
