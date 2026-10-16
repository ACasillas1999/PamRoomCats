// src/scenes/UIScene.js - Interfaz de usuario (HUD) superpuesta con botones profesionales
import { AudioSys } from '../systems/AudioSystem.js';
import { createProIconButton } from '../ui/Button.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const { width } = this.scale;

        // Contenedor superior del HUD con esquinas redondeadas
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x191026, 0.92);
        if (headerBg.fillRoundedRect) {
            headerBg.fillRoundedRect(16, 8, width - 32, 44, 12);
            headerBg.lineStyle(2, 0xffa07a, 0.85);
            headerBg.strokeRoundedRect(16, 8, width - 32, 44, 12);
        } else {
            headerBg.fillRect(16, 8, width - 32, 44);
        }

        // 1. Título y Barra de la Tesis (sin emojis)
        this.add.text(32, 21, 'TESIS:', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#ffde59'
        });

        this.barBg = this.add.rectangle(85, 30, 180, 14, 0x0d0717).setOrigin(0, 0.5);
        this.barFill = this.add.rectangle(85, 30, 0, 14, 0x00e676).setOrigin(0, 0.5);
        this.pctText = this.add.text(272, 21, '0%', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#ffffff'
        });

        // 2. Capítulo actual
        this.chapterBadge = this.add.text(width / 2 - 25, 21, 'Capítulo 1: Introducción', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#80cbc4'
        }).setOrigin(0.5, 0);

        // 3. Ranura del objeto en mano
        this.itemSlotBg = this.add.circle(width - 255, 30, 14, 0x2e1e3b);
        this.itemSlotBg.setStrokeStyle(1.5, 0xffffff, 0.8);
        this.itemSlotIcon = this.add.image(width - 255, 30, 'icon_food').setScale(0.65).setVisible(false);
        this.itemSlotLabel = this.add.text(width - 235, 22, 'Libre', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            fill: '#b0bec5'
        });

        // 4. Temporizador de partida
        this.timeText = this.add.text(width - 180, 21, 'TIEMPO 00:00', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            fill: '#ffffff'
        });

        // 5. Botones de acción profesionales: Pausa, Sonido y Pantalla Completa
        this.pauseBtn = createProIconButton(this, {
            x: width - 88,
            y: 30,
            iconKey: 'ui_icon_pause',
            radius: 14,
            bgColor: 0x2b1c42,
            strokeColor: 0xffde59,
            onClick: () => {
                const gameScene = this.scene.get('GameScene');
                if (gameScene && gameScene.pauseGame) {
                    gameScene.pauseGame();
                }
            }
        });

        this.soundBtn = createProIconButton(this, {
            x: width - 54,
            y: 30,
            iconKey: AudioSys.enabled ? 'ui_icon_sound_on' : 'ui_icon_sound_off',
            radius: 14,
            bgColor: 0x2b1c42,
            strokeColor: 0xff80ab,
            onClick: (icon) => {
                AudioSys.enabled = !AudioSys.enabled;
                this.soundBtn.setIcon(AudioSys.enabled ? 'ui_icon_sound_on' : 'ui_icon_sound_off');
                if (!AudioSys.enabled) AudioSys.stopAmbientBgm();
                else AudioSys.startAmbientBgm();
            }
        });

        this.fsBtn = createProIconButton(this, {
            x: width - 20,
            y: 30,
            iconKey: 'ui_icon_fullscreen',
            radius: 14,
            bgColor: 0x2b1c42,
            strokeColor: 0x80cbc4,
            onClick: () => {
                if (window.toggleFullScreen) window.toggleFullScreen();
            }
        });

        // 6. Alerta de gato en teclado
        this.alertBanner = this.add.container(width / 2, 75);
        const alertBg = this.add.rectangle(0, 0, 480, 32, 0xd32f2f, 0.95);
        alertBg.setStrokeStyle(2, 0xffeb3b);
        const alertText = this.add.text(0, 0, '¡UN MICHI ESTÁ EN EL TECLADO! ¡HAZ CLIC EN EL ESCRITORIO!', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.alertBanner.add([alertBg, alertText]);
        this.alertBanner.setVisible(false);

        // Escuchar eventos desde GameScene
        this.events.on('updateHUD', this.handleUpdateHUD, this);
        this.events.on('chapterBanner', this.showChapterBanner, this);
    }

    getTouchInput() {
        return { up: false, down: false, left: false, right: false };
    }

    handleUpdateHUD(data) {
        // 1. Actualizar barra de progreso de tesis
        const pct = Math.min(100, data.progress);
        this.barFill.width = 180 * (pct / 100);
        this.pctText.setText(`${Math.floor(pct)}%`);

        // 2. Actualizar capítulo
        if (data.chapter) {
            this.chapterBadge.setText(data.chapter.name);
        }

        // 3. Formatear tiempo mm:ss
        const totalSec = Math.floor(data.time);
        const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        this.timeText.setText(`TIEMPO ${m}:${s}`);

        // 4. Mostrar objeto en mano
        if (data.carriedItem) {
            this.itemSlotIcon.setTexture(`icon_${data.carriedItem}`).setVisible(true);
            const labels = { food: 'Croquetas', litter: 'Arenero', play: 'Estambre' };
            this.itemSlotLabel.setText(labels[data.carriedItem] || data.carriedItem);
            this.itemSlotLabel.setFill('#ffeb3b');
        } else {
            this.itemSlotIcon.setVisible(false);
            this.itemSlotLabel.setText('Libre');
            this.itemSlotLabel.setFill('#b0bec5');
        }

        // 5. Alerta de teclado
        this.alertBanner.setVisible(data.catOnDesk);
    }

    showChapterBanner(chapterName) {
        const { width, height } = this.scale;
        const banner = this.add.container(width / 2, height / 2 - 50);

        const bg = this.add.rectangle(0, 0, 520, 60, 0x1f1430, 0.95);
        bg.setStrokeStyle(3, 0xffde59);

        const text = this.add.text(0, 0, `¡INICIA: ${chapterName.toUpperCase()}!`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            fill: '#ffde59'
        }).setOrigin(0.5);

        banner.add([bg, text]);
        banner.setScale(0);

        this.tweens.add({
            targets: banner,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2200, () => {
                    this.tweens.add({
                        targets: banner,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => banner.destroy()
                    });
                });
            }
        });
    }
}
