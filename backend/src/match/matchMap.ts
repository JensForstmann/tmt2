import { Team, ETeamSides } from './team';
import { ECommand, getCommands } from './commands';
import { Match, COMMAND_PREFIXES } from './match';
import { Player } from './player';
import { readlink } from 'fs';
import { makeStringify } from '../utils';

export enum EMatchMapSate {
	PENDING = 'PENDING',
	MAP_CHANGE = 'MAP_CHANGE',
	WARMUP = 'WARMUP',
	KNIFE = 'KNIFE',
	AFTER_KNIFE = 'AFTER_KNIFE',
	IN_PROGRESS = 'IN_PROGRESS',
	PAUSED = 'PAUSED',
	FINISHED = 'FINISHED',
}

export class MatchMap {
	name: string;
	knife: boolean;
	startAsCtTeam: Team;
	match: Match;
	state: EMatchMapSate = EMatchMapSate.PENDING;
	knifeWinner?: Team;
	readyTeams: Set<Team> = new Set();
	score: Map<Team, number> = new Map();

	constructor(match: Match, name: string, knife: boolean);
	constructor(match: Match, name: string, startAsCtTeam: Team);
	constructor(match: Match, name: string, knifeOrStartAsCt: boolean | Team) {
		this.match = match;
		this.name = name;
		if (typeof knifeOrStartAsCt === 'boolean') {
			this.knife = knifeOrStartAsCt;
			this.startAsCtTeam = this.match.team1;
		} else {
			this.knife = false;
			this.startAsCtTeam = knifeOrStartAsCt;
		}
	}

	toJSON() {
		const obj = makeStringify(this);
		delete obj.match;
		return obj;
	}

	async loadMap() {
		await this.match.say(`MAP WILL BE CHANGED TO ${this.name} IN 10 SECONDS`);
		this.state = EMatchMapSate.MAP_CHANGE;
		await new Promise((resolve) => setTimeout(resolve, 10000));

		if (this.match.team1 === this.startAsCtTeam) {
			this.match.team1.currentSide = ETeamSides.CT;
			this.match.team2.currentSide = ETeamSides.T;
		} else {
			this.match.team1.currentSide = ETeamSides.T;
			this.match.team2.currentSide = ETeamSides.CT;
		}

		await this.match.rcon.send(`mp_teamname_1 "${this.startAsCtTeam.toIngameString()}"`);
		await this.match.rcon.send(
			`mp_teamname_2 "${this.match.getOtherTeam(this.startAsCtTeam).toIngameString()}"`
		);
		await this.match.rcon.send(`changelevel ${this.name}`);
		this.state = EMatchMapSate.WARMUP;
	}

	async startMatch() {
		this.state = EMatchMapSate.IN_PROGRESS;
		this.match.rcon.send('mp_unpause_match');
		this.match.rcon.send('mp_restartgame 10');
		this.match.say('THE MATCH IS LIVE AFTER THE NEXT RESTART!');
		this.match.say('GL & HF EVERYBODY');
		setTimeout(() => {
			this.match.say('MATCH IS LIVE!');
			this.match.say('MATCH IS LIVE!');
			this.match.say('MATCH IS LIVE!');
		}, 10000);
	}

	async onCommand(command: ECommand, team: Team, player: Player) {
		if (this.state === EMatchMapSate.KNIFE) {
			// TODO: offer restart round (new knife round)
		}
		if (this.state === EMatchMapSate.AFTER_KNIFE) {
			if (this.knifeWinner === team) {
				switch (command) {
					case ECommand.STAY:
						this.stay(team);
						break;
					case ECommand.SWITCH:
						this.switch(team);
						break;
					case ECommand.CT:
						this.ct(team);
						break;
					case ECommand.T:
						this.t(team);
						break;
				}
			}
		}
		if (this.state === EMatchMapSate.WARMUP) {
			switch (command) {
				case ECommand.READY:
					this.ready(team);
					break;
				case ECommand.UNREADY:
					this.unready(team);
					break;
			}
		}
		if (this.state === EMatchMapSate.IN_PROGRESS) {
			switch (command) {
				case ECommand.PAUSE:
					this.pause(team);
					break;
			}
		}
		if (this.state === EMatchMapSate.PAUSED) {
			switch (command) {
				case ECommand.READY:
					this.ready(team);
					break;
			}
		}
	}

	onGameOver() {
		if (this.state === EMatchMapSate.IN_PROGRESS || this.state === EMatchMapSate.PAUSED) {
			// TODO
			this.state = EMatchMapSate.FINISHED;
		}
	}

