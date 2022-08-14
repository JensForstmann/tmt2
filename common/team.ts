import { TTeamAB } from './types';

export const getOtherTeamAB = (team: TTeamAB): TTeamAB => {
	switch (team) {
		case 'TEAM_A':
			return 'TEAM_B';
		case 'TEAM_B':
			return 'TEAM_A';
	}
};
