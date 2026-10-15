// src/scenes/LeaderboardScene.js - Consulta en tiempo real de la base de datos SQLite
import { DatabaseAPI } from '../api.js';

export class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'room_bg');
        this.add.rectangle(width / 2, height / 2, width, height, 0x181024, 0.85);

        // Panel Principal
        const panel = this.add.rectangle(width / 2, height / 2, 780, 500, 0x241838, 0.95);
        panel.setStrokeStyle(3, 0x2196f3);

        // Título
        this.add.text(width / 2, 85, '🏆 TABLA DE RÉCORDS (SQLITE) 📊', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            fill: '#ffde59',
            stroke: '#1a102b',
            strokeThickness: 5
        }).setOrigin(0.5);

        // Contenedor dinámico de datos
        this.dataContainer = this.add.container(0, 0);

        // Botón Volver al Menú
        const backBg = this.add.rectangle(120, 85, 120, 36, 0x546e7a).setInteractive({ useHandCursor: true });
        this.add.text(120, 85, '⬅️ Volver', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        backBg.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Botón Descargar archivo pamroomcats.sqlite
        const downloadBg = this.add.rectangle(width - 150, 85, 200, 36, 0x2e7d32).setInteractive({ useHandCursor: true });
        this.add.text(width - 150, 85, '💾 Descargar .sqlite', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        downloadBg.on('pointerdown', () => {
            DatabaseAPI.downloadDatabaseFile();
        });

        // Cargar datos desde SQLite
        this.loadData();
    }

    async loadData() {
        const { width } = this.scale;
        this.dataContainer.removeAll(true);

        const loadingText = this.add.text(width / 2, 280, 'Cargando datos desde SQLite...', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '16px',
            fill: '#80cbc4'
        }).setOrigin(0.5);
        this.dataContainer.add(loadingText);

        const [lbData, statsData] = await Promise.all([
            DatabaseAPI.getLeaderboard(),
            DatabaseAPI.getStats()
        ]);

        loadingText.destroy();

        // 1. Mostrar Top Victorias (Columna izquierda)
        this.add.text(240, 140, '🥇 TOP TESIS ENTREGADAS', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '17px',
            fontStyle: 'bold',
            fill: '#00e676'
        }).setOrigin(0.5);

        const list = lbData.leaderboard || [];
        if (list.length === 0) {
            const noData = this.add.text(240, 240, 'Aún no hay tesis entregadas.\n¡Sé el primero en completar el 100%!', {
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                fill: '#b0bec5',
                align: 'center'
            }).setOrigin(0.5);
            this.dataContainer.add(noData);
        } else {
            list.slice(0, 7).forEach((row, idx) => {
                const totalSec = Math.floor(row.time_seconds);
                const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
                const s = String(totalSec % 60).padStart(2, '0');
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;

                const entry = this.add.text(110, 175 + idx * 36, `${medal} ${row.player_name} — ⏱️ ${m}:${s} (${row.cats_attended} michis)`, {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '14px',
                    fontStyle: 'bold',
                    fill: idx < 3 ? '#ffeb3b' : '#ffffff'
                });
                this.dataContainer.add(entry);
            });
        }

        // 2. Mostrar Estadísticas Globales Acumuladas (Columna derecha)
        this.add.text(620, 140, '📈 ESTADÍSTICAS GLOBALES', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '17px',
            fontStyle: 'bold',
            fill: '#29b6f6'
        }).setOrigin(0.5);

        const st = statsData.stats || {};
        const tot = statsData.totals || {};

        const statsBox = this.add.rectangle(620, 280, 260, 230, 0x1b1329, 0.9);
        statsBox.setStrokeStyle(2, 0x4fc3f7);
        this.dataContainer.add(statsBox);

        const statsText = 
            `🎮 Partidas jugadas: ${tot.total_games || 0}\n` +
            `🎓 Tesis concluidas: ${tot.total_wins || 0}\n` +
            `🍗 Croquetas servidas: ${st.times_fed || 0}\n` +
            `🚽 Areneros aseados: ${st.times_litter_cleaned || 0}\n` +
            `🧶 Sesiones de juego: ${st.times_played || 0}\n` +
            `❤️ Caricias dadas: ${st.times_petted || 0}\n` +
            `⌨️ Travesuras en PC: ${st.keyboard_incidents || 0}`;

        const statsLabel = this.add.text(510, 195, statsText, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            lineSpacing: 10,
            fill: '#e0f7fa'
        });
        this.dataContainer.add(statsLabel);
    }
}
