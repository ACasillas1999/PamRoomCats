// src/scenes/MenuScene.js - Pantalla de inicio con estética cozy y conexión SQLite
import { AudioSys } from '../systems/AudioSystem.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Fondo de la habitación con viñeta oscura
        this.add.image(width / 2, height / 2, 'room_bg');
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1226, 0.65);

        // Escritorio y michi decorativo
        this.add.image(180, 420, 'desk').setScale(1.2);
        this.add.image(180, 400, 'pam_typing').setScale(1.2);
        const catOrange = this.add.image(750, 430, 'cat_orange_idle').setScale(1.4);
        this.tweens.add({
            targets: catOrange,
            y: 425,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Título del juego
        const titleText = this.add.text(width / 2, 110, '🐱 PamRoomCats 💻', {
            fontFamily: 'Outfit, Quicksand, sans-serif',
            fontSize: '52px',
            fontStyle: 'bold',
            fill: '#ffde59',
            stroke: '#3b2554',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 4, color: '#170b24', blur: 6, fill: true }
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(width / 2, 165, '¡Termina tu tesis universitaria mientras cuidas a tus michis!', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#2c1e3d',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Panel de entrada para Nombre de Jugador (para SQLite)
        const panel = this.add.rectangle(width / 2, 270, 420, 140, 0x2d1f42, 0.9);
        panel.setStrokeStyle(3, 0xffa07a);

        this.add.text(width / 2, 225, 'NOMBRE DEL TESISTA:', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ffdab9'
        }).setOrigin(0.5);

        // Guardar o recuperar nombre local
        const savedName = localStorage.getItem('pam_player_name') || 'Pam';
        const nameText = this.add.text(width / 2, 265, `📝 ${savedName}`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1c132b',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.add.text(width / 2, 315, '(Haz clic sobre tu nombre para cambiarlo)', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            fill: '#b39ddb'
        }).setOrigin(0.5);

        nameText.on('pointerdown', () => {
            const newName = prompt('Introduce el nombre de la tesista:', savedName);
            if (newName && newName.trim().length > 0) {
                const clean = newName.trim().substring(0, 18);
                localStorage.setItem('pam_player_name', clean);
                nameText.setText(`📝 ${clean}`);
            }
        });

        // Botón Jugar / Comenzar Tesis
        this.createButton(width / 2, 385, '🎓 COMENZAR TESIS', 0x4caf50, () => {
            AudioSys.init();
            AudioSys.playSuccess();
            AudioSys.startAmbientBgm();
            const playerName = localStorage.getItem('pam_player_name') || 'Pam';
            this.scene.start('GameScene', { playerName });
            this.scene.launch('UIScene');
        });

        // Botón Ver Leaderboard (SQLite)
        this.createButton(width / 2 - 130, 465, '🏆 Récords SQLite', 0x2196f3, () => {
            AudioSys.init();
            AudioSys.playPurr();
            this.scene.start('LeaderboardScene');
        }, 220);

        // Botón Cómo Jugar
        this.createButton(width / 2 + 130, 465, '📖 Cómo Jugar', 0x9c27b0, () => {
            AudioSys.init();
            this.showHelpModal();
        }, 220);

        // Control de sonido en esquina
        const soundBtn = this.add.text(width - 40, 30, AudioSys.enabled ? '🔊' : '🔇', {
            fontSize: '26px'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        soundBtn.on('pointerdown', () => {
            AudioSys.enabled = !AudioSys.enabled;
            soundBtn.setText(AudioSys.enabled ? '🔊' : '🔇');
            if (!AudioSys.enabled) AudioSys.stopAmbientBgm();
        });
    }

    createButton(x, y, text, color, onClick, customWidth = 320) {
        const bg = this.add.rectangle(x, y, customWidth, 50, color, 1).setOrigin(0.5);
        bg.setStrokeStyle(3, 0xffffff);

        const label = this.add.text(x, y, text, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '18px',
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

        return { bg, label };
    }

    showHelpModal() {
        const { width, height } = this.scale;
        const modalContainer = this.add.container(0, 0);

        const dimmer = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        dimmer.setInteractive();

        const box = this.add.rectangle(width / 2, height / 2, 600, 420, 0x241838, 0.98);
        box.setStrokeStyle(4, 0xffa07a);

        const title = this.add.text(width / 2, height / 2 - 170, '📖 GUÍA RÁPIDA DE PAM', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffde59'
        }).setOrigin(0.5);

        const content = this.add.text(width / 2, height / 2 - 10, 
            '1. 💻 Siéntate en la computadora para que la tesis avance.\n' +
            '2. 🐱 Los michis pedirán comida (🍗), arenero (🚽), juego (🧶) o cariño (❤️).\n' +
            '3. 🏃 Camina a la estación correspondiente para tomar el objeto.\n' +
            '4. 🐈 Lleva el objeto al gato antes de que su barra de atención se vacíe.\n' +
            '5. ⌨️ ¡Cuidado si un gato se sube al teclado! Te borrará el avance.\n' +
            '6. 🎓 ¡Ganas al alcanzar el 100% de la tesis! Tus récords se guardan en SQLite.', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            lineSpacing: 8,
            fill: '#ffffff',
            align: 'left'
        }).setOrigin(0.5);

        const closeBtn = this.add.rectangle(width / 2, height / 2 + 160, 160, 40, 0xe91e63).setInteractive({ useHandCursor: true });
        const closeText = this.add.text(width / 2, height / 2 + 160, '¡ENTENDIDO!', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        closeBtn.on('pointerdown', () => {
            modalContainer.destroy();
        });

        modalContainer.add([dimmer, box, title, content, closeBtn, closeText]);
    }
}
