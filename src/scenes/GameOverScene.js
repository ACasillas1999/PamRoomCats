// src/scenes/GameOverScene.js - Pantalla de Derrota cuando la atención de un gato llega a 0
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.results = data;
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'room_bg');
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a0505, 0.82);

        const panel = this.add.rectangle(width / 2, height / 2, 600, 440, 0x2b1319, 0.95);
        panel.setStrokeStyle(4, 0xf44336);

        this.add.text(width / 2, height / 2 - 170, '😿 ¡UN MICHI SE SINTIÓ ABANDONADO! 😿', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#f44336',
            stroke: '#330000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const catName = this.results.cat_name || 'Uno de tus michis';
        this.add.text(width / 2, height / 2 - 130, `La atención de ${catName} llegó a cero. ¡Pam no pudo concentrarse!`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            fill: '#ffcdd2'
        }).setOrigin(0.5);

        // Progreso alcanzado
        const pct = Math.floor(this.results.thesis_progress || 0);
        const chap = this.results.chapter_reached || 1;
        const totalSec = Math.floor(this.results.time_seconds || 0);
        const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');

        const summaryText = 
            `📊 Progreso de la tesis: ${pct}%\n` +
            `📖 Capítulo alcanzado: Cap. ${chap}\n` +
            `⏱️ Tiempo resistido: ${m}:${s}\n` +
            `🐈 Michis atendidos: ${this.results.cats_attended || 0}\n\n` +
            `💡 Consejo: No dejes que la barra de los gatos baje del color verde.\n` +
            `Tus estadísticas han quedado registradas en SQLite.`;

        this.add.text(width / 2, height / 2 + 10, summaryText, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            lineSpacing: 8,
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Botón Reintentar
        this.createButton(width / 2 - 140, height / 2 + 165, '🔄 Reintentar Tesis', 0xe91e63, () => {
            this.scene.start('GameScene', { playerName: this.results.player_name });
            this.scene.launch('UIScene');
        });

        // Botón Menú Principal
        this.createButton(width / 2 + 140, height / 2 + 165, '🏠 Menú Principal', 0x546e7a, () => {
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, text, color, onClick) {
        const bg = this.add.rectangle(x, y, 220, 44, color, 1).setOrigin(0.5);
        bg.setStrokeStyle(2, 0xffffff);

        const label = this.add.text(x, y, text, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
            bg.setScale(1.05);
            label.setScale(1.05);
        });
        bg.on('pointerout', () => {
            bg.setScale(1);
            label.setScale(1);
        });
        bg.on('pointerdown', onClick);
    }
}
