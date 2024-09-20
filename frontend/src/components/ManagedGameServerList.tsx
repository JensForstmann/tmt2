import { A } from '@solidjs/router';
import { Component, For } from 'solid-js';
import { IManagedGameServer, IManagedGameServerUpdateDto } from '../../../common';
import { SvgCheck, SvgClear, SvgDelete, SvgTerminal } from '../assets/Icons';
import { t } from '../utils/locale';
import { Card } from './Card';

export const ManagedGameServerList: Component<{
	managedGameServers: IManagedGameServer[];
	delete: (managedGameServer: IManagedGameServer) => void;
	update: (managedGameServer: IManagedGameServerUpdateDto) => void;
}> = (props) => {
	return (
		<Card>
			<table class="table-zebra table">
				<thead>
					<tr>
						<th>{t('#')}</th>
						<th>{t('IP')}</th>
						<th>{t('Port')}</th>
						<th>{t('Rcon Password')}</th>
						<th>{t('Can Be Used?')}</th>
						<th>{t('Used By')}</th>
						<th>{t('Actions')}</th>
					</tr>
				</thead>
				<tbody>
					<For each={props.managedGameServers}>
						{(managedGameServer, i) => (
							<tr>
								<td>{i() + 1}</td>
								<td>{managedGameServer.ip}</td>
								<td>{managedGameServer.port}</td>
								<td>{managedGameServer.rconPassword}</td>
								<td>
									<button
										class="btn btn-circle btn-outline"
										onClick={() =>
											props.update({
												...managedGameServer,
												canBeUsed: !managedGameServer.canBeUsed,
											})
										}
									>
										{managedGameServer.canBeUsed ? <SvgCheck /> : <SvgClear />}
									</button>
								</td>
								<td>
									{managedGameServer.usedBy && (
										<>
											<A href={`/matches/${managedGameServer.usedBy}`}>
												{managedGameServer.usedBy}
											</A>{' '}
											<button
												class="btn btn-circle btn-outline"
												onClick={() =>
													props.update({
														...managedGameServer,
														usedBy: null,
													})
												}
											>
												<SvgClear />
											</button>
										</>
									)}
								</td>
								<td class="space-x-2">
									<div class="tooltip" data-tip={t('Rcon')}>
										<A
											href={`/gameservers/${managedGameServer.ip}:${managedGameServer.port}`}
											class="btn btn-circle btn-outline"
										>
											<SvgTerminal />
										</A>
									</div>
									<button
										class="btn btn-circle btn-outline"
										onClick={() => props.delete(managedGameServer)}
									>
										<SvgDelete />
									</button>
								</td>
							</tr>
						)}
					</For>
				</tbody>
			</table>
		</Card>
	);
};
