type obj = { [key: string]: any };
export function makeStringify(object: obj) {
	const newObject: obj = {};
	Object.entries(object).forEach(([key, value]) => {
		if (value instanceof Set) {
			newObject[key] = Array.from(value.values());
		} else if (value instanceof Map) {
			newObject[key] = Array.from(value.entries()).reduce((pv: obj, [key, value]) => {
				pv[key] = value;
				return pv;
			}, {});
		} else {
			newObject[key] = value;
		}
	});
	return newObject;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
