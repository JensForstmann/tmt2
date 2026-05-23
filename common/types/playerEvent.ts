interface BasePlayerEvent {
	/** ISO */
	timestamp: string;
	matchId: string;
	/** 0-based */
	mapIndex: number;
	/** 0-based */
	roundNumber: number;
}

interface BasePlayerEventWithTime extends BasePlayerEvent {
	/** Point of time when this event happens. "0" is the beginning of a round (end of freeze time). */
	roundTimeMs: number;
}

/** Player took part in a specific round. */
export interface PlayerEventRound extends BasePlayerEvent {
	playerSteamId64: string;
}

/** One player attacks/damages another player. */
export interface PlayerEventAttack extends BasePlayerEventWithTime {
	from: string;
	to: string;
	weapon: string;
	damage: number;
	damageArmor: number;
	health: number;
	armor: number;
	hitGroup: string;
	isFriendlyFire: boolean;
}

/** One player kills another player. */
export interface PlayerEventKill extends BasePlayerEventWithTime {
	from: string;
	to: string;
	weapon: string;
	headShot: boolean;
	noScope: boolean;
	penetrated: boolean;
	attackerInAir: boolean;
	attackerBlind: boolean;
	isFriendlyFire: boolean;
}

/** One player kills themselves. */
export interface PlayerEventSuicide extends BasePlayerEventWithTime {
	to: string;
	weapon: string;
}

/** One player assists in killing another player. */
export interface PlayerEventAssist extends BasePlayerEventWithTime {
	from: string;
	to: string;
	isFriendlyFire: boolean;
}

/** One player blinds another player. */
export interface PlayerEventBlind extends BasePlayerEventWithTime {
	from: string;
	to: string;
	seconds: number;
	isFriendlyFire: boolean;
}
