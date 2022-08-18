import { createSignal } from 'solid-js';

export const updateDarkClasses = () => {
	if (currentMode() === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
};

const [currentTheme, setCurrentTheme] = createSignal<'light' | 'dark' | 'system'>(
	(localStorage.getItem('theme') as 'light' | 'dark' | null) ?? 'system'
);
export { currentTheme };

const systemWantsDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

// if system wants dark:  system -> light -> dark  ->
// if system wants light: system -> dark  -> light ->
export const cycleDarkMode = () => {
	const swd = systemWantsDark();
	let next: 'light' | 'dark' | 'system';
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
	setCurrentTheme(next);
	localStorage.setItem('theme', next);
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
