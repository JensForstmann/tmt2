import { Match, COMMAND_PREFIXES } from './match';
import { Team } from './team';
import { getCommands, ECommand } from './commands';
import { MatchMap } from './matchMap';
import { makeStringify } from '../utils';

export enum EWho {
	TEAM_1 = 'TEAM_1',
	TEAM_2 = 'TEAM_2',
	TEAM_X = 'TEAM_X',
	TEAM_Y = 'TEAM_Y',
}

export enum ESideFixed {
	TEAM_1_CT = 'TEAM_1_CT',
	TEAM_1_T = 'TEAM_1_T',
	TEAM_2_CT = 'TEAM_2_CT',
	TEAM_2_T = 'TEAM_2_T',
	TEAM_X_CT = 'TEAM_X_CT',
	TEAM_X_T = 'TEAM_X_T',
	TEAM_Y_CT = 'TEAM_Y_CT',
	TEAM_Y_T = 'TEAM_Y_T',
}

export enum EMapMode {
	FIXED = 'FIXED',
	BAN = 'BAN',
	PICK = 'PICK',
	RANDOM_BAN = 'RANDOM_BAN',
	RANDOM_PICK = 'RANDOM_PICK',
	AGREE = 'AGREE',
}

export interface IFixedMap {
	mode: EMapMode.FIXED;
	fixed: string;
}

export interface IBanOrPickMap {
	mode: EMapMode.BAN | EMapMode.PICK;
	who: EWho;
}

export interface IAgreeOrRandomMap {
	mode: EMapMode.RANDOM_BAN | EMapMode.RANDOM_PICK | EMapMode.AGREE;
}

export enum ESideMode {
	FIXED = 'FIXED',
	PICK = 'PICK',
	RANDOM = 'RANDOM',
	KNIFE = 'KNIFE',
}

export interface IFixedSide {
	mode: ESideMode.FIXED;
	fixed: ESideFixed;
}

export interface IPickSide {
	mode: ESideMode.PICK;
	who: EWho;
}

export interface IRandomOrKnifeSide {
	mode: ESideMode.RANDOM | ESideMode.KNIFE;
}

export interface IElectionStep {
	map: IFixedMap | IBanOrPickMap | IAgreeOrRandomMap;
	side: IFixedSide | IPickSide | IRandomOrKnifeSide;
}

export enum ElectionState {
	NOT_STARTED = 'NOT_STARTED',
	IN_PROGRESS = 'IN_PROGRESS',
	FINISHED = 'FINISHED',
}

export enum EStep {
	MAP = 'MAP',
	SIDE = 'SIDE',
}

export class Election {
	match: Match;
	state: ElectionState = ElectionState.NOT_STARTED;
	currentStep: number = 0;
	currentElectionStep: IElectionStep;
	currentSubStep: EStep = EStep.MAP;
	teamX?: Team;
	teamY?: Team;
	remainingMaps: string[];
	map: string = '';
	maps: MatchMap[] = [];
	currentAgree: {
		teamA: string | null;
		teamB: string | null;
	} = {
		teamA: null,
		teamB: null,
	};
	currentRestart = {
		teamA: false,
		teamB: false,
	};

	constructor(match: Match) {
		this.match = match;
		this.currentElectionStep = this.match.matchInitData.electionSteps[0];
		this.remainingMaps = [...this.match.matchInitData.mapPool].map((map) => map.toLowerCase());
	}

	toJSON() {
		const obj = makeStringify(this);
		delete obj.match;
		return obj;
	}

	sayAvailableMaps() {
		this.match.say(`AVAILABLE MAPS: ${this.remainingMaps.join(', ')}`);
	}

	banCommand(team: Team, map: string) {
		map = map.toLowerCase();
		if (
			this.currentSubStep === EStep.MAP &&
			this.currentElectionStep.map.mode === EMapMode.BAN &&
			this.isValidTeam(this.currentElectionStep.map.who, team)
		) {
			const matchMap = this.remainingMaps.findIndex((mapName) => mapName === map);
			if (matchMap > -1) {
				this.ensureTeamXY(this.currentElectionStep.map.who, team);
				this.state = ElectionState.IN_PROGRESS;
				this.match.say(`MAP ${this.remainingMaps[matchMap]} BANNED`);
				this.remainingMaps.splice(matchMap, 1);
				this.next();
			} else {
				this.match.say(`INVALID MAP: ${map}`);
				this.sayAvailableMaps();
			}
		}
	}

