-- Esquema de base de datos SQLite para PamRoomCats
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
    won BOOLEAN NOT NULL,
    cats_attended INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    times_fed INTEGER DEFAULT 0,
    times_litter_cleaned INTEGER DEFAULT 0,
    times_played INTEGER DEFAULT 0,
    times_petted INTEGER DEFAULT 0,
    keyboard_incidents INTEGER DEFAULT 0
);

-- Insertar fila inicial de estadísticas si no existe
INSERT INTO stats (id, times_fed, times_litter_cleaned, times_played, times_petted, keyboard_incidents)
SELECT 1, 0, 0, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM stats WHERE id = 1);
