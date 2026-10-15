// src/scenes/UIScene.js - Interfaz de usuario (HUD) superpuesta
import { AudioSys } from '../systems/AudioSystem.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const { width } = this.scale;

        // Contenedor superior del HUD
        const headerBg = this.add.rectangle(width / 2, 28, width - 40, 48, 0x1f1430, 0.88);
        headerBg.setStrokeStyle(2, 0xffa07a);

        // 1. Título y Barra de la Tesis
        this.add.text(35, 18, '🎓 TESIS:', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#ffde59'
        });

        this.barBg = this.add.rectangle(150, 28, 220, 16, 0x111111).setOrigin(0, 0.5);
        this.barFill = this.add.rectangle(150, 28, 0, 16, 0x00e676).setOrigin(0, 0.5);
        this.pctText = this.add.text(380, 20, '0%', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#ffffff'
        });

        // 2. Capítulo actual
        this.chapterBadge = this.add.text(width / 2 + 50, 20, 'Cap. 1: Introducción', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#80cbc4'
        }).setOrigin(0.5, 0);

        // 3. Temporizador de partida
        this.timeText = this.add.text(width - 240, 20, '⏱️ 00:00', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ffffff'
        });

        // 4. Ranura del objeto en mano
        this.itemSlotBg = this.add.circle(width - 130, 28, 16, 0x392b47);
        this.itemSlotBg.setStrokeStyle(2, 0xffffff);
        this.itemSlotIcon = this.add.image(width - 130, 28, 'icon_food').setScale(0.7).setVisible(false);
        this.itemSlotLabel = this.add.text(width - 105, 20, 'Manos vacías', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '11px',
            fill: '#b0bec5'
        });

        // 5. Botón de sonido
        this.soundBtn = this.add.text(width - 45, 18, AudioSys.enabled ? '🔊' : '🔇', {
            fontSize: '20px'
        }).setInteractive({ useHandCursor: true });

        this.soundBtn.on('pointerdown', () => {
            AudioSys.enabled = !AudioSys.enabled;
            this.soundBtn.setText(AudioSys.enabled ? '🔊' : '🔇');
            if (!AudioSys.enabled) AudioSys.stopAmbientBgm();
            else AudioSys.startAmbientBgm();
        });

        // 6. Alerta de gato en teclado
        this.alertBanner = this.add.container(width / 2, 75);
        const alertBg = this.add.rectangle(0, 0, 480, 32, 0xd32f2f, 0.95);
        alertBg.setStrokeStyle(2, 0xffeb3b);
        const alertText = this.add.text(0, 0, '⚠️ ¡UN MICHI ESTÁ EN EL TECLADO! ¡HAZ CLIC EN LA PC!', {
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

    handleUpdateHUD(data) {
        // 1. Actualizar barra de progreso de tesis
        const pct = Math.min(100, data.progress);
        this.barFill.width = 220 * (pct / 100);
        this.pctText.setText(`${Math.floor(pct)}%`);

        // 2. Actualizar capítulo
        if (data.chapter) {
            this.chapterBadge.setText(data.chapter.name);
        }

        // 3. Formatear tiempo mm:ss
        const totalSec = Math.floor(data.time);
        const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        this.timeText.setText(`⏱️ ${m}:${s}`);

        // 4. Mostrar objeto en mano
        if (data.carriedItem) {
            this.itemSlotIcon.setTexture(`icon_${data.carriedItem}`).setVisible(true);
            const labels = { food: 'Croquetas', litter: 'Arenero', play: 'Estambre' };
            this.itemSlotLabel.setText(labels[data.carriedItem] || data.carriedItem);
            this.itemSlotLabel.setFill('#ffeb3b');
        } else {
            this.itemSlotIcon.setVisible(false);
            this.itemSlotLabel.setText('Manos libres');
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
        const txt = this.add.text(0, 0, `🎉 ¡AVANZASTE A ${chapterName.toUpperCase()}!`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffde59'
        }).setOrigin(0.5);

        banner.add([bg, txt]);
        banner.setScale(0);

        this.tweens.add({
            targets: banner,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1600, () => {
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
