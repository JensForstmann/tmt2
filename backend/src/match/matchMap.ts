import { Team } from './team';
import { ECommand, getCommands } from './commands';
import { Match, COMMAND_PREFIXES } from './match';
import { Player } from './player';
import { makeStringify, sleep } from '../utils';
import { ETeamSides } from '../interfaces/team';
import { EMatchMapSate, IMatchMapChange, ISerializedMatchMap } from '../interfaces/matchMap';

export class MatchMap {
	name: string;
	knifeForSide: boolean;
	startAsCtTeam: Team;
	startAsTTeam: Team;
	match: Match;
	state: EMatchMapSate = EMatchMapSate.PENDING;
	knifeWinner?: Team;
	readyTeams = {
		teamA: false,
		teamB: false,
	};
	knifeRestart = {
		teamA: false,
		teamB: false,
	};
	score = {
		teamA: 0,
		teamB: 0,
	};
	overTimeEnabled: boolean = true;
	overTimeMaxRounds: number = 6;
	maxRounds: number = 30;

	constructor(match: Match, name: string, knifeForSide: boolean);
	constructor(match: Match, name: string, startAsCtTeam: Team);
	constructor(match: Match, name: string, serializedMatchMap: ISerializedMatchMap);
	constructor(
		match: Match,
		name: string,
		knifeOrStartAsCtOrSerializedMatchMap: boolean | Team | ISerializedMatchMap
	) {
		this.match = match;
		this.name = name;
		if (typeof knifeOrStartAsCtOrSerializedMatchMap === 'boolean') {
			this.knifeForSide = knifeOrStartAsCtOrSerializedMatchMap;
			this.startAsCtTeam = this.match.teamA;
		} else if (knifeOrStartAsCtOrSerializedMatchMap instanceof Team) {
			this.knifeForSide = false;
			this.startAsCtTeam = knifeOrStartAsCtOrSerializedMatchMap;
		} else {
			this.knifeForSide = knifeOrStartAsCtOrSerializedMatchMap.knifeForSide;
			this.startAsCtTeam =
				this.match.teamA.id === knifeOrStartAsCtOrSerializedMatchMap.startAsCtTeam
					? this.match.teamA
					: this.match.teamB;
			this.state = knifeOrStartAsCtOrSerializedMatchMap.state;
			if (knifeOrStartAsCtOrSerializedMatchMap.knifeWinner) {
				this.knifeWinner =
					this.match.teamA.id === knifeOrStartAsCtOrSerializedMatchMap.knifeWinner
						? this.match.teamA
						: this.match.teamB;
			}
			this.readyTeams = knifeOrStartAsCtOrSerializedMatchMap.readyTeams;
			this.knifeRestart = knifeOrStartAsCtOrSerializedMatchMap.knifeRestart;
			this.score = knifeOrStartAsCtOrSerializedMatchMap.score;
			this.overTimeEnabled = knifeOrStartAsCtOrSerializedMatchMap.overTimeEnabled;
			this.overTimeMaxRounds = knifeOrStartAsCtOrSerializedMatchMap.overTimeMaxRounds;
			this.maxRounds = knifeOrStartAsCtOrSerializedMatchMap.maxRounds;
		}
		this.startAsTTeam = this.match.getOtherTeam(this.startAsCtTeam);
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

		if (this.match.teamA === this.startAsCtTeam) {
			this.match.teamA.currentSide = ETeamSides.CT;
			this.match.teamB.currentSide = ETeamSides.T;
		} else {
			this.match.teamA.currentSide = ETeamSides.T;
			this.match.teamB.currentSide = ETeamSides.CT;
		}

		await this.setTeamNames();
		await this.match.gameServer.rcon(`changelevel ${this.name}`);
		this.state = EMatchMapSate.WARMUP;

		this.readyTeams.teamA = false;
		this.readyTeams.teamB = false;
		this.knifeRestart.teamA = false;
		this.knifeRestart.teamB = false;
		this.score.teamA = 0;
		this.score.teamB = 0;

		this.knifeWinner = undefined;
	}

	async setTeamNames() {
		await this.match.gameServer.rcon(`mp_teamname_1 "${this.startAsCtTeam.toIngameString()}"`);
		await this.match.gameServer.rcon(`mp_teamname_2 "${this.startAsTTeam.toIngameString()}"`);
	}

