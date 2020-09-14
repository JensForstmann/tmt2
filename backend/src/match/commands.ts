export enum ECommand {
	BAN = 'BAN',
	PICK = 'PICK',
	AGREE = 'AGREE',
	CT = 'CT',
	T = 'T',
	READY = 'READY',
	UNREADY = 'UNREADY',
	PAUSE = 'PAUSE',
	HELP = 'HELP',
	FULL_HELP = 'FULL_HELP',
	STAY = 'STAY',
	SWITCH = 'SWITCH',
	TEAM = 'TEAM',
	RESTART = 'RESTART', // knife
}

export const commandMapping = new Map<string, ECommand>();

commandMapping.set('ban', ECommand.BAN);
commandMapping.set('pick', ECommand.PICK);
commandMapping.set('agree', ECommand.AGREE);
commandMapping.set('map', ECommand.AGREE);
commandMapping.set('ct', ECommand.CT);
commandMapping.set('t', ECommand.T);
commandMapping.set('ready', ECommand.READY);
commandMapping.set('rdy', ECommand.READY);
commandMapping.set('unpause', ECommand.READY);
commandMapping.set('unready', ECommand.UNREADY);
commandMapping.set('unrdy', ECommand.UNREADY);
commandMapping.set('pause', ECommand.PAUSE);
commandMapping.set('help', ECommand.HELP);
commandMapping.set('fullhelp', ECommand.FULL_HELP);
commandMapping.set('stay', ECommand.STAY);
commandMapping.set('switch', ECommand.SWITCH);
commandMapping.set('swap', ECommand.SWITCH);
commandMapping.set('team', ECommand.TEAM);
commandMapping.set('restart', ECommand.RESTART);

export function getCommands(internal: ECommand) {
	const commands: string[] = [];
	commandMapping.forEach((int, command) => {
		if (int === internal) {
			commands.push(command);
		}
	});
	return commands;
}
