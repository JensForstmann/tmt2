import type { Component, ComponentProps } from 'solid-js';

// icons from: https://fonts.google.com/icons?icon.set=Material+Icons --> download as svg

export const SvgLightMode: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		enable-background="new 0 0 24 24"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<rect fill="none" height="24" width="24" />
		<path d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
	</svg>
);

export const SvgDarkMode: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		enable-background="new 0 0 24 24"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<rect fill="none" height="24" width="24" />
		<path d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z" />
	</svg>
);

export const SvgComputer: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
	</svg>
);

export const SvgFlagDE: Component<ComponentProps<'svg'>> = (props) => (
	<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-de" viewBox="0 0 640 480" {...props}>
		<path fill="#ffce00" d="M0 320h640v160H0z" />
		<path d="M0 0h640v160H0z" />
		<path fill="#d00" d="M0 160h640v160H0z" />
	</svg>
);

export const SvgFlagUS: Component<ComponentProps<'svg'>> = (props) => (
	<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-us" viewBox="0 0 640 480" {...props}>
		<g fill-rule="evenodd">
			<g stroke-width="1pt">
				<path
					fill="#bd3d44"
					d="M0 0h912v37H0zm0 73.9h912v37H0zm0 73.8h912v37H0zm0 73.8h912v37H0zm0 74h912v36.8H0zm0 73.7h912v37H0zM0 443h912V480H0z"
				/>
				<path
					fill="#fff"
					d="M0 37h912v36.9H0zm0 73.8h912v36.9H0zm0 73.8h912v37H0zm0 73.9h912v37H0zm0 73.8h912v37H0zm0 73.8h912v37H0z"
				/>
			</g>
			<path fill="#192f5d" d="M0 0h364.8v258.5H0z" />
			<path
				fill="#fff"
				d="m30.4 11 3.4 10.3h10.6l-8.6 6.3 3.3 10.3-8.7-6.4-8.6 6.3L25 27.6l-8.7-6.3h10.9zm60.8 0 3.3 10.3h10.8l-8.7 6.3 3.2 10.3-8.6-6.4-8.7 6.3 3.3-10.2-8.6-6.3h10.6zm60.8 0 3.3 10.3H166l-8.6 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.7-6.3h10.8zm60.8 0 3.3 10.3h10.8l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.4-10.2-8.8-6.3h10.7zm60.8 0 3.3 10.3h10.7l-8.6 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3h10.7zm60.8 0 3.3 10.3h10.8l-8.8 6.3 3.4 10.3-8.7-6.4-8.7 6.3 3.4-10.2-8.8-6.3h10.8zM60.8 37l3.3 10.2H75l-8.7 6.2 3.2 10.3-8.5-6.3-8.7 6.3 3.1-10.3-8.4-6.2h10.7zm60.8 0 3.4 10.2h10.7l-8.8 6.2 3.4 10.3-8.7-6.3-8.7 6.3 3.3-10.3-8.7-6.2h10.8zm60.8 0 3.3 10.2h10.8l-8.7 6.2 3.3 10.3-8.7-6.3-8.7 6.3 3.3-10.3-8.6-6.2H179zm60.8 0 3.4 10.2h10.7l-8.8 6.2 3.4 10.3-8.7-6.3-8.6 6.3 3.2-10.3-8.7-6.2H240zm60.8 0 3.3 10.2h10.8l-8.7 6.2 3.3 10.3-8.7-6.3-8.7 6.3 3.3-10.3-8.6-6.2h10.7zM30.4 62.6l3.4 10.4h10.6l-8.6 6.3 3.3 10.2-8.7-6.3-8.6 6.3L25 79.3 16.3 73h10.9zm60.8 0L94.5 73h10.8l-8.7 6.3 3.2 10.2-8.6-6.3-8.7 6.3 3.3-10.3-8.6-6.3h10.6zm60.8 0 3.3 10.3H166l-8.6 6.3 3.3 10.2-8.7-6.3-8.7 6.3 3.3-10.3-8.7-6.3h10.8zm60.8 0 3.3 10.3h10.8l-8.7 6.3 3.3 10.2-8.7-6.3-8.7 6.3 3.4-10.3-8.8-6.3h10.7zm60.8 0 3.3 10.3h10.7l-8.6 6.3 3.3 10.2-8.7-6.3-8.7 6.3 3.3-10.3-8.6-6.3h10.7zm60.8 0 3.3 10.3h10.8l-8.8 6.3 3.4 10.2-8.7-6.3-8.7 6.3 3.4-10.3-8.8-6.3h10.8zM60.8 88.6l3.3 10.2H75l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3h10.7zm60.8 0 3.4 10.2h10.7l-8.8 6.3 3.4 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.7-6.3h10.8zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3H179zm60.8 0 3.4 10.2h10.7l-8.7 6.3 3.3 10.3-8.7-6.4-8.6 6.3 3.2-10.2-8.7-6.3H240zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3h10.7zM30.4 114.5l3.4 10.2h10.6l-8.6 6.3 3.3 10.3-8.7-6.4-8.6 6.3L25 131l-8.7-6.3h10.9zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.2 10.2-8.6-6.3-8.7 6.3 3.3-10.2-8.6-6.3h10.6zm60.8 0 3.3 10.2H166l-8.6 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.7-6.3h10.8zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.4-10.2-8.8-6.3h10.7zm60.8 0 3.3 10.2h10.7L279 131l3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3h10.7zm60.8 0 3.3 10.2h10.8l-8.8 6.3 3.4 10.3-8.7-6.4-8.7 6.3L329 131l-8.8-6.3h10.8zM60.8 140.3l3.3 10.3H75l-8.7 6.2 3.3 10.3-8.7-6.4-8.7 6.4 3.3-10.3-8.6-6.3h10.7zm60.8 0 3.4 10.3h10.7l-8.8 6.2 3.4 10.3-8.7-6.4-8.7 6.4 3.3-10.3-8.7-6.3h10.8zm60.8 0 3.3 10.3h10.8l-8.7 6.2 3.3 10.3-8.7-6.4-8.7 6.4 3.3-10.3-8.6-6.3H179zm60.8 0 3.4 10.3h10.7l-8.7 6.2 3.3 10.3-8.7-6.4-8.6 6.4 3.2-10.3-8.7-6.3H240zm60.8 0 3.3 10.3h10.8l-8.7 6.2 3.3 10.3-8.7-6.4-8.7 6.4 3.3-10.3-8.6-6.3h10.7zM30.4 166.1l3.4 10.3h10.6l-8.6 6.3 3.3 10.1-8.7-6.2-8.6 6.2 3.2-10.2-8.7-6.3h10.9zm60.8 0 3.3 10.3h10.8l-8.7 6.3 3.3 10.1-8.7-6.2-8.7 6.2 3.4-10.2-8.7-6.3h10.6zm60.8 0 3.3 10.3H166l-8.6 6.3 3.3 10.1-8.7-6.2-8.7 6.2 3.3-10.2-8.7-6.3h10.8zm60.8 0 3.3 10.3h10.8l-8.7 6.3 3.3 10.1-8.7-6.2-8.7 6.2 3.4-10.2-8.8-6.3h10.7zm60.8 0 3.3 10.3h10.7l-8.6 6.3 3.3 10.1-8.7-6.2-8.7 6.2 3.3-10.2-8.6-6.3h10.7zm60.8 0 3.3 10.3h10.8l-8.8 6.3 3.4 10.1-8.7-6.2-8.7 6.2 3.4-10.2-8.8-6.3h10.8zM60.8 192l3.3 10.2H75l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3h10.7zm60.8 0 3.4 10.2h10.7l-8.8 6.3 3.4 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.7-6.3h10.8zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3H179zm60.8 0 3.4 10.2h10.7l-8.7 6.3 3.3 10.3-8.7-6.4-8.6 6.3 3.2-10.2-8.7-6.3H240zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.3 10.3-8.7-6.4-8.7 6.3 3.3-10.2-8.6-6.3h10.7zM30.4 217.9l3.4 10.2h10.6l-8.6 6.3 3.3 10.2-8.7-6.3-8.6 6.3 3.2-10.3-8.7-6.3h10.9zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.3 10.2-8.7-6.3-8.7 6.3 3.4-10.3-8.7-6.3h10.6zm60.8 0 3.3 10.2H166l-8.4 6.3 3.3 10.2-8.7-6.3-8.7 6.3 3.3-10.3-8.7-6.3h10.8zm60.8 0 3.3 10.2h10.8l-8.7 6.3 3.3 10.2-8.7-6.3-8.7 6.3 3.4-10.3-8.8-6.3h10.7zm60.8 0 3.3 10.2h10.7l-8.6 6.3 3.3 10.2-8.7-6.3-8.7 6.3 3.3-10.3-8.6-6.3h10.7zm60.8 0 3.3 10.2h10.8l-8.8 6.3 3.4 10.2-8.7-6.3-8.7 6.3 3.4-10.3-8.8-6.3h10.8z"
			/>
		</g>
	</svg>
);

