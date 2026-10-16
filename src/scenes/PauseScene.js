// src/scenes/PauseScene.js - Menú de Pausa profesional interactivo con sonido y animación
import { AudioSys } from '../systems/AudioSystem.js';
import { createProButton } from '../ui/Button.js';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    init(data) {
        this.playerName = data.playerName || 'Pam';
        this.thesisProgress = Math.floor(data.thesisProgress || 0);
        this.currentChapter = data.currentChapter || { name: 'Capítulo 1: Introducción' };
        this.elapsedTime = Math.floor(data.elapsedTime || 0);
        this.totalCatsAttended = data.totalCatsAttended || 0;
        this.sessionStats = data.sessionStats || {};
    }

    create() {
        const { width, height } = this.scale;

        // 1. Telón semitransparente oscuro con tinte lo-fi
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x12081f, 0.82);
        overlay.setInteractive(); // Bloquea clics al juego de fondo

        // 2. Tarjeta principal del menú de pausa
        const cardW = 500;
        const cardH = 450;
        const cardX = width / 2;
        const cardY = height / 2;

        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x201533, 0.98);
        if (cardBg.fillRoundedRect) {
            cardBg.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 18);
            cardBg.lineStyle(3, 0xff80ab, 0.9);
            cardBg.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 18);
        } else {
            cardBg.fillRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH);
        }

        // Decoración de cabecera elegante (sin emojis)
        const headerBadge = this.add.graphics();
        headerBadge.fillStyle(0x35234a, 0.95);
        if (headerBadge.fillRoundedRect) {
            headerBadge.fillRoundedRect(cardX - 85, cardY - cardH / 2 + 16, 170, 34, 10);
            headerBadge.lineStyle(2, 0xffde59, 0.9);
            headerBadge.strokeRoundedRect(cardX - 85, cardY - cardH / 2 + 16, 170, 34, 10);
        }
        this.add.text(cardX, cardY - cardH / 2 + 33, 'PAUSA', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffde59'
        }).setOrigin(0.5);

        // Subtítulo con nombre de tesista
        this.add.text(cardX, cardY - cardH / 2 + 75, `Tómate un respiro, ${this.playerName}. Los michis están descansando.`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fill: '#d1c4e9'
        }).setOrigin(0.5);

        // 3. Cuadro de resumen del estado de la tesis
        const statsBox = this.add.graphics();
        statsBox.fillStyle(0x170e26, 0.9);
        if (statsBox.fillRoundedRect) {
            statsBox.fillRoundedRect(cardX - 220, cardY - 110, 440, 105, 12);
            statsBox.lineStyle(1.5, 0x4a3563, 0.8);
            statsBox.strokeRoundedRect(cardX - 220, cardY - 110, 440, 105, 12);
        }

        const m = String(Math.floor(this.elapsedTime / 60)).padStart(2, '0');
        const s = String(this.elapsedTime % 60).padStart(2, '0');

        this.add.text(cardX - 200, cardY - 95, this.currentChapter.name || 'Capítulo 1', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ffde59'
        });

        this.add.text(cardX + 90, cardY - 95, `Tiempo: ${m}:${s}`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fill: '#b39ddb'
        });

        // Barra de progreso visual
        this.add.text(cardX - 200, cardY - 65, 'Progreso de Tesis:', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            fill: '#e0e0e0'
        });
        this.add.text(cardX + 160, cardY - 65, `${this.thesisProgress}%`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#00e676'
        });

        const barBg = this.add.rectangle(cardX, cardY - 42, 400, 10, 0x0f0919).setOrigin(0.5);
        const barFillW = Math.max(0, Math.min(400, 400 * (this.thesisProgress / 100)));
        this.add.rectangle(cardX - 200, cardY - 42, barFillW, 10, 0x00e676).setOrigin(0, 0.5);

        // Estadísticas de michis
        this.add.text(cardX, cardY - 20, `Michis atendidos: ${this.totalCatsAttended}   •   Comida: ${this.sessionStats.fed || 0}   •   Arenero: ${this.sessionStats.litter || 0}`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            fill: '#90caf9'
        }).setOrigin(0.5);

        // 4. Botones Profesionales con Animación y Sonido (Sin Emojis)
        // Botón 1: Continuar
        createProButton(this, {
            x: cardX,
            y: cardY + 45,
            text: 'CONTINUAR',
            color: 0x00c853,
            hoverColor: 0x00e676,
            strokeColor: 0xb9f6ca,
            width: 420,
            height: 44,
            fontSize: '16px',
            onClick: () => this.resumeGame()
        });

        // Botón 2: Reiniciar
        createProButton(this, {
            x: cardX - 110,
            y: cardY + 112,
            text: 'REINICIAR',
            color: 0xe65100,
            hoverColor: 0xff6d00,
            strokeColor: 0xffcc80,
            width: 195,
            height: 44,
            fontSize: '14px',
            onClick: () => this.restartGame()
        });

        // Botón 3: Alternar Sonido
        const soundLabel = AudioSys.enabled ? 'SONIDO: SÍ' : 'SONIDO: NO';
        const soundBtn = createProButton(this, {
            x: cardX + 110,
            y: cardY + 112,
            text: soundLabel,
            color: 0x4a148c,
            hoverColor: 0x6a1b9a,
            strokeColor: 0xce93d8,
            width: 195,
            height: 44,
            fontSize: '14px',
            onClick: () => {
                AudioSys.enabled = !AudioSys.enabled;
                if (!AudioSys.enabled) AudioSys.stopAmbientBgm();
                else AudioSys.startAmbientBgm();
                soundBtn.setText(AudioSys.enabled ? 'SONIDO: SÍ' : 'SONIDO: NO');
            }
        });

        // Botón 4: Volver al Menú Principal
        createProButton(this, {
            x: cardX,
            y: cardY + 175,
            text: 'MENÚ PRINCIPAL',
            color: 0x263238,
            hoverColor: 0x37474f,
            strokeColor: 0xb0bec5,
            width: 420,
            height: 44,
            fontSize: '15px',
            onClick: () => this.goToMenu()
        });

        // 5. Atajos de teclado para despausar (ESC o P)
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        this.escKey.on('down', () => this.resumeGame());
        this.pKey.on('down', () => this.resumeGame());
    }

    resumeGame() {
        this.scene.stop('PauseScene');
        this.scene.resume('GameScene');
        this.scene.resume('UIScene');
    }

    restartGame() {
        this.scene.stop('PauseScene');
        this.scene.stop('UIScene');
        this.scene.start('GameScene', { playerName: this.playerName });
    }

    goToMenu() {
        this.scene.stop('PauseScene');
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('MenuScene');
    }
}
