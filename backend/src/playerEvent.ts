import {
	IMatchMap,
	IPlayer,
	PlayerEventAssist,
	PlayerEventAttack,
	PlayerEventBlind,
	PlayerEventKill,
	PlayerEventRound,
	PlayerEventSuicide,
	PlayerStats,
} from '../../common';
import { db } from './database';
import * as Match from './match';
import * as MatchMap from './matchMap';
import * as MatchService from './matchService';
import * as Player from './player';

type BasePlayerEvent = {
	timestamp: string;
	matchId: string;
	mapIndex: number;
	roundNumber: number;
};

type BasePlayerEventWithTime = BasePlayerEvent & {
	roundTimeMs: number;
};

export type TDbPlayerEventRound = BasePlayerEvent & {
	playerSteamId64: string;
};

export type TDbPlayerEventAttack = BasePlayerEventWithTime & {
	from: string;
	to: string;
	weapon: string;
	damage: number;
	damageArmor: number;
	health: number;
	armor: number;
	hitGroup: string;
	isFriendlyFire: number;
};

export type TDbPlayerEventKill = BasePlayerEventWithTime & {
	from: string;
	to: string;
	weapon: string;
	headShot: number;
	noScope: number;
	penetrated: number;
	attackerInAir: number;
	attackerBlind: number;
	isFriendlyFire: number;
};

export type TDbPlayerEventSuicide = BasePlayerEventWithTime & {
	to: string;
	weapon: string;
};

export type TDbPlayerEventAssist = BasePlayerEventWithTime & {
	from: string;
	to: string;
	isFriendlyFire: number;
};

export type TDbPlayerEventBlind = BasePlayerEventWithTime & {
	from: string;
	to: string;
	seconds: number;
	isFriendlyFire: number;
};

export type TDbPlayerStats = {
	matchId: string;
	mapIndex: number;
	steamId64: string;
	side: string | null;
	state: string | null;
	money: number;
	kills: number;
	deaths: number;
	assists: number;
	damage: number;
	utilityDamage: number;
	enemiesFlashed: number;
	averageDamagePerRound: number;
	health: number;
	armor: number;
	headshots: number;
	/** JSON string */
	items: string;
};

export const playerEventAttackToDb = (pe: PlayerEventAttack): TDbPlayerEventAttack => {
	return {
		timestamp: pe.timestamp,
		matchId: pe.matchId,
		mapIndex: pe.mapIndex,
		roundNumber: pe.roundNumber,
		roundTimeMs: pe.roundTimeMs,
		from: pe.from,
		to: pe.to,
		weapon: pe.weapon,
		damage: pe.damage,
		damageArmor: pe.damageArmor,
		health: pe.health,
		armor: pe.armor,
		hitGroup: pe.hitGroup,
		isFriendlyFire: pe.isFriendlyFire ? 1 : 0,
	};
};

export const playerEventAttackFromDb = (dbRow: TDbPlayerEventAttack): PlayerEventAttack => {
	return {
		timestamp: dbRow.timestamp,
		matchId: dbRow.matchId,
		mapIndex: dbRow.mapIndex,
		roundNumber: dbRow.roundNumber,
		roundTimeMs: dbRow.roundTimeMs,
		from: dbRow.from,
		to: dbRow.to,
		weapon: dbRow.weapon,
		damage: dbRow.damage,
		damageArmor: dbRow.damageArmor,
		health: dbRow.health,
		armor: dbRow.armor,
		hitGroup: dbRow.hitGroup,
		isFriendlyFire: !!dbRow.isFriendlyFire,
	};
};

export const playerEventKillToDb = (pe: PlayerEventKill): TDbPlayerEventKill => {
	return {
		timestamp: pe.timestamp,
		matchId: pe.matchId,
		mapIndex: pe.mapIndex,
		roundNumber: pe.roundNumber,
		roundTimeMs: pe.roundTimeMs,
		from: pe.from,
		to: pe.to,
		weapon: pe.weapon,
		headShot: pe.headShot ? 1 : 0,
		noScope: pe.noScope ? 1 : 0,
		penetrated: pe.penetrated ? 1 : 0,
		attackerInAir: pe.attackerInAir ? 1 : 0,
		attackerBlind: pe.attackerBlind ? 1 : 0,
		isFriendlyFire: pe.isFriendlyFire ? 1 : 0,
	};
};

export const playerEventKillFromDb = (dbRow: TDbPlayerEventKill): PlayerEventKill => {
	return {
		timestamp: dbRow.timestamp,
		matchId: dbRow.matchId,
		mapIndex: dbRow.mapIndex,
		roundNumber: dbRow.roundNumber,
		roundTimeMs: dbRow.roundTimeMs,
		from: dbRow.from,
		to: dbRow.to,
		weapon: dbRow.weapon,
		headShot: !!dbRow.headShot,
		noScope: !!dbRow.noScope,
		penetrated: !!dbRow.penetrated,
		attackerInAir: !!dbRow.attackerInAir,
		attackerBlind: !!dbRow.attackerBlind,
		isFriendlyFire: !!dbRow.isFriendlyFire,
	};
};

