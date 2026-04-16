import { Component } from 'solid-js';
import { logout } from '../utils/auth';
import { t } from '../utils/locale';

export const LogoutPage: Component = () => {
	logout();
	return (
		<>
			<p>{t('Log Out')}</p>
		</>
	);
};
