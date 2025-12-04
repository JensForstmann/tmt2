import { db } from '../database';
import fs from 'node:fs';
import path from 'node:path';

const STORAGE_FOLDER = process.env['TMT_STORAGE_FOLDER'] || 'storage';

export const migration01 = () => {
	fs.mkdirSync(path.join(STORAGE_FOLDER, 'migrated'), { recursive: true });
	migrateMatches();
	migrateManagedGameServer();
	migrateEvents();
	migrateLogs();
};

const migrateMatches = () => {
	db.prepare(
		`CREATE TABLE IF NOT EXISTS match (
        id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        passthrough TEXT,
        mapPool TEXT NOT NULL,
        teamAPassthrough TEXT,
        teamAName TEXT NOT NULL,
        teamAAdvantage INTEGER NOT NULL,
        teamAPlayerSteamIds64 TEXT NOT NULL,
        teamBPassthrough TEXT,
        teamBName TEXT NOT NULL,
        teamBAdvantage INTEGER NOT NULL,
        teamBPlayerSteamIds64 TEXT NOT NULL,
        electionSteps TEXT NOT NULL,
        gameServerIp TEXT NOT NULL,
        gameServerPort INTEGER NOT NULL,
        gameServerRconPassword TEXT NOT NULL,
        gameServerHideRconPassword INTEGER NOT NULL,
        logSecret TEXT NOT NULL,
        currentMap INTEGER NOT NULL,
        webhookUrl TEXT,
        webhookHeaders TEXT NOT NULL,
        rconCommandsInit TEXT NOT NULL,
        rconCommandsKnife TEXT NOT NULL,
        rconCommandsMatch TEXT NOT NULL,
        rconCommandsEnd TEXT NOT NULL,
        canClinch INTEGER NOT NULL,
        matchEndAction TEXT NOT NULL,
        tmtSecret TEXT NOT NULL,
        isStopped INTEGER NOT NULL,
        tmtLogAddress TEXT,
        createdAt INTEGER NOT NULL,
        lastSavedAt INTEGER NOT NULL,
        mode TEXT NOT NULL,
        needsAttentionSince INTEGER
    ) STRICT`
	).run();
	const insertMatchStatement = db.prepare(`INSERT INTO match (
        id,
        state,
        passthrough,
        mapPool,
        teamAPassthrough,
        teamAName,
        teamAAdvantage,
        teamAPlayerSteamIds64,
        teamBPassthrough,
        teamBName,
        teamBAdvantage,
        teamBPlayerSteamIds64,
        electionSteps,
        gameServerIp,
        gameServerPort,
        gameServerRconPassword,
        gameServerHideRconPassword,
        logSecret,
        currentMap,
        webhookUrl,
        webhookHeaders,
        rconCommandsInit,
        rconCommandsKnife,
        rconCommandsMatch,
        rconCommandsEnd,
        canClinch,
        matchEndAction,
        tmtSecret,
        isStopped,
        tmtLogAddress,
        createdAt,
        lastSavedAt,
        mode,
        needsAttentionSince
    ) VALUES (
        :id,
        :state,
        :passthrough,
        :mapPool,
        :teamAPassthrough,
        :teamAName,
        :teamAAdvantage,
        :teamAPlayerSteamIds64,
        :teamBPassthrough,
        :teamBName,
        :teamBAdvantage,
        :teamBPlayerSteamIds64,
        :electionSteps,
        :gameServerIp,
        :gameServerPort,
        :gameServerRconPassword,
        :gameServerHideRconPassword,
        :logSecret,
        :currentMap,
        :webhookUrl,
        :webhookHeaders,
        :rconCommandsInit,
        :rconCommandsKnife,
        :rconCommandsMatch,
        :rconCommandsEnd,
        :canClinch,
        :matchEndAction,
        :tmtSecret,
        :isStopped,
        :tmtLogAddress,
        :createdAt,
        :lastSavedAt,
        :mode,
        :needsAttentionSince
    )`);

	db.prepare(
		`CREATE TABLE IF NOT EXISTS matchMap (
        matchId TEXT NOT NULL,
        "index" INTEGER NOT NULL,
        name TEXT NOT NULL,
        knifeForSide INTEGER NOT NULL,
        startAsCtTeam TEXT NOT NULL,
        state TEXT NOT NULL,
        knifeWinner TEXT,
        readyTeamA INTEGER NOT NULL,
        readyTeamB INTEGER NOT NULL,
        knifeRestartTeamA INTEGER NOT NULL,
        knifeRestartTeamB INTEGER NOT NULL,
        scoreTeamA INTEGER NOT NULL,
        scoreTeamB INTEGER NOT NULL,
        PRIMARY KEY (matchId, "index")
        FOREIGN KEY (matchId) REFERENCES match (id) ON UPDATE CASCADE ON DELETE CASCADE
    ) STRICT`
	).run();
	const insertMatchMapStatement = db.prepare(`INSERT INTO matchMap (
        matchId,
        "index",
        name,
        knifeForSide,
        startAsCtTeam,
        state,
        knifeWinner,
        readyTeamA,
        readyTeamB,
        knifeRestartTeamA,
        knifeRestartTeamB,
        scoreTeamA,
        scoreTeamB
    ) VALUES (
        :matchId,
        :index,
        :name,
        :knifeForSide,
        :startAsCtTeam,
        :state,
        :knifeWinner,
        :readyTeamA,
        :readyTeamB,
        :knifeRestartTeamA,
        :knifeRestartTeamB,
        :scoreTeamA,
        :scoreTeamB
    )`);

	db.prepare(
		`CREATE TABLE IF NOT EXISTS matchPlayer (
        matchId TEXT NOT NULL,
        steamId64 TEXT NOT NULL,
        name TEXT NOT NULL,
        team TEXT,
        side TEXT,
        online INTEGER,
        PRIMARY KEY (matchId, steamId64)
        FOREIGN KEY (matchId) REFERENCES match (id) ON UPDATE CASCADE ON DELETE CASCADE
    ) STRICT`
	).run();
	const insertMatchPlayerStatement = db.prepare(`INSERT INTO matchPlayer (
        matchId,
        steamId64,
        name,
        team,
        side,
        online
    ) VALUES (
        :matchId,
        :steamId64,
        :name,
        :team,
        :side,
        :online
    )`);

	const matchFiles = fs
		.readdirSync(path.join(STORAGE_FOLDER))
		.filter((fileName) => fileName.startsWith('match_') && fileName.endsWith('.json'));
	matchFiles.forEach((matchFile) => {
		try {
			const match = JSON.parse(
				fs.readFileSync(path.join(STORAGE_FOLDER, matchFile), { encoding: 'utf-8' })
			);
			const params = {
				id: match.id,
				state: match.state,
				passthrough: match.passthrough ?? null,
				mapPool: JSON.stringify(match.mapPool),
				teamAPassthrough: match.teamA.passthrough ?? null,
				teamAName: match.teamA.name,
				teamAAdvantage: match.teamA.advantage,
				teamAPlayerSteamIds64: JSON.stringify(match.teamA.playerSteamIds64 ?? []),
				teamBPassthrough: match.teamB.passthrough ?? null,
				teamBName: match.teamB.name,
				teamBAdvantage: match.teamB.advantage,
				teamBPlayerSteamIds64: JSON.stringify(match.teamB.playerSteamIds64 ?? []),
				electionSteps: JSON.stringify(match.electionSteps),
				gameServerIp: match.gameServer.ip,
				gameServerPort: match.gameServer.port,
				gameServerRconPassword: match.gameServer.rconPassword,
				gameServerHideRconPassword: match.gameServer.hideRconPassword === true ? 1 : 0,
				logSecret: match.logSecret,
				currentMap: match.currentMap,
				webhookUrl: match.webhookUrl,
				webhookHeaders: JSON.stringify(match.webhookHeaders ?? {}),
				rconCommandsInit: JSON.stringify(match.rconCommands.init),
				rconCommandsKnife: JSON.stringify(match.rconCommands.knife),
				rconCommandsMatch: JSON.stringify(match.rconCommands.match),
				rconCommandsEnd: JSON.stringify(match.rconCommands.end),
				canClinch: match.canClinch ? 1 : 0,
				matchEndAction: match.matchEndAction,
				tmtSecret: match.tmtSecret,
				isStopped: match.isStopped ? 1 : 0,
				tmtLogAddress: match.tmtLogAddress ?? null,
				createdAt: match.createdAt,
				lastSavedAt: match.lastSavedAt,
				mode: match.mode,
				needsAttentionSince: null,
			};
			insertMatchStatement.run(params);

			(match.matchMaps as any[]).forEach((matchMap, index) => {
				const params = {
					matchId: match.id,
					index: index,
					name: matchMap.name,
					knifeForSide: matchMap.knifeForSide ? 1 : 0,
					startAsCtTeam: matchMap.startAsCtTeam,
					state: matchMap.state,
					knifeWinner: matchMap.knifeWinner ?? null,
					readyTeamA: matchMap.readyTeams.teamA ? 1 : 0,
					readyTeamB: matchMap.readyTeams.teamB ? 1 : 0,
					knifeRestartTeamA: matchMap.knifeRestart.teamA ? 1 : 0,
					knifeRestartTeamB: matchMap.knifeRestart.teamB ? 1 : 0,
					scoreTeamA: matchMap.score.teamA,
					scoreTeamB: matchMap.score.teamB,
				};
				insertMatchMapStatement.run(params);
			});

			(match.players as any[]).forEach((player) => {
				const params = {
					matchId: match.id,
					steamId64: player.steamId64,
					name: player.name,
					team: player.team ?? null,
					side: player.side ?? null,
					online: player.online === true ? 1 : player.online === false ? 0 : null,
				};
				insertMatchPlayerStatement.run(params);
			});

			fs.renameSync(
				path.join(STORAGE_FOLDER, matchFile),
				path.join(STORAGE_FOLDER, 'migrated', matchFile)
			);
			console.log(`migrated match ${match.id}`);
		} catch (err) {
			console.error(`Could not migrate match ${matchFile}: ${err}`);
			console.error(err);
		}
	});
};

