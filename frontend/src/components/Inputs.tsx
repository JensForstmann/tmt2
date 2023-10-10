import { Component, ComponentProps, JSXElement, Show, splitProps } from 'solid-js';

export const ToggleInput: Component<
	ComponentProps<'input'> & {
		label?: string;
		labelTopRight?: string;
	}
> = (props) => {
	const [local, others] = splitProps(props, ['label', 'class', 'labelTopRight']);
	return (
		<div class="form-control">
			<Show when={local.label !== undefined}>
				<label class="label">
					<span class="label-text">{local.label}</span>
					<span class="label-text-alt">{local.labelTopRight}</span>
				</label>
			</Show>
			<input type="checkbox" class={(local.class ?? '') + ' toggle'} {...others} />
		</div>
	);
};

export const TextInput: Component<
	ComponentProps<'input'> & {
		label?: string;
		labelBottomLeft?: string;
		labelTopRight?: string;
		containerClass?: string;
	}
> = (props) => {
	const [local, others] = splitProps(props, [
		'label',
		'class',
		'containerClass',
		'labelBottomLeft',
		'labelTopRight',
	]);
	return (
		<div class={(local.containerClass ?? '') + ' form-control'}>
			<Show when={local.label !== undefined}>
				<label class="label">
					<span class="label-text">{local.label}</span>
					<span class="label-text-alt">{local.labelTopRight}</span>
				</label>
			</Show>
			<input class={(local.class ?? '') + ' input w-full'} type="text" {...others} />
			<label class="label">
				<span class="label-text-alt">{local.labelBottomLeft}</span>
			</label>
		</div>
	);
};

export const TextArea: Component<
	ComponentProps<'textarea'> & {
		label?: string;
		labelTopRight?: string;
	}
> = (props) => {
	const [local, others] = splitProps(props, ['label', 'class', 'labelTopRight']);
	return (
		<div class="form-control">
			<Show when={local.label !== undefined}>
				<label class="label">
					<span class="label-text">{local.label}</span>
					<span class="label-text-alt">{local.labelTopRight}</span>
				</label>
			</Show>
			<textarea {...others} class={(local.class ?? '') + ' textarea w-full'}></textarea>
		</div>
	);
};

export const SelectInput: Component<
	ComponentProps<'select'> & {
		label?: string;
		labelTopRight?: string;
		labelBottomLeft?: JSXElement;
		children: JSXElement;
	}
> = (props) => {
	const [local, others] = splitProps(props, [
		'label',
		'labelBottomLeft',
		'class',
		'children',
		'labelTopRight',
	]);
	return (
		<div class="form-control">
			<Show when={local.label !== undefined}>
				<label class="label">
					<span class="label-text">{local.label}</span>
					<span class="label-text-alt">{local.labelTopRight}</span>
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
