export const escapeRconString = (str: string) => {
	return str.replace(/[";]/g, '');
};

export const escapeRconSayString = (str: string) => {
	return str.replace(/;/g, '');
};