export const playerEventAssistToDb = (pe: PlayerEventAssist): TDbPlayerEventAssist => {
	return {
		timestamp: pe.timestamp,
		matchId: pe.matchId,
		mapIndex: pe.mapIndex,
		roundNumber: pe.roundNumber,
		roundTimeMs: pe.roundTimeMs,
		from: pe.from,
		to: pe.to,
		isFriendlyFire: pe.isFriendlyFire ? 1 : 0,
	};
};

export const playerEventAssistFromDb = (dbRow: TDbPlayerEventAssist): PlayerEventAssist => {
	return {
		timestamp: dbRow.timestamp,
		matchId: dbRow.matchId,
		mapIndex: dbRow.mapIndex,
		roundNumber: dbRow.roundNumber,
		roundTimeMs: dbRow.roundTimeMs,
		from: dbRow.from,
		to: dbRow.to,
		isFriendlyFire: !!dbRow.isFriendlyFire,
	};
};

export const playerEventBlindToDb = (pe: PlayerEventBlind): TDbPlayerEventBlind => {
	return {
		timestamp: pe.timestamp,
		matchId: pe.matchId,
		mapIndex: pe.mapIndex,
		roundNumber: pe.roundNumber,
		roundTimeMs: pe.roundTimeMs,
		from: pe.from,
		to: pe.to,
		seconds: pe.seconds,
		isFriendlyFire: pe.isFriendlyFire ? 1 : 0,
	};
};

export const playerEventBlindFromDb = (dbRow: TDbPlayerEventBlind): PlayerEventBlind => {
	return {
		timestamp: dbRow.timestamp,
		matchId: dbRow.matchId,
		mapIndex: dbRow.mapIndex,
		roundNumber: dbRow.roundNumber,
		roundTimeMs: dbRow.roundTimeMs,
		from: dbRow.from,
		to: dbRow.to,
		seconds: dbRow.seconds,
		isFriendlyFire: !!dbRow.isFriendlyFire,
	};
};

export const playerStatsToDb = (
	matchId: string,
	mapIndex: number,
	playerStats: PlayerStats
): TDbPlayerStats => {
	return {
		matchId: matchId,
		mapIndex: mapIndex,
		steamId64: playerStats.steamId64,
		side: playerStats.side,
		state: playerStats.state,
		money: playerStats.money,
		kills: playerStats.kills,
		deaths: playerStats.deaths,
		assists: playerStats.assists,
		damage: playerStats.damage,
		utilityDamage: playerStats.utilityDamage,
		enemiesFlashed: playerStats.enemiesFlashed,
		averageDamagePerRound: playerStats.averageDamagePerRound,
		health: playerStats.health,
		armor: playerStats.armor,
		headshots: playerStats.headshots,
		items: JSON.stringify(playerStats.items),
	};
};
export const playerStatsFromDb = (dbRow: TDbPlayerStats): PlayerStats => {
	return {
		steamId64: dbRow.steamId64,
		side: dbRow.side as PlayerStats['side'],
		state: dbRow.state as PlayerStats['state'],
		money: dbRow.money,
		kills: dbRow.kills,
		deaths: dbRow.deaths,
		assists: dbRow.assists,
		damage: dbRow.damage,
		utilityDamage: dbRow.utilityDamage,
		enemiesFlashed: dbRow.enemiesFlashed,
		averageDamagePerRound: dbRow.averageDamagePerRound,
		health: dbRow.health,
		armor: dbRow.armor,
		headshots: dbRow.headshots,
		items: JSON.parse(dbRow.items) as PlayerStats['items'],
	};
};

export const savePlayerEventRoundToDb = (pe: PlayerEventRound) => {
	db.prepare<TDbPlayerEventRound>(
		`INSERT INTO matchPlayerEventRound (
            timestamp,
            matchId,
            mapIndex,
            roundNumber,
            playerSteamId64
        ) VALUES (
            :timestamp,
            :matchId,
            :mapIndex,
            :roundNumber,
            :playerSteamId64
        ) ON CONFLICT (matchId, mapIndex, roundNumber, playerSteamId64) DO NOTHING`
	).run(pe);
};

export const savePlayerEventAttackToDb = (pe: PlayerEventAttack) => {
	db.prepare<TDbPlayerEventAttack>(
		`INSERT INTO matchPlayerEventAttack (
            timestamp,
            matchId,
            mapIndex,
            roundNumber,
			roundTimeMs,
            "from",
            "to",
            weapon,
            damage,
            damageArmor,
            health,
            armor,
            hitGroup,
            isFriendlyFire
        ) VALUES (
            :timestamp,
            :matchId,
            :mapIndex,
            :roundNumber,
			:roundTimeMs,
            :from,
            :to,
            :weapon,
            :damage,
            :damageArmor,
            :health,
            :armor,
            :hitGroup,
            :isFriendlyFire
        )`
	).run(playerEventAttackToDb(pe));
};

