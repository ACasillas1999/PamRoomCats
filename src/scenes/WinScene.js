// src/scenes/WinScene.js - Pantalla de victoria al completar el 100% de la tesis
export class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    init(data) {
        this.results = data;
    }

    create() {
        const { width, height } = this.scale;

        // Fondo
        this.add.image(width / 2, height / 2, 'room_bg');
        this.add.rectangle(width / 2, height / 2, width, height, 0x120c1f, 0.75);

        // Panel de Victoria
        const panel = this.add.rectangle(width / 2, height / 2, 620, 460, 0x241838, 0.95);
        panel.setStrokeStyle(4, 0x00e676);

        // Título de Victoria
        this.add.text(width / 2, height / 2 - 180, '🎓 ¡TESIS ENTREGADA CON ÉXITO! 🎓', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            fill: '#00e676',
            stroke: '#003300',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 140, '¡Felicidades! Lograste graduarte sin descuidar a tus michis.', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Michis y Pam festejando
        this.add.image(width / 2 - 140, height / 2 - 70, 'pam_idle').setScale(1.3);
        this.add.image(width / 2 - 60, height / 2 - 60, 'cat_orange_idle').setScale(1.3);
        this.add.image(width / 2 + 30, height / 2 - 60, 'cat_black_idle').setScale(1.3);
        this.add.image(width / 2 + 110, height / 2 - 60, 'cat_white_idle').setScale(1.3);

        // Desglose de estadísticas
        const totalSec = Math.floor(this.results.time_seconds || 0);
        const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');

        const statsText = 
            `👤 Tesista: ${this.results.player_name}\n` +
            `⏱️ Tiempo récord: ${m}:${s}\n` +
            `🐈 Michis atendidos: ${this.results.cats_attended}\n` +
            `🍗 Croquetas servidas: ${this.results.stats?.fed || 0}   ` +
            `🚽 Areneros limpios: ${this.results.stats?.litter || 0}\n` +
            `🧶 Juegos compartidos: ${this.results.stats?.played || 0}   ` +
            `❤️ Caricias dadas: ${this.results.stats?.petted || 0}\n\n` +
            `✨ ¡Tu récord ha sido guardado exitosamente en SQLite!`;

        this.add.text(width / 2, height / 2 + 65, statsText, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            lineSpacing: 6,
            fill: '#ffdab9',
            align: 'center'
        }).setOrigin(0.5);

        // Botón Jugar de nuevo
        this.createButton(width / 2 - 140, height / 2 + 185, '🔄 Jugar de nuevo', 0x4caf50, () => {
            this.scene.start('GameScene', { playerName: this.results.player_name });
            this.scene.launch('UIScene');
        });

        // Botón Ver Leaderboard
        this.createButton(width / 2 + 140, height / 2 + 185, '🏆 Ver Récords', 0x2196f3, () => {
            this.scene.start('LeaderboardScene');
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
