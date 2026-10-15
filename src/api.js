// src/api.js - Adaptador hacia SQLite WebAssembly (Sin necesidad de PHP/XAMPP)
import { SQLiteDB } from './sqlite-db.js';

export const DatabaseAPI = {
    async getStats() {
        return await SQLiteDB.getStats();
    },

    async getLeaderboard() {
        return await SQLiteDB.getLeaderboard();
    },

    async saveScore(payload) {
        return await SQLiteDB.saveScore(payload);
    },

    downloadDatabaseFile() {
        SQLiteDB.downloadDatabaseFile();
    }
};
