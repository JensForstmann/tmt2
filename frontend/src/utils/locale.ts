import { createSignal } from 'solid-js';
import de from '../locales/de.json';
import en from '../locales/en.json';

export const t = (key: string) => {
	const l = getCurrentLocale() as { [key: string]: string };
	const value = l[key];
	if (!value) {
		console.debug(`no entry for "${key}" in locale "${currentLocale()}"`);
	}
	return value ?? key;
};

const fromBrowserLanguage = () => {
	const nl = navigator.language?.substring(0, 2);
	if (['de', 'en'].includes(nl)) {
		return nl;
	}
	return 'en';
};

const [currentLocale, setCurrentLocale] = createSignal<'de' | 'en'>(
	(localStorage.getItem('locale') as 'de' | 'en') ?? fromBrowserLanguage()
);
export { currentLocale };

export const cycleLocale = () => {
	const cl = currentLocale();
	let next: 'de' | 'en';
	if (cl === 'de') {
		next = 'en';
	} else if (cl === 'en') {
		next = 'de';
	} else {
		next = 'en';
	}
	setCurrentLocale(next);
	localStorage.setItem('locale', next);
};

const getCurrentLocale = () => {
	const cl = currentLocale();
	if (cl === 'de') {
		return de;
	} else if (cl === 'en') {
		return en;
	} else {
		console.warn(`locale ${cl} is not available, use "en" instead`);
		return en;
	}
};