export const savePlayerEventKillToDb = (pe: PlayerEventKill) => {
	db.prepare<TDbPlayerEventKill>(
		`INSERT INTO matchPlayerEventKill (
            timestamp,
            matchId,
            mapIndex,
            roundNumber,
			roundTimeMs,
            "from",
            "to",
            weapon,
            headShot,
            noScope,
            penetrated,
            attackerInAir,
            isFriendlyFire
        ) VALUES (
            :timestamp,
            :matchId,
            :mapIndex,
            :roundNumber,
			:roundTimeMs,
            :from,
            :to,
            :weapon,
            :headShot,
            :noScope,
            :penetrated,
            :attackerInAir,
            :isFriendlyFire
        )`
	).run(playerEventKillToDb(pe));
};

export const savePlayerEventSuicideToDb = (pe: PlayerEventSuicide) => {
	db.prepare<TDbPlayerEventSuicide>(
		`INSERT INTO matchPlayerEventSuicide (
            timestamp,
            matchId,
            mapIndex,
            roundNumber,
			roundTimeMs,
            "to",
	        weapon
        ) VALUES (
            :timestamp,
            :matchId,
            :mapIndex,
            :roundNumber,
			:roundTimeMs,
            :to,
	        :weapon
        )`
	).run(pe);
};

export const savePlayerEventAssistToDb = (pe: PlayerEventAssist) => {
	db.prepare<TDbPlayerEventAssist>(
		`INSERT INTO matchPlayerEventAssist (
            timestamp,
            matchId,
            mapIndex,
            roundNumber,
			roundTimeMs,
            "from",
            "to",
            isFriendlyFire
        ) VALUES (
            :timestamp,
            :matchId,
            :mapIndex,
            :roundNumber,
			:roundTimeMs,
            :from,
            :to,
            :isFriendlyFire
        )`
	).run(playerEventAssistToDb(pe));
};

export const savePlayerEventBlindToDb = (pe: PlayerEventBlind) => {
	db.prepare<TDbPlayerEventBlind>(
		`INSERT INTO matchPlayerEventBlind (
            timestamp,
            matchId,
            mapIndex,
            roundNumber,
			roundTimeMs,
            "from",
            "to",
            seconds,
            isFriendlyFire
        ) VALUES (
            :timestamp,
            :matchId,
            :mapIndex,
            :roundNumber,
			:roundTimeMs,
            :from,
            :to,
            :seconds,
            :isFriendlyFire
        )`
	).run(playerEventBlindToDb(pe));
};

export const saveMatchPlayerStatsToDb = (
	matchId: string,
	mapIndex: number,
	playerStats: PlayerStats
) => {
	db.prepare<TDbPlayerStats>(
		`INSERT INTO matchPlayerStats (
			matchId,
			mapIndex,
			steamId64,
			side,
			state,
			money,
			kills,
			deaths,
			assists,
			damage,
			utilityDamage,
			enemiesFlashed,
			averageDamagePerRound,
			health,
			armor,
			headshots,
			items
		) VALUES (
			:matchId,
			:mapIndex,
			:steamId64,
			:side,
			:state,
			:money,
			:kills,
			:deaths,
			:assists,
			:damage,
			:utilityDamage,
			:enemiesFlashed,
			:averageDamagePerRound,
			:health,
			:armor,
			:headshots,
			:items
		) ON CONFLICT (matchId, mapIndex, steamId64) DO UPDATE SET
			matchId = :matchId,
			mapIndex = :mapIndex,
			steamId64 = :steamId64,
			side = :side,
			state = :state,
			money = :money,
			kills = :kills,
			deaths = :deaths,
			assists = :assists,
			damage = :damage,
			utilityDamage = :utilityDamage,
			enemiesFlashed = :enemiesFlashed,
			averageDamagePerRound = :averageDamagePerRound,
			health = :health,
			armor = :armor,
			headshots = :headshots,
			items = :items
		WHERE matchId = :matchId AND mapIndex = :mapIndex AND steamId64 = :steamId64`
	).run(playerStatsToDb(matchId, mapIndex, playerStats));
};

