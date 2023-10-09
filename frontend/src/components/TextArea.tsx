import { Component, ComponentProps, Show, splitProps } from 'solid-js';

export const TextArea: Component<
	ComponentProps<'textarea'> & {
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
			<textarea {...others} class={(local.class ?? '') + ' textarea w-full'}></textarea>
		</div>
	);
};
