// src/scenes/LeaderboardScene.js - Consulta y presentación de las mejores marcas y estadísticas
import { DatabaseAPI } from '../api.js';
import { createProButton } from '../ui/Button.js';

export class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'room_bg');
        this.add.rectangle(width / 2, height / 2, width, height, 0x181024, 0.88);

        // Panel Principal
        const panel = this.add.graphics();
        panel.fillStyle(0x221636, 0.96);
        if (panel.fillRoundedRect) {
            panel.fillRoundedRect(width / 2 - 390, height / 2 - 250, 780, 500, 20);
            panel.lineStyle(3, 0x1e88e5, 0.85);
            panel.strokeRoundedRect(width / 2 - 390, height / 2 - 250, 780, 500, 20);
        } else {
            panel.fillRect(width / 2 - 390, height / 2 - 250, 780, 500);
        }

        // Título limpio y elegante
        this.add.text(width / 2, 82, 'TABLA DE RÉCORDS', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            letterSpacing: 2,
            fill: '#ffde59',
            stroke: '#1a102b',
            strokeThickness: 5
        }).setOrigin(0.5);

        // Contenedor dinámico de datos
        this.dataContainer = this.add.container(0, 0);

        // Botón Volver al Menú
        createProButton(this, {
            x: 140,
            y: 82,
            text: 'VOLVER AL MENÚ',
            color: 0x37474f,
            hoverColor: 0x455a64,
            strokeColor: 0x90a4ae,
            width: 160,
            height: 38,
            fontSize: '13px',
            onClick: () => {
                this.scene.start('MenuScene');
            }
        });

        // Botón Descargar Copia Local de Partida
        createProButton(this, {
            x: width - 150,
            y: 82,
            text: 'GUARDAR COPIA',
            color: 0x2e7d32,
            hoverColor: 0x388e3c,
            strokeColor: 0xa5d6a7,
            width: 160,
            height: 38,
            fontSize: '13px',
            onClick: () => {
                DatabaseAPI.downloadDatabaseFile();
            }
        });

        // Cargar datos
        this.loadData();
    }

    async loadData() {
        const { width } = this.scale;
        this.dataContainer.removeAll(true);

        const loadingText = this.add.text(width / 2, 280, 'Cargando mejores marcas...', {
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
        this.add.text(250, 140, 'TOP TESIS ENTREGADAS', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            letterSpacing: 1,
            fill: '#00e676'
        }).setOrigin(0.5);

        const list = lbData.leaderboard || [];
        if (list.length === 0) {
            const noData = this.add.text(250, 240, 'Aún no hay tesis entregadas.\n¡Sé el primero en completar el 100%!', {
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

                const entry = this.add.text(120, 175 + idx * 36, `${idx + 1}. ${row.player_name} — ${m}:${s} (${row.cats_attended} michis)`, {
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '14px',
                    fontStyle: 'bold',
                    fill: idx === 0 ? '#ffeb3b' : (idx < 3 ? '#80cbc4' : '#ffffff')
                });
                this.dataContainer.add(entry);
            });
        }

        // 2. Mostrar Estadísticas Globales Acumuladas (Columna derecha)
        this.add.text(620, 140, 'ESTADÍSTICAS GLOBALES', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            letterSpacing: 1,
            fill: '#29b6f6'
        }).setOrigin(0.5);

        const st = statsData.stats || {};
        const tot = statsData.totals || {};

        const statsBox = this.add.graphics();
        statsBox.fillStyle(0x191026, 0.92);
        if (statsBox.fillRoundedRect) {
            statsBox.fillRoundedRect(490, 168, 260, 240, 14);
            statsBox.lineStyle(1.5, 0x4fc3f7, 0.8);
            statsBox.strokeRoundedRect(490, 168, 260, 240, 14);
        }
        this.dataContainer.add(statsBox);

        const statsText = 
            `Partidas jugadas: ${tot.total_games || 0}\n` +
            `Tesis concluidas: ${tot.total_wins || 0}\n` +
            `Croquetas servidas: ${st.times_fed || 0}\n` +
            `Areneros aseados: ${st.times_litter_cleaned || 0}\n` +
            `Sesiones de juego: ${st.times_played || 0}\n` +
            `Caricias dadas: ${st.times_petted || 0}\n` +
            `Travesuras en PC: ${st.keyboard_incidents || 0}`;

        const statsLabel = this.add.text(510, 190, statsText, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            lineSpacing: 10,
            fill: '#e0f7fa'
        });
        this.dataContainer.add(statsLabel);
    }
}