const migrateManagedGameServer = () => {
	db.prepare(
		`CREATE TABLE IF NOT EXISTS managedGameServer (
            ip TEXT NOT NULL,
            port INTEGER NOT NULL,
            rconPassword TEXT NOT NULL,
            canBeUsed INTEGER NOT NULL,
            usedBy TEXT,
            PRIMARY KEY (ip, port)
        ) STRICT`
	).run();

	const insert = db.prepare(
		`INSERT INTO managedGameServer (
            ip,
            port,
            rconPassword,
            canBeUsed,
            usedBy
        ) VALUES (
            :ip,
            :port,
            :rconPassword,
            :canBeUsed,
            :usedBy
        )`
	);

	if (!fs.existsSync(path.join(STORAGE_FOLDER, 'managed_game_servers.json'))) {
		return;
	}
	const managedGameServers = JSON.parse(
		fs.readFileSync(path.join(STORAGE_FOLDER, 'managed_game_servers.json'), {
			encoding: 'utf-8',
		})
	) as any[];
	managedGameServers.forEach((managedGameServer, i) => {
		try {
			const params = {
				ip: managedGameServer.ip,
				port: managedGameServer.port,
				rconPassword: managedGameServer.rconPassword,
				canBeUsed: managedGameServer.canBeUsed ? 1 : 0,
				usedBy: managedGameServer.usedBy,
			};
			insert.run(params);
			console.log(
				`migrated managed gameserver ${managedGameServer.ip}:${managedGameServer.port}`
			);
		} catch (err) {
			console.error(`Could not migrate managed game server at index ${i}: ${err}`);
			console.error(err);
		}
	});
	fs.renameSync(
		path.join(STORAGE_FOLDER, 'managed_game_servers.json'),
		path.join(STORAGE_FOLDER, 'migrated', 'managed_game_servers.json')
	);
};

