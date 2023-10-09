import { EventType } from '../../common';
import { colors } from './gameServer';

export const Settings = {
	COMMAND_PREFIXES: ['.', '!'],
	PERIODIC_MESSAGE_FREQUENCY: 30000,
	SAY_PREFIX: colors.green + (process.env['TMT_SAY_PREFIX'] ?? '[TMT] ') + colors.white,
	MATCH_END_ACTION_DELAY: 60000,
	WEBHOOK_EVENTS: [
		'CHAT',
		'KNIFE_END',
		'MAP_ELECTION_END',
		'MAP_END',
		'MAP_START',
		'MATCH_END',
		'ROUND_END',
	] as EventType[],
};
