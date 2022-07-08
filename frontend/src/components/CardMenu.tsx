import { Component, createSignal, For, JSX, onCleanup } from 'solid-js';
import threeDotsVertical from '../assets/icons/three-dots-vertical.svg';

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
					<img src={threeDotsVertical} />
				</button>
			</div>
			<div
				class={`${
					showMenu() ? 'max-h-full' : 'max-h-0'
				} overflow-hidden text-left absolute rounded-br-lg rounded-bl-lg shadow-md shadow-gray-400 right-9 top-0 bg-gray-300 transition-all hover:cursor-pointer`}
			>
				<ul>
					<For each={props.entries}>
						{(entry) =>
							entry && (
								<li
									class="hover:bg-gray-200 pl-2 pr-2 first:pt-1 last:pb-1 text-sm"
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
