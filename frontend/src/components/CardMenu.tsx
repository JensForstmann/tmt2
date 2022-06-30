import { Component, createSignal, For, JSX, onCleanup, Show } from 'solid-js';
import threeDotsVertical from '../assets/icons/three-dots-vertical.svg';

export const CardMenu: Component<{
	entries: [JSX.Element, () => void][];
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
		<div ref={ref} class="absolute right-3 top-3 text-right">
			<button onClick={toggleMenu}>
				<img src={threeDotsVertical} />
			</button>
			<Show when={showMenu()}>
				<div class="text-left">
					<ul>
						<For each={props.entries}>
							{(entry) => (
								<li
									onClick={() => {
										closeMenu();
										entry[1]();
									}}
								>
									{entry[0]}
								</li>
							)}
						</For>
					</ul>
				</div>
			</Show>
		</div>
	);
};