	onRoundOver(ctScore: number, tScore: number, winningTeamSide: ETeamSides) {
		const ctTeam = this.match.getTeamBySide(ETeamSides.CT);
		const tTeam = this.match.getTeamBySide(ETeamSides.T);
		const winningTeam = this.match.getTeamBySide(winningTeamSide);
		this.score.set(ctTeam, ctScore);
		this.score.set(tTeam, tScore);

		if (this.state === EMatchMapSate.KNIFE) {
			this.knifeWinner = winningTeam;
			this.state = EMatchMapSate.AFTER_KNIFE;
			this.match.rcon.send('mp_pause_match');
		} else if (
			this.state === EMatchMapSate.IN_PROGRESS ||
			this.state === EMatchMapSate.PAUSED
		) {
			// state will be set to pause during round
			// TODO call webhook
			if (this.isSideSwitch(ctScore + tScore)) {
				this.match.say('SWITCHING SIDES');
				if (this.match.team1.currentSide === ETeamSides.CT) {
					this.match.team1.currentSide = ETeamSides.T;
					this.match.team2.currentSide = ETeamSides.CT;
				} else {
					this.match.team1.currentSide = ETeamSides.CT;
					this.match.team2.currentSide = ETeamSides.T;
				}
			}
		}
	}

	isSideSwitch(roundsPlayer: number) {
		const maxRounds = 10; // TODO read from rcon
		const otMaxRounds = 10; // TODO read from rcon
		const overtimeNumber = this.getOvertimeNumber(roundsPlayer);
		const otHalftime = maxRounds + (Math.max(1, overtimeNumber) - 0.5) * otMaxRounds;
		return roundsPlayer === maxRounds / 2 || roundsPlayer === Math.floor(otHalftime);
	}

	getOvertimeNumber(roundsPlayer: number) {
		const maxRounds = 10; // TODO read from rcon
		const otMaxRounds = 10; // TODO read from rcon
		const otEnabled = false; // TODO read from rcon
		if (otMaxRounds <= 0 || otEnabled === false) {
			return 0;
		}
		return Math.max(0, Math.ceil((roundsPlayer - maxRounds) / otMaxRounds));
	}

	stay(team: Team) {}

	switch(team: Team) {}

	ct(team: Team) {}

	t(team: Team) {}

	async startKnifeRound() {
		this.state = EMatchMapSate.KNIFE;
		await this.loadConfig();
		await this.match.rcon.send('mp_restartgame 3');
	}

	async loadConfig() {}

	async sayPeriodicMessage() {
		await this.match.rcon.send('mp_warmup_pausetimer 1'); // infinite warmup, TODO: move this to a more suitable location
		await this.match.rcon.send('mp_autokick 0'); // infinite warmup, TODO: move this to a more suitable location

		switch (this.state) {
			case EMatchMapSate.IN_PROGRESS:
				break;
			case EMatchMapSate.AFTER_KNIFE:
			case EMatchMapSate.FINISHED:
			case EMatchMapSate.KNIFE:
			case EMatchMapSate.MAP_CHANGE:
			case EMatchMapSate.PAUSED:
			case EMatchMapSate.PENDING:
			case EMatchMapSate.WARMUP:
				// TODO print only if there are any commands
				this.match.say(
					`COMMANDS: ${this.getAvailableCommands()
						.map((c) => COMMAND_PREFIXES[0] + c)
						.join(', ')}`
				);
				break;
		}
	}

	getAvailableCommands(): string[] {
		switch (this.state) {
			case EMatchMapSate.AFTER_KNIFE:
				return [
					...getCommands(ECommand.RESTART),
					...getCommands(ECommand.CT),
					...getCommands(ECommand.T),
					...getCommands(ECommand.STAY),
					...getCommands(ECommand.SWITCH),
				];
			case EMatchMapSate.FINISHED:
				return [];
			case EMatchMapSate.IN_PROGRESS:
				return getCommands(ECommand.PAUSE);
			case EMatchMapSate.KNIFE:
				return getCommands(ECommand.RESTART);
			case EMatchMapSate.MAP_CHANGE:
				return [];
			case EMatchMapSate.PAUSED:
				return [...getCommands(ECommand.READY), ...getCommands(ECommand.UNREADY)];
			case EMatchMapSate.PENDING:
				return [];
			case EMatchMapSate.WARMUP:
				return [...getCommands(ECommand.READY), ...getCommands(ECommand.UNREADY)];
		}
	}

	async ready(team: Team) {
		this.readyTeams.add(team);
		if (this.readyTeams.size === 2) {
			if (this.state === EMatchMapSate.PAUSED) {
				this.readyTeams.clear();
				await this.match.rcon.send('mp_unpause_match');
				this.state = EMatchMapSate.IN_PROGRESS;
			} else if (this.state === EMatchMapSate.WARMUP) {
				this.match.rcon.send('mp_warmup_end');
				if (this.knife) {
					await this.startKnifeRound();
				} else {
					this.startMatch();
				}
			}
		}
	}

	unready(team: Team) {
		this.readyTeams.delete(team);
	}

	pause(team: Team) {
		this.readyTeams.clear();
		this.state = EMatchMapSate.PAUSED;
		this.match.rcon.send('mp_pause_match');
	}
}
