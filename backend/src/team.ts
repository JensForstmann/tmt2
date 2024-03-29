import { ITeam, ITeamCreateDto } from '../../common';

export interface ITeamChange {
	name?: string;
	advantage?: number;
}

export const createFromCreateDto = (dto: ITeamCreateDto): ITeam => {
	return {
		...dto,
		advantage: dto.advantage ?? 0,
	};
};
