// src/entities/Cat.js - Entidad de cada michi en la habitación
import { GameConfig } from '../config.js';
import { AudioSys } from '../systems/AudioSystem.js';

export class Cat extends Phaser.GameObjects.Container {
    constructor(scene, config) {
        super(scene, config.startX, config.startY);
        this.scene = scene;
        this.catId = config.id;
        this.catName = config.name;
        this.colorKey = config.color;
        this.personality = config.personality;

        this.attention = 100;
        this.currentNeed = null; // null o { id, label, icon, ... }
        this.isActive = true;
        this.isOnDesk = false;
        this.decayRate = GameConfig.needs.decayPerSecond;

        // Temporizador para la siguiente necesidad
        this.nextNeedTimer = Phaser.Math.Between(GameConfig.needs.intervalMin, GameConfig.needs.intervalMax);

        // Movimiento autónomo / vagabundeo
        this.wanderTimer = Phaser.Math.Between(2, 6);
        this.targetX = config.startX;
        this.targetY = config.startY;

        this.setupVisuals();
        scene.add.existing(this);
    }

    setupVisuals() {
        // Sprite base del gato
        this.sprite = this.scene.add.sprite(0, 0, `cat_${this.colorKey}_idle`);
        this.add(this.sprite);

        // Nombre del michi encima
        this.nameTag = this.scene.add.text(0, -28, this.catName, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#2c1e3d',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add(this.nameTag);

        // Contenedor de la barra de atención
        this.barBg = this.scene.add.rectangle(0, -18, 44, 6, 0x222222).setOrigin(0.5);
        this.barFill = this.scene.add.rectangle(-21, -18, 42, 4, 0x4caf50).setOrigin(0, 0.5);
        this.add(this.barBg);
        this.add(this.barFill);

        // Burbuja de pensamiento (oculta al inicio)
        this.bubbleContainer = this.scene.add.container(0, -48);
        this.bubbleBg = this.scene.add.image(0, 0, 'bubble_bg');
        this.bubbleIcon = this.scene.add.image(0, -2, 'icon_food');
        this.bubbleContainer.add([this.bubbleBg, this.bubbleIcon]);
        this.bubbleContainer.setVisible(false);
        this.add(this.bubbleContainer);

        // Hacer al gato interactuable por clic
        this.setSize(48, 36);
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', () => {
            this.scene.events.emit('catClicked', this);
        });
    }

    update(deltaSec, chapterMultiplier) {
        if (!this.isActive) return;

        // 1. Manejo del temporizador de necesidades
        if (!this.currentNeed && !this.isOnDesk) {
            this.nextNeedTimer -= deltaSec;
            if (this.nextNeedTimer <= 0) {
                this.triggerRandomNeed();
            }
        }

        // 2. Si tiene necesidad activa, la barra de atención decae
        if (this.currentNeed || this.isOnDesk) {
            const decay = this.decayRate * chapterMultiplier * deltaSec;
            this.attention = Math.max(0, this.attention - decay);

            // Si está crítico (< 25%), cambiar sprite a alerta y avisar
            if (this.attention < 25 && this.attention > 0 && Math.random() < 0.02) {
                AudioSys.playMeow(true);
            }

            // Derrota si llega a cero
            if (this.attention <= 0) {
                this.scene.events.emit('catNeglected', this);
            }
        } else {
            // Se recupera muy lentamente si está feliz
            if (this.attention < 100) {
                this.attention = Math.min(100, this.attention + 1.5 * deltaSec);
            }
        }

        // 3. Movimiento suave si no tiene necesidad urgente
        if (!this.currentNeed && !this.isOnDesk) {
            this.wanderTimer -= deltaSec;
            if (this.wanderTimer <= 0) {
                // Nuevo punto de vagabundeo cerca de la alfombra central
                this.targetX = Phaser.Math.Between(260, 720);
                this.targetY = Phaser.Math.Between(290, 480);
                this.wanderTimer = Phaser.Math.Between(3, 8);
            }

            // Acercarse suavemente al objetivo
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 5) {
                const speed = 25 * deltaSec;
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
                this.sprite.setFlipX(dx < 0);
            }
        }

        this.updateVisuals();
    }

    triggerRandomNeed() {
        const types = Object.values(GameConfig.needs.types);
        const selected = types[Math.floor(Math.random() * types.length)];
        this.currentNeed = selected;

        // Actualizar burbuja
        this.bubbleIcon.setTexture(`icon_${selected.id}`);
        this.bubbleContainer.setVisible(true);
        this.sprite.setTexture(`cat_${this.colorKey}_alert`);

        // Efecto flotante en la burbuja
        this.scene.tweens.add({
            targets: this.bubbleContainer,
            y: -52,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        AudioSys.playMeow(false);
    }

    satisfy(needType) {
        if (!this.currentNeed || this.currentNeed.id !== needType) return false;

        const refill = this.currentNeed.refillAmount || 50;
        this.attention = Math.min(100, this.attention + refill);
        this.currentNeed = null;
        this.bubbleContainer.setVisible(false);
        this.sprite.setTexture(`cat_${this.colorKey}_idle`);

        // Reiniciar tiempo para la siguiente necesidad
        this.nextNeedTimer = Phaser.Math.Between(GameConfig.needs.intervalMin, GameConfig.needs.intervalMax);

        // Animación de corazón de felicidad
        const heart = this.scene.add.image(this.x, this.y - 30, 'icon_pet');
        this.scene.tweens.add({
            targets: heart,
            y: this.y - 65,
            alpha: 0,
            scale: 1.4,
            duration: 900,
            onComplete: () => heart.destroy()
        });

        AudioSys.playPurr();
        AudioSys.playSuccess();
        return true;
    }

    updateVisuals() {
        // Actualizar ancho y color de la barra
        const pct = this.attention / 100;
        const fillWidth = Math.max(0, 42 * pct);
        this.barFill.width = fillWidth;

        if (pct > 0.55) {
            this.barFill.fillColor = 0x4caf50; // Verde
        } else if (pct > 0.25) {
            this.barFill.fillColor = 0xff9800; // Naranja advertencia
        } else {
            this.barFill.fillColor = 0xf44336; // Rojo crítico
        }
    }
}