export const SvgThreeDotsVertical: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		fill="currentColor"
		viewBox="0 0 16 16"
		{...props}
	>
		<path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
	</svg>
);

export const SvgCopyAll: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		enable-background="new 0 0 24 24"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<rect fill="none" height="24" width="24" />
		<path d="M18,2H9C7.9,2,7,2.9,7,4v12c0,1.1,0.9,2,2,2h9c1.1,0,2-0.9,2-2V4C20,2.9,19.1,2,18,2z M18,16H9V4h9V16z M3,15v-2h2v2H3z M3,9.5h2v2H3V9.5z M10,20h2v2h-2V20z M3,18.5v-2h2v2H3z M5,22c-1.1,0-2-0.9-2-2h2V22z M8.5,22h-2v-2h2V22z M13.5,22L13.5,22l0-2h2 v0C15.5,21.1,14.6,22,13.5,22z M5,6L5,6l0,2H3v0C3,6.9,3.9,6,5,6z" />
	</svg>
);

export const SvgOpenInNew: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
	</svg>
);

export const SvgNavigateBefore: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M15.61 7.41L14.2 6l-6 6 6 6 1.41-1.41L11.03 12l4.58-4.59z" />
	</svg>
);

export const SvgNavigateNext: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0z" fill="none" />
		<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
	</svg>
);

