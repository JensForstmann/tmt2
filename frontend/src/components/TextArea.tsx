import { Component, ComponentProps } from 'solid-js';

export const TextArea: Component<ComponentProps<'textarea'>> = (props) => {
	props.class = props.class + ' w-full';
	return <textarea {...props}></textarea>;
};