export const onPlayerLogLine = async (
	match: Match.Match,
	player: IPlayer,
	remainingLine: string
) => {
	const currentMatchMap = Match.getCurrentMatchMap(match);
	if (!currentMatchMap) {
		return;
	}
	if (currentMatchMap.state !== 'IN_PROGRESS' && currentMatchMap.state !== 'PAUSED') {
		return;
	}
	if (currentMatchMap.currentRoundNumber === null) {
		return;
	}
	const matchId = match.data.id;
	const mapIndex = match.data.currentMap;
	const roundNumber = currentMatchMap.currentRoundNumber;

	if (currentMatchMap.lastRoundStart === null) {
		currentMatchMap.lastRoundStart = Date.now();
	}

	const roundTimeMs = Date.now() - currentMatchMap.lastRoundStart;

	const playerStats = MatchMap.getOrCreatePlayerStats(match, currentMatchMap, player);

	const xyzPattern = /\[(-?\d+) (-?\d+) (-?\d+)\]/;
	const playerPattern = /"(.*?)<(\d+)><(.*?)><(CT|TERRORIST)>"/;

	// [-1585 -1203 -416] attacked "Aspirant<15><BOT><CT>" [-1908 -873 -400] with "inferno" (damage "8") (damage_armor "0") (health "0") (armor "100") (hitgroup "generic")
	// [1766 -694 -352] attacked "Nickname<0><[U:1:12345678]><CT>" [2504 -344 -352] with "ak47" (damage "26") (damage_armor "0") (health "73") (armor "0") (hitgroup "left leg")
	// [1133 -95 -416] attacked "Krikey<16><BOT><TERRORIST>" [1147 -444 -414] with "glock" (damage "8") (damage_armor "0") (health "0") (armor "0") (hitgroup "chest")
	// [-1306 -1258 -416] attacked "Krikey<16><BOT><TERRORIST>" [-614 -1146 -416] with "hegrenade" (damage "12") (damage_armor "8") (health "27") (armor "80") (hitgroup "generic")
	const attackPattern = new RegExp(
		[
			/^/,
			xyzPattern,
			/ attacked /,
			playerPattern,
			/ /,
			xyzPattern,
			/ with "(.*)" \(damage "(\d+)"\) \(damage_armor "(\d+)"\) \(health "(\d+)"\) \(armor "(\d+)"\) \(hitgroup "(.*)"\)/,
		]
			.map((x) => x.source)
			.join('')
	);
	const attackMatch = remainingLine.match(attackPattern);
	if (remainingLine.includes('attacked') && !attackMatch) {
		console.log('found "attacked" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', attackPattern.source);
	}
	if (attackMatch) {
		const victimName = attackMatch[4]!;
		const victimIngameId = attackMatch[5]!;
		const victimSteamId = attackMatch[6]!;
		const victimTeamString = attackMatch[7] as 'CT' | 'TERRORIST';
		const victimSide = Player.getSideFromTeamString(victimTeamString);
		const victim = Match.getOrCreatePlayer(match, victimName, victimSteamId, victimTeamString);
		const victimStats = MatchMap.getOrCreatePlayerStats(match, currentMatchMap, victim);
		const victimHealthPost = Number.parseInt(attackMatch[14]!);
		const victimArmorPost = Number.parseInt(attackMatch[15]!);
		const weapon = attackMatch[11]!;

		// Getting the correct values from health and armor damage is not possible because of a few problems:
		// Problem 1: damage from log line is the full potential damage (e.g. 400 for awp headshot)
		// Problem 2: damage from log line might be 13 but the health left might be 88 (and not 87) because of rounding
		// Problem 3: victim pre attack health is not always known (no logs for fall damage or damage from bomb)
		// Try the best with everything that is known...

		const damageFromLog = Number.parseInt(attackMatch[12]!);
		const damageArmorFromLog = Number.parseInt(attackMatch[13]!);

		// damage from log lines may exceed the remaining health/armor stats from the victim (e.g. 400 for awp headshot)
		// this caps the damage to the remaining health/armor
		const cappedDamage = Math.min(damageFromLog, victimStats.health);
		const cappedDamageArmor = Math.min(damageArmorFromLog, victimStats.armor);

		// this is the calculated damage based on the known victim stats before and after the attack
		const calculatedDamage = victimStats.health - victimHealthPost;
		const calculatedDamageArmor = victimStats.armor - victimArmorPost;

		// The values from the log are rounded and doesn't always add up. Example:
		// ... (damage "2") (damage_armor "0") (health "77") (armor "0") (hitgroup "generic")
		// ... (damage "1") (damage_armor "0") (health "75") (armor "0") (hitgroup "generic")
		// 77 health minus 1 damage should be 76 health, but the log says it's 75
		// If the calculated value (in this case 2 instead of 1) is close to the logged value (1 in this case), then the calculated value is used.
		const damage =
			Math.abs(cappedDamage - calculatedDamage) <= 2 ? calculatedDamage : cappedDamage;
		const damageArmor =
			Math.abs(cappedDamageArmor - calculatedDamageArmor) <= 2
				? calculatedDamageArmor
				: cappedDamageArmor;

		// -> Why not always use the calculated values? Because the health/armor values before the attack are not always known or correct.
		//    For example: If a player takes fall damage, this will not be sent to the TMT. Also if the player gets damaged by the bomb.

		const isFriendlyFire = player.side === victimSide;
		savePlayerEventAttackToDb({
			timestamp: new Date().toISOString(),
			matchId: matchId,
			mapIndex: mapIndex,
			roundNumber: roundNumber,
			roundTimeMs: roundTimeMs,
			from: player.steamId64,
			to: victim.steamId64,
			weapon: weapon,
			damage: damage,
			damageArmor: damageArmor,
			health: victimHealthPost,
			armor: victimArmorPost,
			hitGroup: attackMatch[16]!,
			isFriendlyFire: isFriendlyFire,
		});
		victimStats.health = victimHealthPost;
		victimStats.armor = victimArmorPost;
		if (!isFriendlyFire) {
			playerStats.damage += damage;
			if (['inferno', 'hegrenade'].includes(weapon)) {
				playerStats.utilityDamage += damage;
			}
		}
		MatchService.scheduleSave(match);
		return;
	}

	// [1766 -694 -352] killed "Nickname<0><[U:1:12345678]><CT>" [2504 -344 -352] with "ak47"
	// [431 -1384 -360] killed other "prop_dynamic<436>" [448 -1403 -416] with "knife_t" (attackerinair)
	// [1020 -2169 -416] killed other "prop_dynamic<455>" [1079 -796 -344] with "glock"
	// [561 -836 -347] killed "Seal<3><BOT><CT>" [665 -811 -416] with "p90" (headshot attackerinair)
	// [779 -1689 -415] killed "Seal<3><BOT><CT>" [812 -1660 -416] with "ssg08" (noscope)
	// [2465 -309 -299] killed "Seal<3><BOT><CT>" [2504 -344 -352] with "awp" (headshot noscope attackerinair)
	// [2505 -523 -343] killed "Sas<4><BOT><CT>" [2585 -344 -352] with "awp" (headshot penetrated)
	// [1133 -95 -416] killed "Krikey<16><BOT><TERRORIST>" [1147 -444 -414] with "glock"
	// [-1585 -1203 -416] killed "Aspirant<15><BOT><CT>" [-1908 -873 -400] with "inferno"
	const killPattern = new RegExp(
		[/^/, xyzPattern, / killed /, playerPattern, / /, xyzPattern, / with "(.*)"(?: \((.*)\))?/]
			.map((x) => x.source)
			.join('')
	);
	const killMatch = remainingLine.match(killPattern);
	if (remainingLine.includes('killed "') && !killMatch) {
		console.log('found "killed" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', killPattern.source);
	}
	if (killMatch) {
		const victimName = killMatch[4]!;
		const victimIngameId = killMatch[5]!;
		const victimSteamId = killMatch[6]!;
		const victimTeamString = killMatch[7] as 'CT' | 'TERRORIST';
		const victimSide = Player.getSideFromTeamString(victimTeamString);
		const victim = Match.getOrCreatePlayer(match, victimName, victimSteamId, victimTeamString);
		const victimStats = MatchMap.getOrCreatePlayerStats(match, currentMatchMap, victim);
		const isFriendlyFire = player.side === victimSide;
		const headShot = killMatch[12]?.includes('headshot') ?? false;
		savePlayerEventKillToDb({
			timestamp: new Date().toISOString(),
			matchId: matchId,
			mapIndex: mapIndex,
			roundNumber: roundNumber,
			roundTimeMs: roundTimeMs,
			from: player.steamId64,
			to: victim.steamId64,
			weapon: killMatch[11]!,
			headShot: headShot,
			noScope: killMatch[12]?.includes('noscope') ?? false,
			penetrated: killMatch[12]?.includes('penetrated') ?? false,
			attackerInAir: killMatch[12]?.includes('attackerinair') ?? false,
			attackerBlind: killMatch[12]?.includes('attackerblind') ?? false,
			isFriendlyFire: isFriendlyFire,
		});
		victimStats.health = 0;
		victimStats.armor = 0;
		victimStats.state = 'DEAD';
		victimStats.deaths++;
		victimStats.items = [];
		if (!isFriendlyFire) {
			playerStats.kills++;
			if (headShot) {
				playerStats.headshots++;
			}
		}
		MatchService.scheduleSave(match);
		return;
	}

	// [287 -1299 -751] committed suicide with "world"
	// [2877 -482 -352] committed suicide with "inferno"
	// [2716 -688 -336] committed suicide with "hegrenade"
	const suicidePattern = new RegExp(
		[/^/, xyzPattern, / committed suicide with "(.*)"/].map((x) => x.source).join('')
	);
	const suicideMatch = remainingLine.match(suicidePattern);
	if (remainingLine.includes('suicide') && !suicideMatch) {
		console.log('found "suicide" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', suicidePattern.source);
	}
	if (suicideMatch) {
		savePlayerEventSuicideToDb({
			timestamp: new Date().toISOString(),
			matchId: matchId,
			mapIndex: mapIndex,
			roundNumber: roundNumber,
			roundTimeMs: roundTimeMs,
			to: player.steamId64,
			weapon: suicideMatch[4]!,
		});
		playerStats.health = 0;
		playerStats.armor = 0;
		playerStats.state = 'DEAD';
		playerStats.deaths++;
		MatchService.scheduleSave(match);
		return;
	}

	// [287 -1299 -751] was killed by the bomb.
	// check if this is needed ('was killed by the bomb' comes always together with 'committed suicide with "world")
	// const wasKilledByTheBombPattern = new RegExp(
	// 	[/^/, xyzPattern, / was killed by the bomb\./].map((x) => x.source).join('')
	// );
	// const wasKilledByTheBombMatch = remainingLine.match(wasKilledByTheBombPattern);
	// if (wasKilledByTheBombMatch) {
	// 	playerStats.health = 0;
	// 	playerStats.armor = 0;
	// 	playerStats.state = 'DEAD';
	// 	playerStats.deaths++;
	// 	MatchService.scheduleSave(match);
	// 	return;
	// }

	// assisted killing "Skullhead<4><BOT><CT>"
	const assistPattern = new RegExp(
		[/^assisted killing /, playerPattern].map((x) => x.source).join('')
	);
	const assistMatch = remainingLine.match(assistPattern);
	if (remainingLine.includes('assisted') && !assistMatch) {
		console.log('found "assisted" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', assistPattern.source);
	}
	if (assistMatch) {
		const victimName = assistMatch[1]!;
		const victimIngameId = assistMatch[2]!;
		const victimSteamId = assistMatch[3]!;
		const victimTeamString = assistMatch[4] as 'CT' | 'TERRORIST';
		const victimSide = Player.getSideFromTeamString(victimTeamString);
		const victim = Match.getOrCreatePlayer(match, victimName, victimSteamId, victimTeamString);
		const victimStats = MatchMap.getOrCreatePlayerStats(match, currentMatchMap, victim);
		const isFriendlyFire = player.side === victimSide;
		savePlayerEventAssistToDb({
			timestamp: new Date().toISOString(),
			matchId: matchId,
			mapIndex: mapIndex,
			roundNumber: roundNumber,
			roundTimeMs: roundTimeMs,
			from: player.steamId64,
			to: victim.steamId64,
			isFriendlyFire: isFriendlyFire,
		});
		if (!isFriendlyFire) {
			playerStats.assists++;
		}
		MatchService.scheduleSave(match);
		return;
	}

	// blinded for 3.75 by "Nickname<0><[U:1:12345678]><TERRORIST>" from flashbang entindex 256
	// Note: Ingame EF counter works differently:
	// flash behind enemy flahes them 1+ seconds but does not count...
	// flash in front of enemy far away flashes them 0.04 but does count...
	const blindPattern = new RegExp(
		[/^blinded for (\d+\.?\d*) by /, playerPattern, / from flashbang /]
			.map((x) => x.source)
			.join('')
	);
	const blindMatch = remainingLine.match(blindPattern);
	if (remainingLine.includes('blinded') && !blindMatch) {
		console.log('found "blinded" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', blindPattern.source);
	}
	if (blindMatch) {
		const attackerName = blindMatch[2]!;
		const attackerIngameId = blindMatch[3]!;
		const attackerSteamId = blindMatch[4]!;
		const attackerTeamString = blindMatch[5] as 'CT' | 'TERRORIST';
		const attackerSide = Player.getSideFromTeamString(attackerTeamString);
		const attacker = Match.getOrCreatePlayer(
			match,
			attackerName,
			attackerSteamId,
			attackerTeamString
		);
		const attackerStats = MatchMap.getOrCreatePlayerStats(match, currentMatchMap, attacker);
		const victimStats = MatchMap.getOrCreatePlayerStats(match, currentMatchMap, player);
		const isFriendlyFire = player.side === attackerSide;
		savePlayerEventBlindToDb({
			timestamp: new Date().toISOString(),
			matchId: matchId,
			mapIndex: mapIndex,
			roundNumber: roundNumber,
			roundTimeMs: roundTimeMs,
			from: attacker.steamId64,
			to: player.steamId64,
			seconds: Number.parseFloat(blindMatch[3]!),
			isFriendlyFire: isFriendlyFire,
		});
		if (!isFriendlyFire) {
			attackerStats.enemiesFlashed++;
		}
		MatchService.scheduleSave(match);
		return;
	}

	// money change 6500+300 = $6800 (tracked)
	const moneyPattern = new RegExp(/^money change (\d+)(\+|-)(\d+) = \$(\d+) \(tracked\)/);
	const moneyMatch = remainingLine.match(moneyPattern);
	if (remainingLine.includes('money') && !moneyMatch) {
		console.log('found "money" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', moneyPattern.source);
	}
	if (moneyMatch) {
		const money = parseInt(moneyMatch[4]!);
		MatchMap.getOrCreatePlayerStats(match, currentMatchMap, player).money = money;
		MatchService.scheduleSave(match);
		return;
	}

	// left buyzone with [ weapon_knife_t weapon_c4 weapon_ak47 weapon_p250 kevlar(100) helmet C4 ]
	// left buyzone with [ weapon_knife_t weapon_glock weapon_p90 weapon_c4 kevlar(93) helmet C4 ]
	// left buyzone with [ ]
	const leftBuyzonePattern = new RegExp(/^left buyzone with \[(.*)\]/);
	const leftBuyzoneMatch = remainingLine.match(leftBuyzonePattern);
	if (remainingLine.includes('buyzone') && !leftBuyzoneMatch) {
		console.log('found "buyzone" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', leftBuyzonePattern.source);
	}
	if (leftBuyzoneMatch) {
		const items = leftBuyzoneMatch[1]!.trim().split(' ');
		let armorUpdated = false;
		const newItems: string[] = [];
		items.forEach((item) => {
			const kevlarMatch = item.match(/kevlar\((\d+)\)/);
			if (kevlarMatch) {
				playerStats.armor = parseInt(kevlarMatch[1]!);
				armorUpdated = true;
			} else {
				newItems.push(item.toUpperCase());
			}
		});
		playerStats.items = newItems;
		if (!armorUpdated) {
			playerStats.armor = 0;
		}
	}

	// triggered "Dropped_The_Bomb"
	// triggered "Got_The_Bomb"
	// triggered "Bomb_Begin_Plant" at bombsite A
	// triggered "Planted_The_Bomb" at bombsite B
	// triggered "Begin_Bomb_Defuse_Without_Kit"
	// triggered "Begin_Bomb_Defuse_With_Kit"
	const triggerPattern = new RegExp(/^triggered "(.*)"(?: at bombsite (A|B))?/);
	const triggerMatch = remainingLine.match(triggerPattern);
	if (remainingLine.includes('triggered') && !triggerMatch) {
		console.log('found "triggered" but got no regexp match:');
		console.log('line', remainingLine);
		console.log('pattern', triggerPattern.source);
	}
	if (triggerMatch) {
		const x = triggerMatch[1]!;
		const aOrB = triggerMatch[2] as 'A' | 'B' | undefined;
		if (x === 'Dropped_The_Bomb' || x === 'Planted_The_Bomb') {
			playerStats.items = playerStats.items.filter((item) => item !== 'C4');
		} else if (x === 'Got_The_Bomb') {
			playerStats.items.push('C4');
		}
		MatchService.scheduleSave(match);
		return;
	}

	// picked up "hegrenade"
	const pickedUpPattern = new RegExp(/^picked up "(.*)"/);
	const pickedUpMatch = remainingLine.match(pickedUpPattern);
	if (pickedUpMatch) {
		const item = pickedUpMatch[1]!.toUpperCase();
		if (!playerStats.items.includes(item)) {
			playerStats.items.push(item);
		}
		if (item === 'VESTHELM' || item === 'VEST') {
			playerStats.armor = 100;
		}
		MatchService.scheduleSave(match);
		return;
	}

	// Other log lines:

	// purchased "hegrenade"

	// sv_throw_hegrenade 215.265 -2201.865 -349.693 0.000 0.000 0.000 -494.014 449.845 95.992 600.000 -791.000 0.000 44 3.000
	// threw hegrenade [-178 -2133 -407]
	// sv_throw_flashgrenade -1281.259 -1255.228 -296.628 0.000 0.000 0.000 -648.757 177.601 56.548 600.000 449.000 0.000 43
	// threw flashbang [-2131 -1023 -393] flashbang entindex 256)
	// sv_throw_smokegrenade -1281.543 -1258.424 -301.078 0.000 0.000 0.000 -660.748 42.787 -131.172 600.000 -614.000 0.000 45 2
	// threw smokegrenade [-1870 -1218 -414]
	// sv_throw_molotov -1280.607 -1253.184 -298.146 0.000 0.000 0.000 -621.258 263.834 -7.461 600.000 675.000 0.000 46
	// threw molotov [-1795 -1035 -414]
};