	pickCommand(team: Team, map: string) {
		map = map.toLowerCase();
		if (
			this.currentSubStep === EStep.MAP &&
			this.currentElectionStep.map.mode === EMapMode.PICK &&
			this.isValidTeam(this.currentElectionStep.map.who, team)
		) {
			const matchMap = this.remainingMaps.findIndex((mapName) => mapName === map);
			if (matchMap > -1) {
				this.ensureTeamXY(this.currentElectionStep.map.who, team);
				this.state = ElectionState.IN_PROGRESS;
				this.map = this.remainingMaps[matchMap];
				this.remainingMaps.splice(matchMap, 1);
				this.match.say(`${this.currentStep + 1}. MAP: ${this.map}`);
				this.next();
			} else {
				this.match.say(`INVALID MAP: ${map}`);
				this.sayAvailableMaps();
			}
		}
	}

	tCommand(team: Team) {
		if (
			this.currentSubStep === 'SIDE' &&
			this.currentElectionStep.side.mode === ESideMode.PICK &&
			this.isValidTeam(this.currentElectionStep.side.who, team)
		) {
			this.ensureTeamXY(this.currentElectionStep.side.who, team);
			this.state = ElectionState.IN_PROGRESS;
			this.maps.push(new MatchMap(this.match, this.map, this.match.getOtherTeam(team)));
			this.match.say(
				`${this.currentStep + 1}. MAP: ${this.map} (T-SIDE: ${team.toIngameString()})`
			);
			this.next();
		}
	}

	ctCommand(team: Team) {
		if (
			this.currentSubStep === 'SIDE' &&
			this.currentElectionStep.side.mode === ESideMode.PICK &&
			this.isValidTeam(this.currentElectionStep.side.who, team)
		) {
			this.ensureTeamXY(this.currentElectionStep.side.who, team);
			this.state = ElectionState.IN_PROGRESS;
			this.maps.push(new MatchMap(this.match, this.map, team));
			this.match.say(
				`${this.currentStep + 1}. MAP: ${this.map} (CT-SIDE: ${team.toIngameString()})`
			);
			this.next();
		}
	}

	agreeCommand(team: Team, map: string) {
		map = map.toLowerCase();
		if (
			this.currentSubStep === EStep.MAP &&
			this.currentElectionStep.map.mode === EMapMode.AGREE
		) {
			const matchMap = this.remainingMaps.findIndex((mapName) => mapName === map);
			if (matchMap > -1) {
				this.state = ElectionState.IN_PROGRESS;
				if (team.isTeamA) {
					this.currentAgree.teamA = map;
				} else {
					this.currentAgree.teamB = map;
				}
				if (
					this.currentAgree.teamA !== null &&
					this.currentAgree.teamB !== null &&
					this.currentAgree.teamA === this.currentAgree.teamB
				) {
					this.map = this.remainingMaps[matchMap];
					this.currentAgree.teamA = null;
					this.currentAgree.teamB = null;
					this.remainingMaps.splice(matchMap, 1);
					this.next();
				} else {
					this.match.say(`MAP ${this.map} SUGGESTED BY ${team.toIngameString()}`);
					this.match.say(
						`AGREE WITH ${COMMAND_PREFIXES[0]}${getCommands(
							ECommand.AGREE
						)[0].toLowerCase()}`
					);
				}
			} else {
				this.match.say(`INVALID MAP: ${map}`);
				this.sayAvailableMaps();
			}
		}
	}

	restartCommand(team: Team) {
		if (team.isTeamA) {
			this.currentRestart.teamA = true;
		} else {
			this.currentRestart.teamB = true;
		}

		if (this.currentRestart.teamA && this.currentRestart.teamB) {
			this.restart();
		} else {
			this.match.say(`${team.toIngameString()} WANTS TO RESTART THE COMPLETE PROCESS`);
			this.match.say(
				`TYPE ${COMMAND_PREFIXES[0]}${getCommands(
					ECommand.RESTART
				)[0].toLowerCase()} TO CONFIRM AND RESTART`
			);
		}
	}

