// src/sqlite-db.js - Motor SQLite 3 en WebAssembly (sql.js) con persistencia en el navegador
class SQLiteManager {
    constructor() {
        this.db = null;
        this.SQL = null;
        this.STORAGE_KEY = 'pamroomcats_sqlite_db';
    }

    async init() {
        if (this.db) return this.db;

        try {
            // Inicializar sql.js WebAssembly
            if (typeof initSqlJs !== 'function') {
                throw new Error('sql.js no está cargado');
            }

            this.SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
            });

            // Recuperar base de datos existente de localStorage (como binario base64)
            const savedDbBase64 = localStorage.getItem(this.STORAGE_KEY);
            if (savedDbBase64) {
                const binaryString = atob(savedDbBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                this.db = new this.SQL.Database(bytes);
            } else {
                // Crear nueva base de datos SQLite en memoria
                this.db = new this.SQL.Database();
                this.createSchema();
            }

            this.persist();
            return this.db;
        } catch (err) {
            console.error('Error al inicializar SQLite WebAssembly:', err);
            // Fallback a base de datos en memoria
            if (this.SQL) {
                this.db = new this.SQL.Database();
                this.createSchema();
            }
        }
    }

    createSchema() {
        const schema = `
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER,
                player_name TEXT NOT NULL,
                thesis_progress REAL NOT NULL,
                time_seconds REAL NOT NULL,
                chapter_reached INTEGER NOT NULL,
                won INTEGER NOT NULL,
                cats_attended INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                times_fed INTEGER DEFAULT 0,
                times_litter_cleaned INTEGER DEFAULT 0,
                times_played INTEGER DEFAULT 0,
                times_petted INTEGER DEFAULT 0,
                keyboard_incidents INTEGER DEFAULT 0
            );

            INSERT INTO stats (id, times_fed, times_litter_cleaned, times_played, times_petted, keyboard_incidents)
            VALUES (1, 0, 0, 0, 0, 0);
        `;
        this.db.run(schema);
        this.persist();
    }

    persist() {
        if (!this.db) return;
        try {
            const binary = this.db.export();
            let binaryString = '';
            const chunkSize = 8192;
            for (let i = 0; i < binary.length; i += chunkSize) {
                const chunk = binary.subarray(i, i + chunkSize);
                binaryString += String.fromCharCode.apply(null, chunk);
            }
            localStorage.setItem(this.STORAGE_KEY, btoa(binaryString));
        } catch (e) {
            console.warn('No se pudo guardar la base de datos en localStorage:', e);
        }
    }

    async saveScore(payload) {
        await this.init();

        const playerName = payload.player_name || 'Pam';
        const thesisProgress = payload.thesis_progress || 0;
        const timeSeconds = payload.time_seconds || 0;
        const chapterReached = payload.chapter_reached || 1;
        const won = payload.won ? 1 : 0;
        const catsAttended = payload.cats_attended || 0;

        const fed = payload.stats?.fed || 0;
        const litter = payload.stats?.litter || 0;
        const played = payload.stats?.played || 0;
        const petted = payload.stats?.petted || 0;
        const keyboard = payload.stats?.keyboard_incidents || 0;

        try {
            // Insertar o actualizar jugador
            this.db.run(`INSERT OR IGNORE INTO players (username) VALUES (?)`, [playerName]);

            // Insertar score
            this.db.run(`
                INSERT INTO scores (player_name, thesis_progress, time_seconds, chapter_reached, won, cats_attended)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [playerName, thesisProgress, timeSeconds, chapterReached, won, catsAttended]);

            // Actualizar estadísticas acumuladas
            this.db.run(`
                UPDATE stats 
                SET times_fed = times_fed + ?,
                    times_litter_cleaned = times_litter_cleaned + ?,
                    times_played = times_played + ?,
                    times_petted = times_petted + ?,
                    keyboard_incidents = keyboard_incidents + ?
                WHERE id = 1
            `, [fed, litter, played, petted, keyboard]);

            this.persist();
            return { success: true };
        } catch (err) {
            console.error('Error al guardar score en SQLite:', err);
            return { success: false, error: err.message };
        }
    }

    async getLeaderboard() {
        await this.init();
        try {
            // Victorias ordenadas por menor tiempo
            const stmtWins = this.db.prepare(`
                SELECT player_name, time_seconds, thesis_progress, chapter_reached, cats_attended, created_at
                FROM scores
                WHERE won = 1
                ORDER BY time_seconds ASC
                LIMIT 10
            `);

            const leaderboard = [];
            while (stmtWins.step()) {
                leaderboard.push(stmtWins.getAsObject());
            }
            stmtWins.free();

            return { success: true, leaderboard };
        } catch (err) {
            console.error('Error al consultar leaderboard en SQLite:', err);
            return { success: true, leaderboard: [] };
        }
    }

    async getStats() {
        await this.init();
        try {
            const stmtStats = this.db.prepare(`SELECT * FROM stats WHERE id = 1`);
            let stats = {};
            if (stmtStats.step()) {
                stats = stmtStats.getAsObject();
            }
            stmtStats.free();

            const stmtTotals = this.db.prepare(`
                SELECT 
                    COUNT(*) as total_games,
                    SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as total_wins,
                    SUM(cats_attended) as total_cats_attended
                FROM scores
            `);
            let totals = {};
            if (stmtTotals.step()) {
                totals = stmtTotals.getAsObject();
            }
            stmtTotals.free();

            return { success: true, stats, totals };
        } catch (err) {
            console.error('Error al consultar stats en SQLite:', err);
            return { success: true, stats: {}, totals: {} };
        }
    }

    // Permite al jugador descargar su archivo .sqlite real a su computadora
    downloadDatabaseFile() {
        if (!this.db) return;
        const binary = this.db.export();
        const blob = new Blob([binary], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pamroomcats.sqlite';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export const SQLiteDB = new SQLiteManager();
