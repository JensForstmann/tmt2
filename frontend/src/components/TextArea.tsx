import { Component, ComponentProps } from 'solid-js';

export const TextArea: Component<ComponentProps<'textarea'>> = (props) => {
	return <textarea class={(props.class || '') + ' w-full'} {...props}></textarea>;
};
