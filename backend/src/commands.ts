import { IPlayer, TTeamString } from '../../common';
import { colors } from './gameServer';
import { Match } from './match';
import { Settings } from './settings';

const Commands = [
	'BAN',
	'PICK',
	'AGREE',
	'CT',
	'T',
	'READY',
	'UNREADY',
	'PAUSE',
	'HELP',
	'STAY',
	'SWITCH',
	'TEAM',
	'TACTICAL',
	'RESTART',
	'VERSION',
	'*',
] as const;
export type TCommand = (typeof Commands)[number];

// mapping from "ingame chat command" to "command enum"
const commandMapping = new Map<string, TCommand>();
commandMapping.set('ban', 'BAN');
commandMapping.set('pick', 'PICK');
commandMapping.set('agree', 'AGREE');
commandMapping.set('map', 'AGREE');
commandMapping.set('ct', 'CT');
commandMapping.set('t', 'T');
commandMapping.set('ready', 'READY');
commandMapping.set('rdy', 'READY');
commandMapping.set('unpause', 'READY');
commandMapping.set('unready', 'UNREADY');
commandMapping.set('unrdy', 'UNREADY');
commandMapping.set('pause', 'PAUSE');
commandMapping.set('tech', 'PAUSE');
commandMapping.set('help', 'HELP');
commandMapping.set('stay', 'STAY');
commandMapping.set('switch', 'SWITCH');
commandMapping.set('swap', 'SWITCH');
commandMapping.set('team', 'TEAM');
commandMapping.set('tac', 'TACTICAL');
commandMapping.set('restart', 'RESTART');
commandMapping.set('version', 'VERSION');

export const getInternalCommandByUserCommand = (userCommand: string) => {
	return commandMapping.get(userCommand);
};

export const getUserCommandsByInternalCommand = (internalCommand: TCommand) => {
	const userCommands: string[] = [];
	commandMapping.forEach((intC, userC) => {
		if (intC === internalCommand) {
			userCommands.push(userC);
		}
	});
	return userCommands;
};

export type CommandEvent = {
	match: Match;
	player: IPlayer;
	command: TCommand;
	parameters: string[];
	teamString: TTeamString;
};

export type CommandHandler = (e: CommandEvent) => Promise<void>;

const commandHandlers = new Map<TCommand, CommandHandler[]>();

export const registerHandler = (command: TCommand, handler: CommandHandler) => {
	const handlers = commandHandlers.get(command);
	if (!handlers) {
		commandHandlers.set(command, [handler]);
	} else {
		handlers.push(handler);
	}
};

export const onCommand = async (e: CommandEvent) => {
	const handlers = commandHandlers.get(e.command) ?? [];
	await Promise.all(handlers.map((h) => h(e)));
};

export const formatIngameCommand = (command: string, parameters?: string) => {
	return (
		colors.lightOrange +
		Settings.COMMAND_PREFIXES[0] +
		command +
		(parameters ? ' ' + parameters : '') +
		colors.white
	);
};

export const formatFirstIngameCommand = (command: TCommand, parameters?: string) => {
	const firstUserCommand = getUserCommandsByInternalCommand(command)[0];
	if (!firstUserCommand) {
		return '';
	}
	return formatIngameCommand(firstUserCommand, parameters);
};
