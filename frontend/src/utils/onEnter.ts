import { HTMLInputKeyboardEvent } from '../components/Inputs';

export const onEnter =
	(fn: (e: HTMLInputKeyboardEvent) => void, next?: (e: HTMLInputKeyboardEvent) => void) =>
	(e: HTMLInputKeyboardEvent) => {
		if (e.key === 'Enter') {
			fn(e);
		} else {
			next?.(e);
		}
	};