	async startMatch() {
		this.state = EMatchMapSate.IN_PROGRESS;
		await this.loadMatchConfig();
		this.match.gameServer.rcon('mp_unpause_match');
		this.match.gameServer.rcon('mp_restartgame 10');
		await this.refreshOvertimeAndMaxRoundsSettings();
		this.match.say('THE MAP IS LIVE AFTER THE NEXT RESTART!');
		this.match.say('GL & HF EVERYBODY');
		sleep(11000).then(() => {
			this.match.say('MAP IS LIVE!');
			this.match.say('MAP IS LIVE!');
			this.match.say('MAP IS LIVE!');
		});
	}

	async refreshOvertimeAndMaxRoundsSettings() {
		this.overTimeEnabled = (await this.getConfigVar('mp_overtime_enable')) === '1';
		this.overTimeMaxRounds = parseInt(await this.getConfigVar('mp_overtime_maxrounds'));
		this.maxRounds = parseInt(await this.getConfigVar('mp_maxrounds'));
	}

	async getConfigVar(configVar: string): Promise<string> {
		const response = await this.match.gameServer.rcon(configVar);
		const configVarPattern = new RegExp(`^"${configVar}" = "(.*?)"`);
		const configVarMatch = response.match(configVarPattern);
		if (configVarMatch) {
			return configVarMatch[1];
		}
		return '';
	}

	async onCommand(command: ECommand, team: Team, player: Player) {
		if (this.state === EMatchMapSate.KNIFE && command === ECommand.RESTART) {
			this.restartKnifeCommand(team);
		}
		if (this.state === EMatchMapSate.AFTER_KNIFE) {
			if (this.knifeWinner === team) {
				switch (command) {
					case ECommand.STAY:
						this.stayCommand(team);
						break;
					case ECommand.SWITCH:
						this.switchCommand(team);
						break;
					case ECommand.CT:
						this.ctCommand(team);
						break;
					case ECommand.T:
						this.tCommand(team);
						break;
					case ECommand.RESTART:
						this.restartKnifeCommand(team);
						break;
				}
			}
		}
		if (this.state === EMatchMapSate.WARMUP) {
			switch (command) {
				case ECommand.READY:
					this.readyCommand(team);
					break;
				case ECommand.UNREADY:
					this.unreadyCommand(team);
					break;
			}
		}
		if (this.state === EMatchMapSate.IN_PROGRESS) {
			switch (command) {
				case ECommand.PAUSE:
					this.pauseCommand(team);
					break;
			}
		}
		if (this.state === EMatchMapSate.PAUSED) {
			switch (command) {
				case ECommand.READY:
					this.readyCommand(team);
					break;
			}
		}
	}

	restartKnifeCommand(team: Team) {
		if (team.isTeamA) {
			this.knifeRestart.teamA = true;
		} else {
			this.knifeRestart.teamB = true;
		}

		if (this.knifeRestart.teamA && this.knifeRestart.teamB) {
			this.knifeRestart.teamA = false;
			this.knifeRestart.teamB = false;
			this.startKnifeRound();
		} else {
			this.match.say(`${team.toIngameString()} WANTS TO RESTART THE KNIFE ROUND`);
			this.match.say(`AGREE WITH ${getCommands(ECommand.RESTART)}`);
		}
	}

	stayCommand(team: Team) {
		this.match.say(`${team.toIngameString()} WANTS TO STAY`);
		this.startMatch();
	}

	switchCommand(team: Team) {
		this.match.say(`${team.toIngameString()} WANTS TO SWITCH SIDES`);
		this.match.gameServer.rcon('mp_swapteams');
		this.switchTeamInternals();
		this.startMatch();
	}

	ctCommand(team: Team) {
		if (team.currentSide !== ETeamSides.CT) {
			this.switchCommand(team);
		} else {
			this.stayCommand(team);
		}
	}

	tCommand(team: Team) {
		if (team.currentSide !== ETeamSides.T) {
			this.switchCommand(team);
		} else {
			this.stayCommand(team);
		}
	}

	async readyCommand(team: Team) {
		if (team.isTeamA) {
			this.readyTeams.teamA = true;
		} else {
			this.readyTeams.teamB = true;
		}
		this.match.say(`${team.toIngameString()} IS READY`);
		if (this.readyTeams.teamA && this.readyTeams.teamB) {
			if (this.state === EMatchMapSate.PAUSED) {
				this.readyTeams.teamA = false;
				this.readyTeams.teamB = false;
				await this.match.gameServer.rcon('mp_unpause_match');
				this.match.say('CONTINUE MAP');
				this.state = EMatchMapSate.IN_PROGRESS;
			} else if (this.state === EMatchMapSate.WARMUP) {
				this.match.gameServer.rcon('mp_warmup_end');
				if (this.knifeForSide) {
					await this.startKnifeRound();
				} else {
					await this.startMatch();
				}
			}
		}
	}

