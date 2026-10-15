// src/entities/Pam.js - Personaje principal y sistema de interacción
import { GameConfig } from '../config.js';
import { AudioSys } from '../systems/AudioSystem.js';

export class Pam extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;

        this.speed = GameConfig.pamSpeed;
        this.carriedItem = null; // null | 'food' | 'litter' | 'play'
        this.isWorking = false;
        this.isBusyInteracting = false;

        // Destino para movimiento por clic
        this.targetDestination = null;

        this.setupVisuals();
        scene.add.existing(this);
    }

    setupVisuals() {
        this.sprite = this.scene.add.sprite(0, 0, 'pam_idle');
        this.add(this.sprite);

        // Burbuja de objeto cargado en la mano
        this.carriedBubble = this.scene.add.container(20, -28);
        this.carriedBg = this.scene.add.circle(0, 0, 14, 0xffffff, 0.95);
        this.carriedBg.setStrokeStyle(2, 0x37474f);
        this.carriedIcon = this.scene.add.image(0, 0, 'icon_food').setScale(0.8);
        this.carriedBubble.add([this.carriedBg, this.carriedIcon]);
        this.carriedBubble.setVisible(false);
        this.add(this.carriedBubble);

        // Barra de progreso de acción (cuando alimenta, limpia o acaricia)
        this.progressBarBg = this.scene.add.rectangle(0, -38, 36, 6, 0x111111).setOrigin(0.5);
        this.progressBarFill = this.scene.add.rectangle(-17, -38, 0, 4, 0x00e676).setOrigin(0, 0.5);
        this.actionProgressGroup = this.scene.add.container(0, 0, [this.progressBarBg, this.progressBarFill]);
        this.actionProgressGroup.setVisible(false);
        this.add(this.actionProgressGroup);
    }

    update(deltaSec, cursors, wasdKeys) {
        if (this.isBusyInteracting) return;

        let vx = 0;
        let vy = 0;

        // Control por teclado
        if (cursors.left.isDown || wasdKeys.A.isDown) vx -= 1;
        if (cursors.right.isDown || wasdKeys.D.isDown) vx += 1;
        if (cursors.up.isDown || wasdKeys.W.isDown) vy -= 1;
        if (cursors.down.isDown || wasdKeys.S.isDown) vy += 1;

        if (vx !== 0 || vy !== 0) {
            // Si el jugador usa teclado, se cancela el destino del mouse
            this.targetDestination = null;
            this.leaveDesk();

            const len = Math.hypot(vx, vy);
            this.x += (vx / len) * this.speed * deltaSec;
            this.y += (vy / len) * this.speed * deltaSec;

            this.sprite.setFlipX(vx < 0);
        } else if (this.targetDestination) {
            // Movimiento suave por clic hacia un punto o estación
            const dx = this.targetDestination.x - this.x;
            const dy = this.targetDestination.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 8) {
                const moveDist = this.speed * deltaSec;
                this.x += (dx / dist) * Math.min(moveDist, dist);
                this.y += (dy / dist) * Math.min(moveDist, dist);
                this.sprite.setFlipX(dx < 0);
                this.leaveDesk();
            } else {
                // Llegó a su destino
                const callback = this.targetDestination.onArrival;
                this.targetDestination = null;
                if (callback) callback();
            }
        }

        // Delimitar dentro de las paredes de la habitación
        this.x = Phaser.Math.Clamp(this.x, 80, 880);
        this.y = Phaser.Math.Clamp(this.y, 250, 550);
    }

    setDestination(x, y, onArrival = null) {
        if (this.isBusyInteracting) return;
        this.targetDestination = { x, y, onArrival };
    }

    sitAtDesk() {
        this.isWorking = true;
        this.sprite.setTexture('pam_typing');
        this.sprite.setFlipX(false);
        this.x = 135;
        this.y = 280;
    }

    leaveDesk() {
        if (this.isWorking) {
            this.isWorking = false;
            this.sprite.setTexture('pam_idle');
        }
    }

    setCarriedItem(type) {
        this.carriedItem = type;
        if (type) {
            this.carriedIcon.setTexture(`icon_${type}`);
            this.carriedBubble.setVisible(true);
            AudioSys.playPurr();
        } else {
            this.carriedBubble.setVisible(false);
        }
    }

    performAction(durationSec, onComplete) {
        this.isBusyInteracting = true;
        this.actionProgressGroup.setVisible(true);
        this.progressBarFill.width = 0;

        let elapsed = 0;
        const timerEvent = this.scene.time.addEvent({
            delay: 50,
            repeat: Math.floor(durationSec / 0.05),
            callback: () => {
                elapsed += 0.05;
                const pct = Math.min(1, elapsed / durationSec);
                this.progressBarFill.width = 34 * pct;

                if (pct >= 1) {
                    this.actionProgressGroup.setVisible(false);
                    this.isBusyInteracting = false;
                    if (onComplete) onComplete();
                }
            }
        });
    }
}
