import { IPlayer, TTeamString } from '../../common';
import { Match } from './match';

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
	'RESTART',
	'*',
] as const;
export type TCommand = typeof Commands[number];

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
commandMapping.set('help', 'HELP');
commandMapping.set('stay', 'STAY');
commandMapping.set('switch', 'SWITCH');
commandMapping.set('swap', 'SWITCH');
commandMapping.set('team', 'TEAM');
commandMapping.set('restart', 'RESTART');

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
