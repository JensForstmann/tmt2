type EventType = KeyboardEvent & {
	currentTarget: HTMLInputElement;
	target: Element;
};
export const onEnter =
	(fn: (e: EventType) => void, next?: (e: EventType) => void) => (e: EventType) => {
		if (e.key === 'Enter') {
			fn(e);
		} else {
			next?.(e);
		}
	};
