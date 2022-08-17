import { Component, createSignal, For, JSX, onCleanup } from 'solid-js';
import { SvgThreeDotsVertical } from '../assets/Icons';

export const CardMenu: Component<{
	show: boolean;
	entries: Array<false | [JSX.Element, () => void]>;
}> = (props) => {
	let ref: HTMLDivElement | undefined;

	const [showMenu, setShowMenu] = createSignal(false);

	const onClick = (e: MouseEvent) => {
		if (!ref?.contains(e.target as Node)) {
			closeMenu();
		}
	};

	const openMenu = () => {
		setShowMenu(true);
		document.body.addEventListener('click', onClick);
	};

	const closeMenu = () => {
		setShowMenu(false);
		document.body.removeEventListener('click', onClick);
	};

	const toggleMenu = () => {
		if (showMenu()) {
			closeMenu();
		} else {
			openMenu();
		}
	};

	onCleanup(closeMenu);

	return (
		<>
			<div
				ref={ref}
				class={`absolute right-3 top-3 text-right ${props.show ? '' : 'hidden'}`}
			>
				<button onClick={toggleMenu}>
					<SvgThreeDotsVertical />
				</button>
			</div>
			<div
				class={`${
					showMenu() ? 'max-h-full' : 'max-h-0'
				} absolute right-9 top-0 overflow-hidden rounded-br-lg rounded-bl-lg bg-teal-50 text-left shadow-sm shadow-teal-100 transition-all
				hover:cursor-pointer dark:bg-teal-900 dark:shadow-teal-700`}
			>
				<ul>
					<For each={props.entries}>
						{(entry) =>
							entry && (
								<li
									class="pl-2 pr-2 text-sm first:pt-1 last:pb-1 hover:bg-teal-100 dark:hover:bg-teal-700"
									onClick={() => {
										closeMenu();
										entry[1]();
									}}
								>
									{entry[0]}
								</li>
							)
						}
					</For>
				</ul>
			</div>
		</>
	);
};