const migrateEvents = () => {
	db.prepare(
		`CREATE TABLE IF NOT EXISTS event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            matchId TEXT NOT NULL,
            matchPassthrough TEXT,
            type TEXT NOT NULL,
            payload TEXT NOT NULL,
            FOREIGN KEY (matchId) REFERENCES match (id) ON UPDATE CASCADE ON DELETE CASCADE
        ) STRICT`
	).run();
	const insertStatement = db.prepare(
		`INSERT INTO event (
            timestamp,
            matchId,
            matchPassthrough,
            type,
            payload
        ) VALUEs (
            :timestamp,
            :matchId,
            :matchPassthrough,
            :type,
            :payload
        )`
	);

	const eventsFiles = fs
		.readdirSync(path.join(STORAGE_FOLDER))
		.filter((fileName) => fileName.startsWith('events_') && fileName.endsWith('.jsonl'));
	eventsFiles.forEach((eventsFile) => {
		const matchId = eventsFile.substring(7, eventsFile.length - 6);
		try {
			const events = fs
				.readFileSync(path.join(STORAGE_FOLDER, eventsFile), { encoding: 'utf-8' })
				.trim()
				.split('\n')
				.map((line) => JSON.parse(line));
			events.forEach((event) => {
				const payload = { ...event };
				delete payload.timestamp;
				delete payload.matchId;
				delete payload.matchPassthrough;
				delete payload.type;
				const params = {
					timestamp: event.timestamp,
					matchId: event.matchId,
					matchPassthrough: event.matchPassthrough,
					type: event.type,
					payload: JSON.stringify(payload),
				};
				insertStatement.run(params);
			});
			console.log(`Migrated events from match ${matchId}`);
			fs.renameSync(
				path.join(STORAGE_FOLDER, eventsFile),
				path.join(STORAGE_FOLDER, 'migrated', eventsFile)
			);
		} catch (err: any) {
			if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
				console.log(`Skip events from match ${matchId} (match does not exist).`);
				fs.renameSync(
					path.join(STORAGE_FOLDER, eventsFile),
					path.join(STORAGE_FOLDER, 'migrated', eventsFile)
				);
			} else {
				console.error(`Could not migrate events from file ${eventsFile}: ${err}`);
				console.error(err);
			}
		}
	});
};

const migrateLogs = () => {
	const logsFiles = fs
		.readdirSync(path.join(STORAGE_FOLDER))
		.filter((fileName) => fileName.startsWith('logs_') && fileName.endsWith('.jsonl'));
	logsFiles.forEach((logsFile) => {
		fs.renameSync(
			path.join(STORAGE_FOLDER, logsFile),
			path.join(STORAGE_FOLDER, 'migrated', logsFile)
		);
	});
};