export const recalculatePlayerStats = (match: Match.Match, matchMap: IMatchMap) => {
	if (matchMap.currentRoundNumber === null) {
		throw 'Cannot calculate player stats if current round number is null ';
	}
	const currentRoundNumber = matchMap.currentRoundNumber;

	const params = {
		matchId: match.data.id,
		mapIndex: match.data.currentMap,
	};
	const attacks = db
		.prepare<
			{ matchId: string; mapIndex: number },
			TDbPlayerEventAttack
		>('SELECT * FROM matchPlayerEventAttack WHERE matchId = :matchId AND mapIndex = :mapIndex')
		.all(params);
	const kills = db
		.prepare<
			{ matchId: string; mapIndex: number },
			TDbPlayerEventKill
		>('SELECT * FROM matchPlayerEventKill WHERE matchId = :matchId AND mapIndex = :mapIndex')
		.all(params);
	const suicides = db
		.prepare<
			{ matchId: string; mapIndex: number },
			TDbPlayerEventSuicide
		>('SELECT * FROM matchPlayerEventSuicide WHERE matchId = :matchId AND mapIndex = :mapIndex')
		.all(params);
	const assists = db
		.prepare<
			{ matchId: string; mapIndex: number },
			TDbPlayerEventAssist
		>('SELECT * FROM matchPlayerEventAssist WHERE matchId = :matchId AND mapIndex = :mapIndex')
		.all(params);
	const blinds = db
		.prepare<
			{ matchId: string; mapIndex: number },
			TDbPlayerEventBlind
		>('SELECT * FROM matchPlayerEventBlind WHERE matchId = :matchId AND mapIndex = :mapIndex')
		.all(params);

	matchMap.playerStats = match.data.players.map((player) => ({
		steamId64: player.steamId64,
		side: player.side,
		name: player.name,
		state: 'ALIVE',
		money: 0,
		kills: 0,
		deaths: 0,
		assists: 0,
		damage: 0,
		utilityDamage: 0,
		enemiesFlashed: 0,
		averageDamagePerRound: 0,
		health: 100,
		armor: 0,
		headshots: 0,
		items: [],
	}));

	attacks.forEach((row) =>
		processAttack(currentRoundNumber, matchMap, playerEventAttackFromDb(row))
	);
	kills.forEach((row) => processKill(currentRoundNumber, matchMap, playerEventKillFromDb(row)));
	suicides.forEach((row) => processSuicide(currentRoundNumber, matchMap, row));
	assists.forEach((row) =>
		processAssist(currentRoundNumber, matchMap, playerEventAssistFromDb(row))
	);
	blinds.forEach((row) =>
		processBlind(currentRoundNumber, matchMap, playerEventBlindFromDb(row))
	);
};

