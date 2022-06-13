// TODO: move into common

export const sleep = (ms: number) => {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export const escapeRconString = (str: string) => {
	return str.replace(/[";]/g, '');
};