	resetCurrentRestart() {
		this.currentRestart.teamA = false;
		this.currentRestart.teamB = false;
	}

	restart() {
		this.state = ElectionState.NOT_STARTED;
		this.currentStep = 0;
		this.currentElectionStep = this.match.matchInitData.electionSteps[0];
		this.currentSubStep = EStep.MAP;
		this.teamX = undefined;
		this.teamY = undefined;
		this.remainingMaps = [...this.match.matchInitData.mapPool].map((map) => map.toLowerCase());
		this.map = '';
		this.maps = [];
		this.currentAgree.teamA = null;
		this.currentAgree.teamB = null;
		this.resetCurrentRestart();
	}

	next() {
		this.resetCurrentRestart();

		if (
			this.currentSubStep === EStep.MAP &&
			(this.currentElectionStep.map.mode === EMapMode.AGREE ||
				this.currentElectionStep.map.mode === EMapMode.FIXED ||
				this.currentElectionStep.map.mode === EMapMode.PICK ||
				this.currentElectionStep.map.mode === EMapMode.RANDOM_PICK)
		) {
			this.currentSubStep = EStep.SIDE;
		} else {
			this.currentSubStep = EStep.MAP;
			this.currentStep++;
			this.currentElectionStep = this.match.matchInitData.electionSteps[this.currentStep];
			if (!this.currentElectionStep) {
				this.state = ElectionState.FINISHED;
				this.match.onElectionFinished();
				return; // prevent this.auto()
			}
		}

		this.auto();
	}

	auto() {
		if (this.currentSubStep === EStep.MAP) {
			this.autoMap();
		}
		if (this.currentSubStep === 'SIDE') {
			this.autoSide();
		}
	}

	autoMap() {
		if (this.currentElectionStep.map.mode === EMapMode.FIXED) {
			this.map = this.currentElectionStep.map.fixed;
			this.match.say(`${this.currentStep + 1}. MAP: ${this.map}`);
			this.next();
			return;
		}
		if (
			this.currentElectionStep.map.mode === 'RANDOM_BAN' ||
			this.currentElectionStep.map.mode === EMapMode.RANDOM_PICK
		) {
			const matchMap = Math.min(
				Math.floor(Math.random() * this.remainingMaps.length),
				this.remainingMaps.length
			);
			if (this.currentElectionStep.map.mode === EMapMode.RANDOM_PICK) {
				this.match.say(`RANDOM ${this.currentStep + 1}. MAP: ${this.map}`);
				this.map = this.remainingMaps[matchMap];
			} else {
				this.match.say(`MAP ${this.remainingMaps[matchMap]} BANNED`);
			}
			this.remainingMaps.splice(matchMap, 1);
			this.next();
			return;
		}
	}

	autoSide() {
		if (this.currentElectionStep.side.mode === ESideMode.FIXED) {
			if (
				[ESideFixed.TEAM_1_CT, ESideFixed.TEAM_2_T].includes(
					this.currentElectionStep.side.fixed
				)
			) {
				this.maps.push(new MatchMap(this.match, this.map, this.match.teamA));
				this.match.say(
					`${this.currentStep + 1}. MAP: ${
						this.map
					} (CT-SIDE: ${this.match.teamA.toIngameString()})`
				);
				this.next();
				return;
			}

			if (
				[ESideFixed.TEAM_1_T, ESideFixed.TEAM_2_CT].includes(
					this.currentElectionStep.side.fixed
				)
			) {
				this.maps.push(new MatchMap(this.match, this.map, this.match.teamB));
				this.match.say(
					`${this.currentStep + 1}. MAP: ${
						this.map
					} (CT-SIDE: ${this.match.teamB.toIngameString()})`
				);
				this.next();
				return;
			}

			if (this.teamX && this.teamY) {
				if (
					[ESideFixed.TEAM_X_CT, ESideFixed.TEAM_Y_T].includes(
						this.currentElectionStep.side.fixed
					)
				) {
					this.maps.push(new MatchMap(this.match, this.map, this.teamX));
					this.match.say(
						`${this.currentStep + 1}. MAP: ${
							this.map
						} (CT-SIDE: ${this.teamX.toIngameString()})`
					);
					this.next();
					return;
				}

				if (
					[ESideFixed.TEAM_X_T, ESideFixed.TEAM_Y_CT].includes(
						this.currentElectionStep.side.fixed
					)
				) {
					this.maps.push(new MatchMap(this.match, this.map, this.teamY));
					this.match.say(
						`${this.currentStep + 1}. MAP: ${
							this.map
						} (CT-SIDE: ${this.teamY.toIngameString()})`
					);
					this.next();
					return;
				}
			}
		}
		if (this.currentElectionStep.side.mode === 'KNIFE') {
			this.maps.push(new MatchMap(this.match, this.map, true));
			this.match.say(`${this.currentStep + 1}. MAP: ${this.map} (KNIFE FOR SIDE)`);
			this.next();
			return;
		}
		if (this.currentElectionStep.side.mode === 'RANDOM') {
			const startAsCtTeam = Math.random() < 0.5 ? this.match.teamA : this.match.teamB;
			this.maps.push(new MatchMap(this.match, this.map, startAsCtTeam));
			this.match.say(
				`${this.currentStep + 1}. MAP: ${
					this.map
				} (RANDOM CT-SIDE: ${startAsCtTeam.toIngameString()})`
			);
			this.next();
			return;
		}
	}

