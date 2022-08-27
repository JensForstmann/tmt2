import { isProxy } from 'util/types';

export const addChangeListener = <T extends object>(
	obj: T,
	onChange: (path: Array<string | number>, value: any) => void
) => {
	if (isProxy(obj)) {
		console.warn(
			'changeListener: Object already is a Proxy. Not supported to add a change listener.'
		);
		return obj;
	}
	const createProxyHandler = <K extends object>(path: string[]): ProxyHandler<K> => {
		return {
			get: (target: any, key: any): any => {
				const value = target[key];
				if ((typeof value === 'object' && value !== null) || Array.isArray(value)) {
					return new Proxy(value, createProxyHandler([...path, key]));
				} else {
					return value;
				}
			},
			set: (target: any, key: any, value: any) => {
				if (typeof key === 'string' || typeof key === 'number') {
					// console.log(`set key ${[...path, key]} to ${JSON.stringify(value)}`);
					target[key] = value;
					onChange([...path, key], value);
					return true;
				} else {
					return false;
				}
			},
		};
	};
	return new Proxy(obj, createProxyHandler([]));
};
