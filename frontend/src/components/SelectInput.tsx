import { Component, ComponentProps, JSXElement, Show, splitProps } from 'solid-js';

export const SelectInput: Component<
	ComponentProps<'select'> & {
		label?: string;
		labelBottomLeft?: JSXElement;
		children: JSXElement;
	}
> = (props) => {
	const [local, others] = splitProps(props, ['label', 'labelBottomLeft', 'class', 'children']);
	return (
		<div class="form-control">
			<Show when={local.label !== undefined}>
				<label class="label">
					<span class="label-text">{local.label}</span>
				</label>
			</Show>
			<select class="select w-full" {...others}>
				{local.children}
			</select>
			<label class="label">
				<span class="label-text-alt">{local.labelBottomLeft}</span>
			</label>
		</div>
	);
};
