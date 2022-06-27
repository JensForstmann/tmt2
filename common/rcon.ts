export const escapeRconString = (str: string) => {
	return str.replace(/[";]/g, '');
};
