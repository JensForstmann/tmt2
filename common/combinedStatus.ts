import { TStatus } from './types';

export const combinedStatus = (statuses: TStatus[]): TStatus => {
	let status: TStatus = 'OK';
	for (const s of statuses) {
		if (s === 'LOADING' && status === 'OK') {
			status = 'LOADING';
		} else if (s === 'ERROR' && (status === 'OK' || status === 'LOADING')) {
			status = 'ERROR';
		} else if (
			s === 'NOT_FOUND' &&
			(status === 'OK' || status === 'LOADING' || status === 'ERROR')
		) {
			status = 'NOT_FOUND';
		}
	}
	return status;
};
