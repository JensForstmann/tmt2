import { Match, COMMAND_PREFIXES } from './match';
import { Team, ETeamSides } from './team';
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

export interface ElectionStep {
	map:
		| {
				mode: 'FIXED';
				fixed: string;
		  }
		| {
				mode: 'BAN' | 'RANDOM_BAN' | 'PICK' | 'RANDOM_PICK' | 'AGREE';
				who: EWho;
		  };
	side:
		| {
				mode: 'FIXED';
				fixed: ESideFixed;
		  }
		| {
				mode: 'PICK' | 'RANDOM' | 'KNIFE';
				who: EWho;
		  };
}

export enum ElectionState {
	NOT_STARTED = 'NOT_STARTED',
	IN_PROGRESS = 'IN_PROGRESS',
	FINISHED = 'FINISHED',
}

export class Election {
	match: Match;
	state: ElectionState = ElectionState.NOT_STARTED;
	currentStep: number = 0;
	currentElectionStep: ElectionStep;
	currentSubStep: 'MAP' | 'SIDE' = 'MAP';
	teamX?: Team;
	teamY?: Team;
	remainingMaps: string[];
	map: string = '';
	maps: MatchMap[] = [];
	currentAgree: Map<Team, string> = new Map();

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

	ban(team: Team, map: string) {
		map = map.toLowerCase();
		if (
			this.currentSubStep === 'MAP' &&
			this.currentElectionStep.map.mode === 'BAN' &&
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

	pick(team: Team, map: string) {
		map = map.toLowerCase();
		if (
			this.currentSubStep === 'MAP' &&
			this.currentElectionStep.map.mode === 'PICK' &&
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

	t(team: Team) {
		if (
			this.currentSubStep === 'SIDE' &&
			this.currentElectionStep.side.mode === 'PICK' &&
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

	ct(team: Team) {
		if (
			this.currentSubStep === 'SIDE' &&
			this.currentElectionStep.side.mode === 'PICK' &&
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

	agree(team: Team, map: string) {
		map = map.toLowerCase();
		if (this.currentSubStep === 'MAP' && this.currentElectionStep.map.mode === 'AGREE') {
			const matchMap = this.remainingMaps.findIndex((mapName) => mapName === map);
			if (matchMap > -1) {
				this.state = ElectionState.IN_PROGRESS;
				this.currentAgree.set(team, map);
				const otherTeam = this.match.getOtherTeam(team);
				if (this.currentAgree.get(team) === this.currentAgree.get(otherTeam)) {
					this.map = this.remainingMaps[matchMap];
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

	next() {
		if (
			this.currentSubStep === 'MAP' &&
			(this.currentElectionStep.map.mode === 'AGREE' ||
				this.currentElectionStep.map.mode === 'FIXED' ||
				this.currentElectionStep.map.mode === 'PICK' ||
				this.currentElectionStep.map.mode === 'RANDOM_PICK')
		) {
			this.currentSubStep = 'SIDE';
		} else {
			this.currentSubStep = 'MAP';
			this.currentStep++;
			this.currentElectionStep = this.match.matchInitData.electionSteps[this.currentStep];
			if (!this.currentElectionStep) {
				this.state = ElectionState.FINISHED;
				return; // prevent this.auto()
			}
		}

		this.auto();
	}

	auto() {
		if (this.currentSubStep === 'MAP') {
			this.autoMap();
		}
		if (this.currentSubStep === 'SIDE') {
			this.autoSide();
		}
	}

	autoMap() {
		if (this.currentElectionStep.map.mode === 'FIXED') {
			this.map = this.currentElectionStep.map.fixed;
			this.match.say(`${this.currentStep + 1}. MAP: ${this.map}`);
			this.next();
			return;
		}
		if (
			this.currentElectionStep.map.mode === 'RANDOM_BAN' ||
			this.currentElectionStep.map.mode === 'RANDOM_PICK'
		) {
			const matchMap = Math.min(
				Math.floor(Math.random() * this.remainingMaps.length),
				this.remainingMaps.length
			);
			if (this.currentElectionStep.map.mode === 'RANDOM_PICK') {
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
		if (this.currentElectionStep.side.mode === 'FIXED') {
			if (
				[ESideFixed.TEAM_1_CT, ESideFixed.TEAM_2_T].includes(
					this.currentElectionStep.side.fixed
				)
			) {
				this.maps.push(new MatchMap(this.match, this.map, this.match.team1));
				this.match.say(
					`${this.currentStep + 1}. MAP: ${
						this.map
					} (CT-SIDE: ${this.match.team1.toIngameString()})`
				);
				this.next();
				return;
			}

			if (
				[ESideFixed.TEAM_1_T, ESideFixed.TEAM_2_CT].includes(
					this.currentElectionStep.side.fixed
				)
			) {
				this.maps.push(new MatchMap(this.match, this.map, this.match.team2));
				this.match.say(
					`${this.currentStep + 1}. MAP: ${
						this.map
					} (CT-SIDE: ${this.match.team2.toIngameString()})`
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
			const startAsCtTeam = Math.random() < 0.5 ? this.match.team1 : this.match.team2;
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
		if (this.currentSubStep === 'MAP') {
			switch (this.currentElectionStep.map.mode) {
				case 'AGREE':
					return [...getCommands(ECommand.AGREE), ...getCommands(ECommand.PICK)];
				case 'BAN':
					return getCommands(ECommand.BAN);
				case 'PICK':
					return getCommands(ECommand.PICK);
			}
		}
		if (this.currentSubStep === 'SIDE') {
			switch (this.currentElectionStep.side.mode) {
				case 'PICK':
					return [...getCommands(ECommand.T), ...getCommands(ECommand.CT)];
			}
		}
		return [];
	}

	isValidTeam(who: EWho, team: Team) {
		if (who === EWho.TEAM_1 && team.isTeam1) return true;
		if (who === EWho.TEAM_2 && !team.isTeam1) return true;
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
					this.agree(team, map);
					break;
				case ECommand.BAN:
					this.ban(team, map);
					break;
				case ECommand.CT:
					this.ct(team);
					break;
				case ECommand.PICK:
					this.pick(team, map);
					break;
				case ECommand.T:
					this.t(team);
					break;
			}
		}
	}
}
