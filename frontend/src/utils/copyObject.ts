export const copyObject = <T>(obj: T): T => {
	return JSON.parse(JSON.stringify(obj));
};