const processAttack = (
	currentRoundNumber: number,
	matchMap: IMatchMap,
	data: PlayerEventAttack
) => {
	const attackerStats = matchMap.playerStats.find((ps) => ps.steamId64 === data.from);
	const victimStats = matchMap.playerStats.find((ps) => ps.steamId64 === data.to);
	if (!attackerStats || !victimStats) {
		throw `Cannot find stats for attacker(${data.from}) and victim(${data.to}) of attack`;
	}
	if (!data.isFriendlyFire) {
		attackerStats.damage += data.damage;
		attackerStats.averageDamagePerRound = Math.round(
			attackerStats.damage / (currentRoundNumber + 1)
		);
		if (['inferno', 'hegrenade'].includes(data.weapon)) {
			attackerStats.utilityDamage += data.damage;
		}
	}
	if (currentRoundNumber === data.roundNumber) {
		victimStats.health = data.health;
		victimStats.armor = data.armor;
	}
};
const processKill = (currentRoundNumber: number, matchMap: IMatchMap, data: PlayerEventKill) => {
	const attackerStats = matchMap.playerStats.find((ps) => ps.steamId64 === data.from);
	const victimStats = matchMap.playerStats.find((ps) => ps.steamId64 === data.to);
	if (!attackerStats || !victimStats) {
		throw `Cannot find stats for attacker(${data.from}) and victim(${data.to}) of kill`;
	}
	if (!data.isFriendlyFire) {
		attackerStats.kills++;
		if (data.headShot) {
			attackerStats.headshots++;
		}
	}
	victimStats.deaths++;
	if (currentRoundNumber === data.roundNumber) {
		victimStats.health = 0;
		victimStats.armor = 0;
		victimStats.state = 'DEAD';
	}
};