	getAvailableCommands(): string[] {
		if (this.state === ElectionState.FINISHED) {
			return [];
		}
		if (this.currentSubStep === EStep.MAP) {
			switch (this.currentElectionStep.map.mode) {
				case EMapMode.AGREE:
					return [
						...getCommands(ECommand.AGREE),
						...getCommands(ECommand.PICK),
						...getCommands(ECommand.RESTART),
					];
				case EMapMode.BAN:
					return [...getCommands(ECommand.BAN), ...getCommands(ECommand.RESTART)];
				case EMapMode.PICK:
					return [...getCommands(ECommand.PICK), ...getCommands(ECommand.RESTART)];
			}
		}
		if (this.currentSubStep === 'SIDE') {
			switch (this.currentElectionStep.side.mode) {
				case ESideMode.PICK:
					return [
						...getCommands(ECommand.T),
						...getCommands(ECommand.CT),
						...getCommands(ECommand.RESTART),
					];
			}
		}
		return [];
	}

	isValidTeam(who: EWho, team: Team) {
		if (who === EWho.TEAM_1 && team.isTeamA) return true;
		if (who === EWho.TEAM_2 && !team.isTeamA) return true;
		if (!this.teamX && !this.teamY) return true;
		if (who === EWho.TEAM_X && this.teamX === team) return true;
		if (who === EWho.TEAM_Y && this.teamY === team) return true;

		return false;
	}

	sayPeriodicMessage() {
		if (this.state === ElectionState.IN_PROGRESS || this.state === ElectionState.NOT_STARTED) {
			this.match.say(`CURRENTLY IN ELECTION MODE`);
			this.match.say(
				`COMMANDS: ${this.getAvailableCommands()
					.map((c) => COMMAND_PREFIXES[0] + c)
					.join(', ')}`
			);
		}
	}

	ensureTeamXY(who: EWho, team: Team) {
		if (!this.teamX && !this.teamY) {
			if (who === EWho.TEAM_X) {
				this.teamX = team;
				this.teamY = this.match.getOtherTeam(team);
			}
			if (who === EWho.TEAM_Y) {
				this.teamX = this.match.getOtherTeam(team);
				this.teamY = team;
			}
		}
	}

	onCommand(command: ECommand, team: Team, parameters: string[]) {
		if (this.state === ElectionState.IN_PROGRESS || this.state === ElectionState.NOT_STARTED) {
			const map = parameters[0] || '';
			switch (command) {
				case ECommand.AGREE:
					this.agreeCommand(team, map);
					break;
				case ECommand.BAN:
					this.banCommand(team, map);
					break;
				case ECommand.CT:
					this.ctCommand(team);
					break;
				case ECommand.PICK:
					this.pickCommand(team, map);
					break;
				case ECommand.T:
					this.tCommand(team);
					break;
				case ECommand.RESTART:
					this.restartCommand(team);
					break;
			}
		}
	}
}
