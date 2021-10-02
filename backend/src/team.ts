import { generate as shortUuid } from 'short-uuid';
import { ITeam, ITeamCreateDto } from './interfaces/team';

export interface ITeamChange {
	name?: string;
	advantage?: number;
}

export const createFromCreateDto = (dto: ITeamCreateDto): ITeam => {
	return {
		...dto,
		advantage: dto.advantage ?? 0,
		id: shortUuid(),
	};
};