export const SvgCheck: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
	</svg>
);

export const SvgClear: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
	</svg>
);

export const SvgDelete: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
	</svg>
);

export const SvgKeyboardArrowUp: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z" />
	</svg>
);

export const SvgKeyboardArrowDown: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
	</svg>
);

export const SvgAdd: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
	</svg>
);

export const SvgSave: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z" />
	</svg>
);

export const SvgSettings: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
	</svg>
);

export const SvgVisiblityOff: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
		<path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z" />
	</svg>
);

export const SvgVisiblity: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<path d="M0 0h24v24H0V0z" fill="none" />
		<path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" />
	</svg>
);

// https://fonts.google.com/icons?icon.set=Material+Icons&selected=Material+Icons+Outlined:terminal:&icon.query=termin&icon.size=24&icon.color=%23e8eaed
export const SvgTerminal: Component<ComponentProps<'svg'>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		enable-background="new 0 0 24 24"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<g>
			<rect fill="none" height="24" width="24" />
		</g>
		<g>
			<path d="M20,4H4C2.89,4,2,4.9,2,6v12c0,1.1,0.89,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.11,4,20,4z M20,18H4V8h16V18z M18,17h-6v-2 h6V17z M7.5,17l-1.41-1.41L8.67,13l-2.59-2.59L7.5,9l4,4L7.5,17z" />
		</g>
	</svg>
);
