import { createSignal } from 'solid-js';

export const updateDarkClasses = () => {
	if (currentMode() === 'dark') {
		document.documentElement.dataset.theme = 'dark';
	} else {
		document.documentElement.dataset.theme = 'light';
	}
};

type Theme = 'light' | 'dark' | 'system';

const [currentTheme, setCurrentTheme] = createSignal<Theme>(
	(localStorage.getItem('theme') as Theme | null) ?? 'system'
);
export { currentTheme };

const systemWantsDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

// if system wants dark:  system -> light -> dark  ->
// if system wants light: system -> dark  -> light ->
export const cycleTheme = () => {
	const swd = systemWantsDark();
	let next: Theme;
	const ct = currentTheme();

	if (swd && ct === 'system') {
		next = 'light';
	} else if (swd && ct === 'light') {
		next = 'dark';
	} else if (swd && ct === 'dark') {
		next = 'system';
	} else if (!swd && ct === 'system') {
		next = 'dark';
	} else if (!swd && ct === 'dark') {
		next = 'light';
	} else if (!swd && ct === 'light') {
		next = 'system';
	} else {
		next = 'system';
	}
	setTheme(next);
};

export const setTheme = (theme: Theme) => {
	setCurrentTheme(theme);
	localStorage.setItem('theme', theme);
	updateDarkClasses();
};

const currentMode = () => {
	const swd = systemWantsDark();
	const ct = currentTheme();
	if (ct === 'system') {
		return swd ? 'dark' : 'light';
	}
	return ct;
};
