// src/scenes/GameOverScene.js - Pantalla de Derrota con botones profesionales
import { createProButton } from '../ui/Button.js';

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
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a0505, 0.85);

        const panel = this.add.graphics();
        panel.fillStyle(0x281218, 0.96);
        if (panel.fillRoundedRect) {
            panel.fillRoundedRect(width / 2 - 300, height / 2 - 220, 600, 440, 20);
            panel.lineStyle(3, 0xf44336, 0.9);
            panel.strokeRoundedRect(width / 2 - 300, height / 2 - 220, 600, 440, 20);
        } else {
            panel.fillRect(width / 2 - 300, height / 2 - 220, 600, 440);
        }

        this.add.text(width / 2, height / 2 - 170, '¡UN MICHI SE SINTIÓ ABANDONADO!', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            letterSpacing: 1.5,
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
            `Progreso de la tesis: ${pct}%\n` +
            `Capítulo alcanzado: Capítulo ${chap}\n` +
            `Tiempo resistido: ${m}:${s}\n` +
            `Michis atendidos: ${this.results.cats_attended || 0}\n\n` +
            `Consejo: No dejes que la barra de atención de los michis baje a cero.\n` +
            `Tus estadísticas han quedado guardadas en tu historial.`;

        this.add.text(width / 2, height / 2 + 10, summaryText, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            lineSpacing: 8,
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Botón 1: Reintentar Tesis
        createProButton(this, {
            x: width / 2 - 130,
            y: height / 2 + 165,
            text: 'REINTENTAR',
            color: 0xc2185b,
            hoverColor: 0xe91e63,
            strokeColor: 0xf48fb1,
            width: 220,
            height: 44,
            fontSize: '15px',
            onClick: () => {
                this.scene.start('GameScene', { playerName: this.results.player_name });
                this.scene.launch('UIScene');
            }
        });

        // Botón 2: Menú Principal
        createProButton(this, {
            x: width / 2 + 130,
            y: height / 2 + 165,
            text: 'MENÚ PRINCIPAL',
            color: 0x37474f,
            hoverColor: 0x455a64,
            strokeColor: 0xb0bec5,
            width: 220,
            height: 44,
            fontSize: '15px',
            onClick: () => {
                this.scene.start('MenuScene');
            }
        });
    }
}
