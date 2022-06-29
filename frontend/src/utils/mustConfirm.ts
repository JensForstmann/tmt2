import { t } from './locale';

export const mustConfirm =
	(fn: Function, msg = t('caution, please confirm')) =>
	() => {
		if (confirm(msg)) {
			fn();
		}
	};
