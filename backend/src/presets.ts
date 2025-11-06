import { generate as shortUuid } from 'short-uuid';
import { IPreset, IPresetCreateDto, IPresetUpdateDto } from '../../common';
import * as Storage from './storage';

const FILE_NAME = 'presets.json';
const DEFAULT_PRESETS: IPreset[] = [
	{
		id: 'rUqWHsdPuA1pCqEfseVpRn',
		name: '5on5 Competitive',
		isPublic: true,
		data: {
			teamA: {
				name: 'Team A',
				advantage: 0,
			},
			teamB: {
				name: 'Team B',
				advantage: 0,
			},
			gameServer: null,
			mapPool: [
				'de_ancient',
				'de_anubis',
				'de_dust2',
				'de_inferno',
				'de_mirage',
				'de_nuke',
				'de_vertigo',
			],
			electionSteps: [
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_A',
					},
				},
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_B',
					},
				},
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_A',
					},
				},
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_B',
					},
				},
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_A',
					},
				},
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_B',
					},
				},
				{
					map: {
						mode: 'RANDOM_PICK',
					},
					side: {
						mode: 'KNIFE',
					},
				},
			],
			rconCommands: {
				init: [
					'game_type 0; game_mode 1; sv_game_mode_flags 0; sv_skirmish_id 0',
					'hostname Match: %TMT_TEAM_A_NAME% - %TMT_TEAM_B_NAME%',
					'say > RCON INIT LOADED <',
				],
				knife: [
					'mp_give_player_c4 0; mp_startmoney 0; mp_ct_default_secondary ""; mp_t_default_secondary ""',
					'say > SPECIAL KNIFE CONFIG LOADED <',
				],
				match: [
					'mp_give_player_c4 1; mp_startmoney 800; mp_ct_default_secondary "weapon_hkp2000"; mp_t_default_secondary "weapon_glock"',
					'mp_overtime_enable 1',
					'say > MATCH CONFIG LOADED <',
					'say > HF & LG - %TMT_MAP_NUMBER%. map: %TMT_MAP_NAME% <',
				],
				end: ['say > MATCH END RCON LOADED <'],
			},
			matchEndAction: 'NONE',
			mode: 'SINGLE',
			canClinch: true,
		},
	},
	{
		id: '5yNVDnvcFHzVRaMnpjLYMv',
		name: '2on2 Wingman',
		isPublic: true,
		data: {
			teamA: {
				name: 'Team A',
				advantage: 0,
			},
			teamB: {
				name: 'Team B',
				advantage: 0,
			},
			gameServer: null,
			mapPool: ['de_inferno', 'de_nuke', 'de_vertigo'],
			electionSteps: [
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_A',
					},
				},
				{
					map: {
						mode: 'BAN',
						who: 'TEAM_B',
					},
				},
				{
					map: {
						mode: 'RANDOM_PICK',
					},
					side: {
						mode: 'KNIFE',
					},
				},
			],
			rconCommands: {
				init: [
					'game_type 0; game_mode 2; sv_game_mode_flags 0; sv_skirmish_id 0',
					'hostname Match: %TMT_TEAM_A_NAME% - %TMT_TEAM_B_NAME%',
					'say > RCON INIT LOADED <',
				],
				knife: [
					'mp_give_player_c4 0; mp_startmoney 0; mp_ct_default_secondary ""; mp_t_default_secondary ""',
					'say > SPECIAL KNIFE CONFIG LOADED <',
				],
				match: [
					'mp_give_player_c4 1; mp_startmoney 800; mp_ct_default_secondary "weapon_hkp2000"; mp_t_default_secondary "weapon_glock"',
					'mp_overtime_enable 1',
					'say > MATCH CONFIG LOADED <',
					'say > HF & LG - %TMT_MAP_NUMBER%. map: %TMT_MAP_NAME% <',
				],
				end: ['say > MATCH END RCON LOADED <'],
			},
			matchEndAction: 'NONE',
			mode: 'SINGLE',
			canClinch: true,
		},
	},
];
const presets = new Map<string, IPreset>();

const write = async () => {
	await Storage.write(FILE_NAME, Array.from(presets.values()));
};

export const setup = async () => {
	const data = await Storage.read(FILE_NAME, DEFAULT_PRESETS);
	data.forEach((preset) => presets.set(preset.id, preset));
};

export const getAll = () => {
	return Array.from(presets.values());
};

export const add = async (dto: IPresetCreateDto) => {
	let id: string;
	do {
		id = shortUuid();
	} while (presets.has(id));
	const preset = {
		id: id,
		name: dto.name,
		data: dto.data,
	};
	presets.set(id, preset);
	await write();
	return preset;
};

export const update = async (dto: IPresetUpdateDto) => {
	const preset = presets.get(dto.id);
	if (!preset) {
		return false;
	}
	presets.set(dto.id, dto);
	await write();
	return true;
};

export const remove = async (id: string) => {
	const removed = presets.delete(id);
	if (removed) {
		await write();
	}
	return removed;
};
