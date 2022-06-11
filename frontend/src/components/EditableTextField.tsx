import { Component, createSignal, Match, splitProps, Switch } from 'solid-js';
import classes from './EditableTextField.module.scss';

export const EditableTextField: Component<{
	label: string;
	initialValue: string;
	onSave: (newValue: string) => Promise<boolean>;
	editable: boolean;
	align: 'left' | 'right';
}> = (props) => {
	const [local, other] = splitProps(props, ['label', 'initialValue', 'onSave']);
	const [value, setValue] = createSignal(local.initialValue);
	const [state, setState] = createSignal<'same' | 'changed' | 'saving' | 'error' | 'saved'>(
		'same'
	);
	const [timeId, setTimeId] = createSignal<number>();
	const save = async () => {
		if (state() === 'same' || state() === 'saving') {
			return;
		}
		setState('saving');
		const resp = await local.onSave(value());
		if (resp) {
			setState('saved');
			clearTimeout(timeId());
			setTimeId(
				setTimeout(
					() => setState(value() === local.initialValue ? 'same' : 'changed'),
					1000
				)
			);
		} else {
			setState('error');
			clearTimeout(timeId());
			setTimeId(
				setTimeout(
					() => setState(value() === local.initialValue ? 'same' : 'changed'),
					1000
				)
			);
		}
	};

	// const adornment = <IconButton
	//     onClick={() => save()}
	//     style={state() === 'same' ? 'visibility: hidden;' : ''}
	// >
	//     <Switch fallback={<CheckIcon />}>
	//         <Match when={state() === 'saved'}><CheckIcon /></Match>
	//         <Match when={state() === 'changed'}><SaveIcon /></Match>
	//         <Match when={state() === 'saving'}><RefreshIcon /></Match>
	//         <Match when={state() === 'error'}><ErrorIcon /></Match>
	//     </Switch>
	// </IconButton>;

	return (
		<label>
			{props.align === 'right' && local.label}
			<input
				type="text"
				value={value()}
				onInput={(e) => {
					setValue(e.currentTarget.value);
					setState(e.currentTarget.value === local.initialValue ? 'same' : 'changed');
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						save();
					}
				}}
				style={props.align === 'right' ? 'text-align: right;' : undefined}
				classList={{
					[classes.error]: state() === 'error',
					[classes.saved]: state() === 'saved',
					[classes.saving]: state() === 'saving',
					[classes.changed]: state() === 'changed',
				}}
			/>
			{props.align === 'left' && local.label}
		</label>
	);
};
