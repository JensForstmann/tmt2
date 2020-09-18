import { Team, ETeamSides } from './team';
import { ECommand, getCommands } from './commands';
import { Match, COMMAND_PREFIXES } from './match';
import { Player } from './player';
import { readlink } from 'fs';
import { makeStringify, sleep } from '../utils';

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
	readyTeams = {
		team1: false,
		team2: false,
	};
	score = {
		team1: 0,
		team2: 0,
	};
	overTimeEnabled: boolean = true;
	overTimeMaxRounds: number = 6;
	maxRounds: number = 30;

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
		await sleep(10000);

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
		await this.loadMatchConfig();
		this.match.rcon.send('mp_unpause_match');
		this.match.rcon.send('mp_restartgame 10');
		this.overTimeEnabled = (await this.getConfigVar('mp_overtime_enable')) === '1';
		this.overTimeMaxRounds = parseInt(await this.getConfigVar('mp_overtime_maxrounds'));
		this.maxRounds = parseInt(await this.getConfigVar('mp_maxrounds'));
		this.match.say('THE MAP IS LIVE AFTER THE NEXT RESTART!');
		this.match.say('GL & HF EVERYBODY');
		sleep(11000).then(() => {
			this.match.say('MAP IS LIVE!');
			this.match.say('MAP IS LIVE!');
			this.match.say('MAP IS LIVE!');
		});
	}

	async getConfigVar(configVar: string): Promise<string> {
		const response = await this.match.rcon.send(configVar);
		const configVarPattern = new RegExp(`^"${configVar}" = "(.*?)"`);
		const configVarMatch = response.match(configVarPattern);
		if (configVarMatch) {
			return configVarMatch[1];
		}
		return '';
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
					case ECommand.RESTART:
						// this.restartKnife(team);
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

	onMapEnd() {
		if (this.state === EMatchMapSate.IN_PROGRESS || this.state === EMatchMapSate.PAUSED) {
			// TODO call webhook
			this.state = EMatchMapSate.FINISHED;
			this.match.say('MAP FINISHED');
		}
	}

	isFinished() {
		return this.state === EMatchMapSate.FINISHED;
	}

	isDraw() {
		return this.score.team1 === this.score.team2;
	}

	getWinner() {
		return this.score.team1 > this.score.team2 ? this.match.team1 : this.match.team2;
	}

	getLoser() {}

	getMapResult() {
		return;
	}

	onRoundEnd(ctScore: number, tScore: number, winningTeamSide: ETeamSides) {
		if (this.state !== EMatchMapSate.FINISHED) {
			const ctTeam = this.match.getTeamBySide(ETeamSides.CT);
			const tTeam = this.match.getTeamBySide(ETeamSides.T);
			const winningTeam = this.match.getTeamBySide(winningTeamSide);
			const losingTeam = this.match.getOtherTeam(winningTeam);
			this.score.team1 = ctTeam.isTeam1 ? ctScore : tScore;
			this.score.team2 = ctTeam.isTeam2 ? ctScore : tScore;

			if (this.state === EMatchMapSate.KNIFE) {
				this.knifeWinner = winningTeam;
				this.state = EMatchMapSate.AFTER_KNIFE;
				this.match.rcon.send('mp_pause_match');
				this.match.say(`${winningTeam.toIngameString()} WON THE KNIFE`);
				this.match.sayPeriodicMessage();
			} else if (
				this.state === EMatchMapSate.IN_PROGRESS ||
				this.state === EMatchMapSate.PAUSED
			) {
				// state will be set to pause during round
				// TODO call webhook
				this.match.say(
					`${winningTeam.toIngameString()} SCORED (${
						winningTeam.isTeam1 ? this.score.team1 : this.score.team2
					})`
				);
				this.match.say(
					`${losingTeam.toIngameString()} (${
						losingTeam.isTeam1 ? this.score.team1 : this.score.team2
					})`
				);
				if (this.isSideSwitch(ctScore + tScore)) {
					this.match.say('SWITCHING SIDES');
					this.switchTeamInternals();
				}
			}
		}
	}

	switchTeamInternals() {
		if (this.match.team1.currentSide === ETeamSides.CT) {
			this.match.team1.currentSide = ETeamSides.T;
			this.match.team2.currentSide = ETeamSides.CT;
		} else {
			this.match.team1.currentSide = ETeamSides.CT;
			this.match.team2.currentSide = ETeamSides.T;
		}
	}

	isSideSwitch(roundsPlayer: number) {
		const overtimeNumber = this.getOvertimeNumber(roundsPlayer);
		const otHalftime =
			this.maxRounds + (Math.max(1, overtimeNumber) - 0.5) * this.overTimeMaxRounds;
		return roundsPlayer === this.maxRounds / 2 || roundsPlayer === Math.floor(otHalftime);
	}

	getOvertimeNumber(roundsPlayed: number) {
		if (this.overTimeMaxRounds <= 0 || this.overTimeEnabled === false) {
			return 0;
		}
		return Math.max(0, Math.ceil((roundsPlayed - this.maxRounds) / this.overTimeMaxRounds));
	}

	stay(team: Team) {
		this.match.say(`${team.toIngameString()} WANTS TO STAY`);
		this.startMatch();
	}

	switch(team: Team) {
		this.match.say(`${team.toIngameString()} WANTS TO SWITCH SIDES`);
		this.match.rcon.send('mp_swapteams');
		this.switchTeamInternals();
		this.startMatch();
	}

	ct(team: Team) {
		if (team.currentSide !== ETeamSides.CT) {
			this.switch(team);
		} else {
			this.stay(team);
		}
	}

	t(team: Team) {
		if (team.currentSide !== ETeamSides.T) {
			this.switch(team);
		} else {
			this.stay(team);
		}
	}

	async startKnifeRound() {
		this.state = EMatchMapSate.KNIFE;
		await this.loadKnifeConfig();
		await this.match.rcon.send('mp_restartgame 3');
		await sleep(4000);
		this.match.say('KNIFE FOR SIDE');
		this.match.say('KNIFE FOR SIDE');
		this.match.say('KNIFE FOR SIDE');
	}

	async loadKnifeConfig() {
		await this.match.executeRconCommands(this.match.matchInitData.rcon?.knife);
	}

	async loadMatchConfig() {
		await this.match.executeRconCommands(this.match.matchInitData.rcon?.match);
	}

	async sayPeriodicMessage() {
		await this.match.rcon.send('mp_warmup_pausetimer 1'); // infinite warmup, TODO: move this to a more suitable location
		await this.match.rcon.send('mp_autokick 0'); // never kick, TODO: move this to a more suitable location

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
				const commands = this.getAvailableCommands();
				if (commands.length > 0) {
					this.match.say(
						`COMMANDS: ${commands.map((c) => COMMAND_PREFIXES[0] + c).join(', ')}`
					);
				}
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
		if (team.isTeam1) {
			this.readyTeams.team1 = true;
		} else {
			this.readyTeams.team2 = true;
		}
		this.match.say(`${team.toIngameString()} IS READY`);
		if (this.readyTeams.team1 && this.readyTeams.team2) {
			if (this.state === EMatchMapSate.PAUSED) {
				this.readyTeams.team1 = false;
				this.readyTeams.team2 = false;
				await this.match.rcon.send('mp_unpause_match');
				this.match.say('CONTINUE MAP');
				this.state = EMatchMapSate.IN_PROGRESS;
			} else if (this.state === EMatchMapSate.WARMUP) {
				this.match.rcon.send('mp_warmup_end');
				if (this.knife) {
					await this.startKnifeRound();
				} else {
					await this.startMatch();
				}
			}
		}
	}

	unready(team: Team) {
		this.match.say(`${team.toIngameString()} IS NOT READY`);
		if (team.isTeam1) {
			this.readyTeams.team1 = false;
		} else {
			this.readyTeams.team2 = false;
		}
	}

	pause(team: Team) {
		this.match.say(`${team.toIngameString()} PAUSED THE MAP`);
		this.readyTeams.team1 = false;
		this.readyTeams.team2 = false;
		this.state = EMatchMapSate.PAUSED;
		this.match.rcon.send('mp_pause_match');
	}
}