	unreadyCommand(team: Team) {
		this.match.say(`${team.toIngameString()} IS NOT READY`);
		if (team.isTeamA) {
			this.readyTeams.teamA = false;
		} else {
			this.readyTeams.teamB = false;
		}
	}

	pauseCommand(team: Team) {
		this.match.say(`${team.toIngameString()} PAUSED THE MAP`);
		this.readyTeams.teamA = false;
		this.readyTeams.teamB = false;
		this.state = EMatchMapSate.PAUSED;
		this.match.gameServer.rcon('mp_pause_match');
	}

	onMapEnd() {
		if (this.state === EMatchMapSate.IN_PROGRESS || this.state === EMatchMapSate.PAUSED) {
			this.state = EMatchMapSate.FINISHED;
			this.match.say('MAP FINISHED');
		}
	}

	isFinished() {
		return this.state === EMatchMapSate.FINISHED;
	}

	isDraw() {
		return this.score.teamA === this.score.teamB;
	}

	getWinner() {
		return this.score.teamA > this.score.teamB ? this.match.teamA : this.match.teamB;
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
			this.score.teamA = ctTeam.isTeamA ? ctScore : tScore;
			this.score.teamB = ctTeam.isTeamB ? ctScore : tScore;

			if (this.state === EMatchMapSate.KNIFE) {
				this.knifeWinner = winningTeam;
				this.state = EMatchMapSate.AFTER_KNIFE;
				this.match.gameServer.rcon('mp_pause_match');
				this.match.say(`${winningTeam.toIngameString()} WON THE KNIFE`);
				this.match.sayPeriodicMessage();
			} else if (
				this.state === EMatchMapSate.IN_PROGRESS ||
				this.state === EMatchMapSate.PAUSED // state could be set to pause during round
			) {
				this.match.say(
					`${winningTeam.toIngameString()} SCORED (${
						winningTeam.isTeamA ? this.score.teamA : this.score.teamB
					})`
				);
				this.match.say(
					`${losingTeam.toIngameString()} (${
						losingTeam.isTeamA ? this.score.teamA : this.score.teamB
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
		if (this.match.teamA.currentSide === ETeamSides.CT) {
			this.match.teamA.currentSide = ETeamSides.T;
			this.match.teamB.currentSide = ETeamSides.CT;
		} else {
			this.match.teamA.currentSide = ETeamSides.CT;
			this.match.teamB.currentSide = ETeamSides.T;
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

	async startKnifeRound() {
		this.state = EMatchMapSate.KNIFE;
		await this.loadKnifeConfig();
		await this.match.gameServer.rcon('mp_restartgame 3');
		await sleep(4000);
		this.match.say('KNIFE FOR SIDE');
		this.match.say('KNIFE FOR SIDE');
		this.match.say('KNIFE FOR SIDE');
	}

	async loadKnifeConfig() {
		await this.match.executeRconCommands(this.match.matchInitData.rconCommands?.knife);
	}

	async loadMatchConfig() {
		await this.match.executeRconCommands(this.match.matchInitData.rconCommands?.match);
	}

	async sayPeriodicMessage() {
		if (this.state === EMatchMapSate.WARMUP) {
			// TODO: move this to a more suitable location
			await this.match.gameServer.rcon('mp_warmup_pausetimer 1'); // infinite warmup
			await this.match.gameServer.rcon('mp_autokick 0'); // never kick
		}

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

	change(change: IMatchMapChange) {
		if (change.name && change.name !== this.name) {
			this.name = change.name;
			if (this.match.getCurrentMatchMap() === this) {
				this.loadMap();
			}
		}

		if (typeof change.knifeForSide === 'boolean') {
			this.knifeForSide = change.knifeForSide;
		}

		if (change.startAsCtTeam) {
			if (change.startAsCtTeam === 'teamA') {
				this.startAsCtTeam = this.match.teamA;
				this.startAsTTeam = this.match.teamB;
			} else {
				this.startAsCtTeam = this.match.teamB;
				this.startAsTTeam = this.match.teamA;
			}
		}

		if (change.state && change.state !== this.state) {
			this.state = change.state; // TODO what else to do?
		}

		if (change.knifeWinner) {
			if (change.knifeWinner === 'teamA') {
				this.knifeWinner = this.match.teamA;
			} else {
				this.knifeWinner = this.match.teamB;
			}
		}

		if (change.score) {
			if (change.score.teamA) {
				this.score.teamA = change.score.teamA;
			}
			if (change.score.teamB) {
				this.score.teamB = change.score.teamB;
			}
		}

		if (change.refreshOvertimeAndMaxRoundsSettings) {
			this.refreshOvertimeAndMaxRoundsSettings();
		}
	}
}
