// src/scenes/WinScene.js - Pantalla de victoria al completar el 100% de la tesis
import { createProButton } from '../ui/Button.js';

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
        this.add.rectangle(width / 2, height / 2, width, height, 0x120c1f, 0.78);

        // Panel de Victoria
        const panel = this.add.graphics();
        panel.fillStyle(0x211636, 0.96);
        if (panel.fillRoundedRect) {
            panel.fillRoundedRect(width / 2 - 310, height / 2 - 230, 620, 460, 20);
            panel.lineStyle(3, 0x00e676, 0.9);
            panel.strokeRoundedRect(width / 2 - 310, height / 2 - 230, 620, 460, 20);
        } else {
            panel.fillRect(width / 2 - 310, height / 2 - 230, 620, 460);
        }

        // Título de Victoria
        this.add.text(width / 2, height / 2 - 180, '¡TESIS ENTREGADA CON ÉXITO!', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            letterSpacing: 1.5,
            fill: '#00e676',
            stroke: '#003300',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 140, '¡Felicidades! Lograste graduarte cuidando con amor a todos tus michis.', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Michis y Pam festejando
        this.add.image(width / 2 - 150, height / 2 - 85, 'pam_idle').setScale(1.1);
        this.add.image(width / 2 - 60, height / 2 - 60, 'cat_orange_idle').setScale(1.3);
        this.add.image(width / 2 + 30, height / 2 - 60, 'cat_black_idle').setScale(1.3);
        this.add.image(width / 2 + 110, height / 2 - 60, 'cat_white_idle').setScale(1.3);

        // Desglose de estadísticas
        const totalSec = Math.floor(this.results.time_seconds || 0);
        const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');

        const statsText = 
            `Tesista: ${this.results.player_name}\n` +
            `Tiempo récord: ${m}:${s}\n` +
            `Michis atendidos: ${this.results.cats_attended}\n` +
            `Croquetas servidas: ${this.results.stats?.fed || 0}   ` +
            `Areneros limpios: ${this.results.stats?.litter || 0}\n` +
            `Juegos compartidos: ${this.results.stats?.played || 0}   ` +
            `Caricias dadas: ${this.results.stats?.petted || 0}\n\n` +
            `¡Tu récord ha sido registrado en la tabla de honor!`;

        this.add.text(width / 2, height / 2 + 65, statsText, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            lineSpacing: 6,
            fill: '#ffdab9',
            align: 'center'
        }).setOrigin(0.5);

        // Botón 1: Jugar de nuevo
        createProButton(this, {
            x: width / 2 - 130,
            y: height / 2 + 185,
            text: 'JUGAR DE NUEVO',
            color: 0x00c853,
            hoverColor: 0x00e676,
            strokeColor: 0xb9f6ca,
            width: 220,
            height: 44,
            fontSize: '15px',
            onClick: () => {
                this.scene.start('GameScene', { playerName: this.results.player_name });
                this.scene.launch('UIScene');
            }
        });

        // Botón 2: Ver Tabla de Récords
        createProButton(this, {
            x: width / 2 + 130,
            y: height / 2 + 185,
            text: 'TABLA DE RÉCORDS',
            color: 0x1565c0,
            hoverColor: 0x1e88e5,
            strokeColor: 0x90caf9,
            width: 220,
            height: 44,
            fontSize: '15px',
            onClick: () => {
                this.scene.start('LeaderboardScene');
            }
        });
    }
}
