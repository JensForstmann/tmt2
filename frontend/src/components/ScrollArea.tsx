import autoAnimate from '@formkit/auto-animate';
import { Component, Index, JSXElement, onMount } from 'solid-js';

export const ScrollArea: Component<{
	children: JSXElement[];
	scroll?: boolean;
}> = (props) => {
	let ref: HTMLDivElement;
	onMount(() => {
		if (ref) {
			autoAnimate(ref);
		}
	});
	return (
		<div class="h-80 overflow-y-auto bg-zinc-100 text-left dark:bg-zinc-600" ref={ref!}>
			<Index each={props.children}>
				{(line) => (
					<Line scroll={props.scroll} containerRef={ref}>
						{line()}
					</Line>
				)}
			</Index>
		</div>
	);
};

const Line: Component<{
	children: JSXElement;
	scroll?: boolean;
	containerRef?: HTMLDivElement;
}> = (props) => {
	onMount(() => {
		if (props.containerRef) {
			props.containerRef.scrollTop = props.containerRef.scrollHeight;
		}
	});
	return <div>{props.children}</div>;
};
