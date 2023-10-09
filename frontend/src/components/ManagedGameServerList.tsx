import { Component, For } from 'solid-js';
import { IManagedGameServer, IManagedGameServerUpdateDto } from '../../../common';
import { t } from '../utils/locale';
import { Card } from './Card';
import { SvgCheck, SvgClear, SvgDelete } from '../assets/Icons';

export const ManagedGameServerList: Component<{
	managedGameServers: IManagedGameServer[];
	delete?: (managedGameServer: IManagedGameServer) => void;
	update?: (managedGameServer: IManagedGameServerUpdateDto) => void;
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
						{props.delete && <th>{t('Actions')}</th>}
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
											props.update?.({
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
											<a href={`/matches/${managedGameServer.usedBy}`}>
												{managedGameServer.usedBy}
											</a>{' '}
											{props.update && (
												<button
													class="btn btn-circle btn-outline"
													onClick={() =>
														props.update?.({
															...managedGameServer,
															usedBy: null,
														})
													}
												>
													<SvgClear />
												</button>
											)}
										</>
									)}
								</td>
								{props.delete && (
									<th>
										{props.delete && (
											<button
												class="btn btn-circle btn-outline"
												onClick={() => props.delete?.(managedGameServer)}
											>
												<SvgDelete />
											</button>
										)}
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
