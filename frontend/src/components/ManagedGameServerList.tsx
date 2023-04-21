import { Component, For } from 'solid-js';
import { IManagedGameServer, IManagedGameServerUpdateDto } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';

export const ManagedGameServerList: Component<{
	managedGameServers: IManagedGameServer[];
	delete?: (managedGameServer: IManagedGameServer) => void;
	update?: (managedGameServer: IManagedGameServerUpdateDto) => void;
}> = (props) => {
	return (
		<Card>
			<table class="tmt-table w-full">
				<thead>
					<tr>
						<th>{t('#')}</th>
						<th>{t('IP')}</th>
						<th>{t('Port')}</th>
						<th>{t('Rcon Password')}</th>
						<th>{t('Can Be Used?')}</th>
						<th>{t('Used By')}</th>
						{props.delete && <th>{t('Delete')}</th>}
					</tr>
				</thead>
				<tbody>
					<For each={props.managedGameServers}>
						{(managedGameServer, i) => (
							<tr
								class={
									i() % 2 === 0
										? 'bg-transparent/5 dark:bg-transparent/10'
										: 'bg-transparent/10 dark:bg-transparent/20'
								}
							>
								<td>{i() + 1}</td>
								<td>{managedGameServer.ip}</td>
								<td>{managedGameServer.port}</td>
								<td>{managedGameServer.rconPassword}</td>
								<td>
									<span
										onClick={() =>
											props.update?.({
												...managedGameServer,
												canBeUsed: !managedGameServer.canBeUsed,
											})
										}
										class={props.update ? 'cursor-pointer' : ''}
									>
										{managedGameServer.canBeUsed ? '✅' : '➖'}
									</span>
								</td>
								<td>
									{managedGameServer.usedBy && (
										<a href={`/matches/${managedGameServer.usedBy}`}>
											{managedGameServer.usedBy}
										</a>
									)}
								</td>
								{props.delete && (
									<th>
										<span
											onClick={() => props.delete?.(managedGameServer)}
											class="cursor-pointer"
										>
											❌
										</span>
									</th>
								)}
							</tr>
						)}
					</For>
				</tbody>
			</table>
		</Card>
	);
};
