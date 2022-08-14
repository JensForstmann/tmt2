export interface ITeam {
	passthrough?: string;
	name: string;
	advantage: number;
}

export interface ITeamCreateDto {
	name: string;
	/** e.g. remote identifier, will be present in every response/webhook */
	passthrough?: string;
	/** defaults to 0 (no advantage) */
	advantage?: number;
}
