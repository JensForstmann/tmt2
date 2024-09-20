import { useParams } from '@solidjs/router';
import { Component } from 'solid-js';
import { ErrorComponent } from '../components/ErrorComponent';
import { RconServer } from '../components/Rcon';
import { t } from '../utils/locale';

export const GameServerPage: Component = () => {
	const params = useParams();
	const parts = params.ipPort.split(':', 2);
	const ip = parts[0];
	const port = Number.parseInt(parts[1]);

	return Number.isNaN(port) ? (
		<ErrorComponent errorMessage={t('ip:port invalid')} />
	) : (
		<RconServer ip={ip} port={port} />
	);
};
