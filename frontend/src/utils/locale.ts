import { createSignal } from 'solid-js';
import de from '../locales/de.json';
import en from '../locales/en.json';

export const t = (key: string) => {
	const l = getCurrentLocale() as { [key: string]: string };
	return l[key] ?? key;
};

// TODO: read wanted locale from browser
const [currentLocale, setCurrentLocale] = createSignal<'de' | 'en'>(
	(localStorage.getItem('locale') as 'de' | 'en') ?? 'de'
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
