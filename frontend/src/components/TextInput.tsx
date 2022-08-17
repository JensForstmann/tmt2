import { Component, ComponentProps } from 'solid-js';

export const TextInput: Component<ComponentProps<'input'>> = (props) => {
	return <input class="w-full" type="text" {...props} />;
};
