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

        // Variables de animación
        this.walkTimer = 0;
        this.typingTimer = 0;

        // Burbuja de objeto cargado en la mano
        this.carriedBubble = this.scene.add.container(22, -22);
        this.carriedBg = this.scene.add.circle(0, 0, 14, 0xffffff, 0.95);
        this.carriedBg.setStrokeStyle(2, 0x37474f);
        this.carriedIcon = this.scene.add.image(0, 0, 'icon_food').setScale(0.8);
        this.carriedBubble.add([this.carriedBg, this.carriedIcon]);
        this.carriedBubble.setVisible(false);
        this.add(this.carriedBubble);

        // Barra de progreso de acción (cuando alimenta, limpia o acaricia)
        this.progressBarBg = this.scene.add.rectangle(0, -60, 36, 6, 0x111111).setOrigin(0.5);
        this.progressBarFill = this.scene.add.rectangle(-17, -60, 0, 4, 0x00e676).setOrigin(0, 0.5);
        this.actionProgressGroup = this.scene.add.container(0, 0, [this.progressBarBg, this.progressBarFill]);
        this.actionProgressGroup.setVisible(false);
        this.add(this.actionProgressGroup);
    }

    update(deltaSec, cursors, wasdKeys, touchInput = {}) {
        if (this.isBusyInteracting) return;

        // Si está tecleando en la laptop, alternar fotogramas de tecleo animado
        if (this.isWorking) {
            this.typingTimer += deltaSec;
            if (this.typingTimer >= 0.18) {
                this.typingTimer = 0;
                const curKey = this.sprite.texture.key;
                const nextKey = (curKey === 'pam_typing') ? 'pam_typing_alt' : 'pam_typing';
                if (this.scene.textures.exists(nextKey)) {
                    this.sprite.setTexture(nextKey);
                }
            }
        }

        let vx = 0;
        let vy = 0;
        let isMoving = false;

        // Control por teclado y D-Pad táctil móvil
        if (cursors.left.isDown || wasdKeys.A.isDown || touchInput.left) vx -= 1;
        if (cursors.right.isDown || wasdKeys.D.isDown || touchInput.right) vx += 1;
        if (cursors.up.isDown || wasdKeys.W.isDown || touchInput.up) vy -= 1;
        if (cursors.down.isDown || wasdKeys.S.isDown || touchInput.down) vy += 1;

        if (vx !== 0 || vy !== 0) {
            // Si el jugador usa teclado o D-pad, se cancela el destino del toque en suelo
            this.targetDestination = null;
            this.leaveDesk();

            const len = Math.hypot(vx, vy);
            this.x += (vx / len) * this.speed * deltaSec;
            this.y += (vy / len) * this.speed * deltaSec;

            this.sprite.setFlipX(vx < 0);
            this.carriedBubble.x = (vx < 0) ? -22 : 22;
            isMoving = true;
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
                this.carriedBubble.x = (dx < 0) ? -22 : 22;
                this.leaveDesk();
                isMoving = true;
            } else {
                // Llegó a su destino
                const callback = this.targetDestination.onArrival;
                this.targetDestination = null;
                if (callback) callback();
            }
        }

        // Animación dinámica de caminata con ciclo completo de piernas y brazos
        if (isMoving) {
            this.walkTimer += deltaSec;
            // Ciclo de 4 fotogramas cada 0.11 segundos para pasos naturales y rítmicos
            const frameIndex = (Math.floor(this.walkTimer / 0.11) % 4) + 1;
            const walkTex = `pam_walk_${frameIndex}`;
            if (this.scene.textures.exists(walkTex) && this.sprite.texture.key !== walkTex) {
                this.sprite.setTexture(walkTex);
            }
            // Sutil cadencia y amortiguación vertical de pasos
            this.sprite.y = (frameIndex === 1 || frameIndex === 3) ? 1.5 : 0;
            this.sprite.scaleY = 1.0;
        } else if (!this.isWorking) {
            this.sprite.y = 0;
            this.walkTimer = 0;
            if (this.sprite.texture.key !== 'pam_idle' && this.scene.textures.exists('pam_idle')) {
                this.sprite.setTexture('pam_idle');
            }
            // Respiración sutil en reposo (idle breathing) para dar vida natural
            this.idleTimer = (this.idleTimer || 0) + deltaSec;
            this.sprite.scaleY = 1.0 + Math.sin(this.idleTimer * 2.5) * 0.018;
        }

        // Delimitar dentro de las paredes de la habitación
        const minX = 70;
        const maxX = (this.scene && this.scene.scale && this.scene.scale.width) ? this.scene.scale.width - 70 : 880;
        this.x = Phaser.Math.Clamp(this.x, minX, maxX);
        this.y = Phaser.Math.Clamp(this.y, 250, 550);
    }

    setDestination(x, y, onArrival = null) {
        if (this.isBusyInteracting) return;
        this.targetDestination = { x, y, onArrival };
    }

    sitAtDesk(deskX = 135, deskY = 270) {
        this.isWorking = true;
        this.sprite.setTexture('pam_typing');
        this.sprite.setFlipX(false);
        this.sprite.y = 0;
        this.sprite.scaleY = 1.0;
        this.x = deskX;
        this.y = deskY - 5;
    }

    leaveDesk() {
        if (this.isWorking) {
            this.isWorking = false;
            this.sprite.setTexture('pam_idle');
            this.sprite.y = 0;
            this.sprite.scaleY = 1.0;
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