const processSuicide = (
	currentRoundNumber: number,
	matchMap: IMatchMap,
	data: PlayerEventSuicide
) => {
	const victimStats = matchMap.playerStats.find((ps) => ps.steamId64 === data.to);
	if (!victimStats) {
		throw `Cannot find stats for victim(${data.to}) of suicide`;
	}
	victimStats.deaths++;
	if (currentRoundNumber === data.roundNumber) {
		victimStats.health = 0;
		victimStats.armor = 0;
		victimStats.state = 'DEAD';
	}
};
const processAssist = (
	currentRoundNumber: number,
	matchMap: IMatchMap,
	data: PlayerEventAssist
) => {
	const attackerStats = matchMap.playerStats.find((ps) => ps.steamId64 === data.from);
	if (!attackerStats) {
		throw `Cannot find stats for attacker(${data.from}) of assist`;
	}
	if (!data.isFriendlyFire) {
		attackerStats.assists++;
	}
};

const processBlind = (currentRoundNumber: number, matchMap: IMatchMap, data: PlayerEventBlind) => {
	const attackerStats = matchMap.playerStats.find((ps) => ps.steamId64 === data.from);
	if (!attackerStats) {
		throw `Cannot find stats for attacker(${data.from}) of blind`;
	}
	if (!data.isFriendlyFire) {
		attackerStats.enemiesFlashed++;
	}
};
