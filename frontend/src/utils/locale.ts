import { createSignal } from 'solid-js';
import de from '../locales/de.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

export const t = (key: string) => {
	const l = getCurrentLocale() as { [key: string]: string };
	const value = l[key];
	if (!value) {
		console.debug(`No entry for "${key}" in locale "${currentLocale()}"`);
	}
	return value ?? key;
};

type Locale = 'de' | 'en' | 'fr';

const locales: Locale[] = ['de', 'en', 'fr'];

const fromBrowserLanguage = (): Locale => {
	const nl = navigator.language?.substring(0, 2) as Locale;
	if (locales.includes(nl)) {
		return nl;
	}
	return 'en';
};

const [currentLocale, setCurrentLocale] = createSignal<Locale>(
	(localStorage.getItem('locale') as Locale) ?? fromBrowserLanguage()
);
export { currentLocale };

export const cycleLocale = () => {
	const cl = currentLocale();
	let next: Locale = locales[(locales.indexOf(cl) + 1) % locales.length];
	setCurrentLocale(next);
	localStorage.setItem('locale', next);
};

const getCurrentLocale = () => {
	const cl = currentLocale();
	switch (cl) {
		case 'de':
			return de;
		case 'en':
			return en;
		case 'fr':
			return fr;
		default:
			console.warn(`Locale ${cl} is not available, use "en" instead`);
			return en;
	}
};
