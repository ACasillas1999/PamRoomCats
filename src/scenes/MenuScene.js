// src/scenes/MenuScene.js - Pantalla de inicio con estética cozy y botones profesionales
import { AudioSys } from '../systems/AudioSystem.js';
import { createProButton, createProIconButton } from '../ui/Button.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Fondo de la habitación con viñeta oscura
        this.add.image(width / 2, height / 2, 'room_bg');
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1226, 0.68);

        // Escritorio y Pam tecleando animada
        const pamDeskX = 220;
        const catX = 980;

        this.add.image(pamDeskX, 420, 'desk').setScale(1.15);
        const pamMenu = this.add.image(pamDeskX, 435, 'pam_typing').setScale(1.0);
        this.time.addEvent({
            delay: 180,
            loop: true,
            callback: () => {
                const nextTex = (pamMenu.texture.key === 'pam_typing') ? 'pam_typing_alt' : 'pam_typing';
                if (this.textures.exists(nextTex)) pamMenu.setTexture(nextTex);
            }
        });

        const catOrange = this.add.image(catX, 430, 'cat_orange_idle').setScale(1.4);
        this.tweens.add({
            targets: catOrange,
            y: 425,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Título del juego elegante
        this.add.text(width / 2, 105, 'PamRoomCats', {
            fontFamily: 'Outfit, Quicksand, sans-serif',
            fontSize: '54px',
            fontStyle: 'bold',
            fill: '#ffde59',
            stroke: '#3b2554',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 4, color: '#170b24', blur: 6, fill: true }
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(width / 2, 160, 'Termina tu tesis universitaria mientras cuidas a tus michis', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '17px',
            fill: '#ffffff',
            stroke: '#2c1e3d',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Panel de entrada para Nombre de Jugador
        const panel = this.add.graphics();
        panel.fillStyle(0x27193b, 0.94);
        if (panel.fillRoundedRect) {
            panel.fillRoundedRect(width / 2 - 210, 205, 420, 130, 16);
            panel.lineStyle(2.5, 0xffa07a, 0.9);
            panel.strokeRoundedRect(width / 2 - 210, 205, 420, 130, 16);
        } else {
            panel.fillRect(width / 2 - 210, 205, 420, 130);
        }

        this.add.text(width / 2, 225, 'NOMBRE DE LA TESISTA:', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            letterSpacing: 1.5,
            fill: '#ffdab9'
        }).setOrigin(0.5);

        // Guardar o recuperar nombre local
        const savedName = localStorage.getItem('pam_player_name') || 'Pam';
        const nameText = this.add.text(width / 2, 265, savedName, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#170e26',
            padding: { x: 22, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.add.text(width / 2, 312, '(Haz clic sobre tu nombre para editarlo)', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            fill: '#b39ddb'
        }).setOrigin(0.5);

        nameText.on('pointerover', () => {
            AudioSys.playHover();
            nameText.setScale(1.05);
        });
        nameText.on('pointerout', () => {
            nameText.setScale(1.0);
        });
        nameText.on('pointerdown', () => {
            AudioSys.playClick();
            const newName = prompt('Introduce el nombre de la tesista:', savedName);
            if (newName && newName.trim().length > 0) {
                const clean = newName.trim().substring(0, 18);
                localStorage.setItem('pam_player_name', clean);
                nameText.setText(clean);
            }
        });

        // Botón 1: Comenzar Tesis
        createProButton(this, {
            x: width / 2,
            y: 382,
            text: 'COMENZAR TESIS',
            color: 0x00c853,
            hoverColor: 0x00e676,
            strokeColor: 0xb9f6ca,
            width: 360,
            height: 50,
            fontSize: '17px',
            onClick: () => {
                AudioSys.init();
                AudioSys.playSuccess();
                AudioSys.startAmbientBgm();
                const playerName = localStorage.getItem('pam_player_name') || 'Pam';
                this.scene.start('GameScene', { playerName });
                this.scene.launch('UIScene');
            }
        });

        // Botón 2: Ver Récords (Sin mención de SQLite)
        createProButton(this, {
            x: width / 2 - 110,
            y: 450,
            text: 'MEJORES RÉCORDS',
            color: 0x1565c0,
            hoverColor: 0x1e88e5,
            strokeColor: 0x90caf9,
            width: 210,
            height: 44,
            fontSize: '14px',
            onClick: () => {
                AudioSys.init();
                this.scene.start('LeaderboardScene');
            }
        });

        // Botón 3: Cómo Jugar
        createProButton(this, {
            x: width / 2 + 110,
            y: 450,
            text: 'CÓMO JUGAR',
            color: 0x6a1b9a,
            hoverColor: 0x8e24aa,
            strokeColor: 0xce93d8,
            width: 210,
            height: 44,
            fontSize: '14px',
            onClick: () => {
                AudioSys.init();
                this.showHelpModal();
            }
        });

        // Botones superiores de pantalla completa y sonido
        createProIconButton(this, {
            x: width - 68,
            y: 34,
            iconKey: AudioSys.enabled ? 'ui_icon_sound_on' : 'ui_icon_sound_off',
            radius: 16,
            bgColor: 0x2b1c42,
            strokeColor: 0xff80ab,
            onClick: (icon, container) => {
                AudioSys.enabled = !AudioSys.enabled;
                icon.setTexture(AudioSys.enabled ? 'ui_icon_sound_on' : 'ui_icon_sound_off');
                if (!AudioSys.enabled) AudioSys.stopAmbientBgm();
                else AudioSys.startAmbientBgm();
            }
        });

        createProIconButton(this, {
            x: width - 28,
            y: 34,
            iconKey: 'ui_icon_fullscreen',
            radius: 16,
            bgColor: 0x2b1c42,
            strokeColor: 0x80cbc4,
            onClick: () => {
                if (window.toggleFullScreen) window.toggleFullScreen();
            }
        });
    }

    showHelpModal() {
        const { width, height } = this.scale;
        const modalContainer = this.add.container(0, 0);

        const dimmer = this.add.rectangle(width / 2, height / 2, width, height, 0x0c0717, 0.78);
        dimmer.setInteractive();

        const box = this.add.graphics();
        box.fillStyle(0x211433, 0.98);
        if (box.fillRoundedRect) {
            box.fillRoundedRect(width / 2 - 280, height / 2 - 200, 560, 400, 18);
            box.lineStyle(3, 0xffa07a, 0.9);
            box.strokeRoundedRect(width / 2 - 280, height / 2 - 200, 560, 400, 18);
        }

        const title = this.add.text(width / 2, height / 2 - 155, 'GUÍA DE JUEGO', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            letterSpacing: 2,
            fill: '#ffde59'
        }).setOrigin(0.5);

        const content = this.add.text(width / 2, height / 2 - 15, 
            '1. Siéntate en la computadora para redactar y avanzar la tesis.\n' +
            '2. Los michis pedirán comida, arenero limpio, estambre o caricias.\n' +
            '3. Toca la estación para tomar un objeto o el suelo/D-Pad para moverte.\n' +
            '4. Toca al michi para atenderlo antes de que su paciencia termine.\n' +
            '5. Si un michi se sube a tu laptop, toca el escritorio para ahuyentarlo.\n' +
            '6. ¡Ganas al completar el 100% de la tesis! Tus récords quedan guardados.\n' +
            '• Controles móviles: Usa el D-Pad táctil en pantalla o toca el suelo para caminar.', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            lineSpacing: 8,
            fill: '#ffffff',
            align: 'left'
        }).setOrigin(0.5);

        modalContainer.add([dimmer, box, title, content]);

        createProButton(this, {
            x: width / 2,
            y: height / 2 + 150,
            text: 'ENTENDIDO',
            color: 0xd81b60,
            hoverColor: 0xf06292,
            strokeColor: 0xff80ab,
            width: 180,
            height: 42,
            fontSize: '15px',
            onClick: () => {
                modalContainer.destroy();
            }
        });
    }
}
