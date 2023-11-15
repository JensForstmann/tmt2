import { useNavigate } from '@solidjs/router';
import { Component, createSignal } from 'solid-js';
import { IMatch } from '../../../common';
import { Card } from '../components/Card';
import { CreateUpdateMatch, getSimpleElectionSteps } from '../components/CreateUpdateMatch';
import { createFetcher } from '../utils/fetcher';

const DEFAULT_MAPS = [
	'de_ancient',
	'de_anubis',
	'de_inferno',
	'de_mirage',
	'de_nuke',
	'de_overpass',
	'de_vertigo',
];

const DEFAULT_RCON_INIT = [
	'game_type 0; game_mode 1; sv_game_mode_flags 0; sv_skirmish_id 0',
	'say > RCON INIT LOADED <',
];
const DEFAULT_RCON_KNIFE = [
	'mp_give_player_c4 0; mp_startmoney 0; mp_ct_default_secondary ""; mp_t_default_secondary ""',
	'say > SPECIAL KNIFE CONFIG LOADED <',
];
const DEFAULT_RCON_MATCH = [
	'mp_give_player_c4 1; mp_startmoney 800; mp_ct_default_secondary "weapon_hkp2000"; mp_t_default_secondary "weapon_glock"',
	'mp_overtime_enable 1',
	'say > MATCH CONFIG LOADED <',
];
const DEFAULT_RCON_END = ['say > MATCH END RCON LOADED <'];

export const CreatePage: Component = () => {
	const navigate = useNavigate();
	const fetcher = createFetcher();
	const [errorMessage, setErrorMessage] = createSignal('');

	return (
		<Card>
			<CreateUpdateMatch
				mode="CREATE"
				match={{
					teamA: {
						name: 'Team A',
						advantage: 0,
					},
					teamB: {
						name: 'Team B',
						advantage: 0,
					},
					gameServer: null,
					mapPool: DEFAULT_MAPS,
					electionSteps: getSimpleElectionSteps('BO1', DEFAULT_MAPS),
					rconCommands: {
						init: DEFAULT_RCON_INIT,
						knife: DEFAULT_RCON_KNIFE,
						match: DEFAULT_RCON_MATCH,
						end: DEFAULT_RCON_END,
					},
					matchEndAction: 'NONE',
					mode: 'SINGLE',
					tmtLogAddress: undefined, // will be updated int CreateUpdateMatch component
					canClinch: true,
				}}
				callback={async (dto) => {
					const response = await fetcher<IMatch>('POST', '/api/matches', dto);
					if (response?.id) {
						navigate(`/matches/${response.id}?secret=${response.tmtSecret}`);
					} else {
						throw response + '';
					}
				}}
			/>
		</Card>
	);
};
