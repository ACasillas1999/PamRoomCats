// src/scenes/GameScene.js - Escena principal del juego PamRoomCats
import { GameConfig } from '../config.js';
import { Pam } from '../entities/Pam.js';
import { Cat } from '../entities/Cat.js';
import { AudioSys } from '../systems/AudioSystem.js';
import { DatabaseAPI } from '../api.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.playerName = data.playerName || 'Pam';
        this.thesisProgress = 0;
        this.currentChapterIndex = 0;
        this.elapsedTime = 0;
        this.isGameOver = false;

        // Estadísticas de la partida para SQLite
        this.sessionStats = {
            fed: 0,
            litter: 0,
            played: 0,
            petted: 0,
            keyboard_incidents: 0
        };
        this.totalCatsAttended = 0;
        this.catOnDesk = null; // Gato sobre el teclado
        this.typingSfxTimer = 0;
    }

    create() {
        const { width, height } = this.scale;

        // 1. Habitación de fondo
        this.add.image(width / 2, height / 2, 'room_bg');

        // 2. Estaciones interactivas
        this.createStations();

        // 3. Crear personaje principal Pam
        this.pam = new Pam(this, 135, 280);
        this.pam.sitAtDesk(); // Inicia sentada trabajando

        // 4. Crear gatos según configuración
        this.cats = [];
        this.activeCatsCount = GameConfig.thesis.chapters[0].activeCats;
        this.spawnCats();

        // 5. Configurar entradas de teclado (WASD y flechas)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

        // 6. Clic en el suelo para mover a Pam
        this.input.on('pointerdown', (pointer, gameObjects) => {
            // Solo si no hizo clic sobre un objeto interactuable o gato
            if (gameObjects.length === 0 && pointer.y > 220) {
                this.pam.setDestination(pointer.x, pointer.y);
            }
        });

        // 7. Eventos de los gatos
        this.events.on('catClicked', this.handleCatClicked, this);
        this.events.on('catNeglected', this.handleGameOver, this);

        // 8. Evento aleatorio de gato en el teclado (Capítulos 3 en adelante)
        this.keyboardEventTimer = Phaser.Math.Between(15, 25);
    }

    createStations() {
        // Escritorio de trabajo
        this.desk = this.add.image(135, 270, 'desk').setInteractive({ useHandCursor: true });
        this.deskPrompt = this.add.text(135, 195, '💻 Escribir Tesis', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 3 },
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.desk.on('pointerdown', () => {
            if (this.catOnDesk) {
                // Espantar gato del teclado
                this.shooCatFromDesk();
            } else {
                this.pam.setDestination(135, 280, () => {
                    this.pam.sitAtDesk();
                });
            }
        });

        // Estación 1: Comida (Plato y croquetas)
        this.foodStation = this.add.image(850, 480, 'station_food').setInteractive({ useHandCursor: true });
        this.add.text(850, 435, '🍗 Servir Comida', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 3 },
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.foodStation.on('pointerdown', () => {
            this.pam.setDestination(810, 480, () => {
                this.pam.setCarriedItem('food');
            });
        });

        // Estación 2: Arenero
        this.litterStation = this.add.image(850, 310, 'station_litter').setInteractive({ useHandCursor: true });
        this.add.text(850, 265, '🚽 Limpiar Arenero', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 3 },
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.litterStation.on('pointerdown', () => {
            this.pam.setDestination(810, 310, () => {
                this.pam.setCarriedItem('litter');
            });
        });

        // Estación 3: Cesta de Juguetes / Estambre
        this.toyStation = this.add.image(320, 540, 'station_toy').setInteractive({ useHandCursor: true });
        this.add.text(320, 500, '🧶 Juguete / Estambre', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            backgroundColor: '#00000088',
            padding: { x: 6, y: 3 },
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.toyStation.on('pointerdown', () => {
            this.pam.setDestination(320, 510, () => {
                this.pam.setCarriedItem('play');
            });
        });
    }

    spawnCats() {
        GameConfig.cats.forEach((catCfg, index) => {
            const cat = new Cat(this, catCfg);
            cat.isActive = index < this.activeCatsCount;
            cat.setVisible(cat.isActive);
            this.cats.push(cat);
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;
        const deltaSec = delta / 1000;
        this.elapsedTime += deltaSec;

        const currentChapter = GameConfig.thesis.chapters[this.currentChapterIndex];

        // 1. Manejo del avance de la tesis mientras Pam teclea
        if (this.pam.isWorking && !this.catOnDesk) {
            this.thesisProgress += GameConfig.thesis.typingSpeedBase * deltaSec;

            // Sonido de tecleo continuo
            this.typingSfxTimer -= deltaSec;
            if (this.typingSfxTimer <= 0) {
                AudioSys.playType();
                this.typingSfxTimer = 0.16;
            }

            // Verificar si sube de capítulo
            if (this.thesisProgress >= currentChapter.max && this.currentChapterIndex < GameConfig.thesis.chapters.length - 1) {
                this.advanceChapter();
            }

            // Condición de Victoria: ¡100% alcanzado!
            if (this.thesisProgress >= 100) {
                this.thesisProgress = 100;
                this.handleWin();
                return;
            }
        }

        // 2. Penalización si hay un gato sobre el teclado
        if (this.catOnDesk) {
            this.thesisProgress = Math.max(0, this.thesisProgress - GameConfig.events.keyboardPenaltyPerSec * deltaSec);
        }

        // 3. Actualizar Pam y Gatos
        this.pam.update(deltaSec, this.cursors, this.wasd);

        this.cats.forEach(cat => {
            cat.update(deltaSec, currentChapter.decayMultiplier);
        });

        // 4. Temporizador de evento sorpresa de gato en el teclado
        if (this.currentChapterIndex >= 2 && !this.catOnDesk) {
            this.keyboardEventTimer -= deltaSec;
            if (this.keyboardEventTimer <= 0) {
                this.triggerCatOnDeskEvent();
                this.keyboardEventTimer = Phaser.Math.Between(20, 35);
            }
        }

        // 5. Enviar actualización al HUD (UIScene)
        this.scene.get('UIScene').events.emit('updateHUD', {
            progress: this.thesisProgress,
            chapter: currentChapter,
            time: this.elapsedTime,
            carriedItem: this.pam.carriedItem,
            catOnDesk: !!this.catOnDesk
        });
    }

    advanceChapter() {
        this.currentChapterIndex++;
        const nextChapter = GameConfig.thesis.chapters[this.currentChapterIndex];
        this.activeCatsCount = nextChapter.activeCats;

        // Despertar nuevos michis según el capítulo
        this.cats.forEach((cat, idx) => {
            if (idx < this.activeCatsCount && !cat.isActive) {
                cat.isActive = true;
                cat.setVisible(true);
                cat.attention = 100;
                // Efecto de despertar
                this.tweens.add({
                    targets: cat,
                    scale: { from: 0.2, to: 1 },
                    duration: 600,
                    ease: 'Back.easeOut'
                });
            }
        });

        AudioSys.playWin();
        this.scene.get('UIScene').events.emit('chapterBanner', nextChapter.name);
    }

    handleCatClicked(cat) {
        if (this.isGameOver) return;

        // Si Pam ya está cerca del gato
        const dist = Math.hypot(this.pam.x - cat.x, this.pam.y - cat.y);
        const actionCallback = () => {
            this.resolveCatCare(cat);
        };

        if (dist < 60) {
            actionCallback();
        } else {
            // Pam camina hacia el gato
            this.pam.setDestination(cat.x + (cat.x > this.pam.x ? -35 : 35), cat.y, actionCallback);
        }
    }

    resolveCatCare(cat) {
        if (!cat.currentNeed) {
            // Si el gato no tiene necesidad, Pam puede darle una caricia de cariño rápida
            this.pam.performAction(0.8, () => {
                AudioSys.playPurr();
                this.sessionStats.petted++;
            });
            return;
        }

        const needId = cat.currentNeed.id;
        const carried = this.pam.carriedItem;

        // Validar si Pam tiene el objeto requerido o si es cariño (manos vacías)
        const canSatisfy = (needId === 'pet') || (needId === carried);

        if (canSatisfy) {
            const actionTime = cat.currentNeed.actionTime || 1.2;
            this.pam.performAction(actionTime, () => {
                const success = cat.satisfy(needId);
                if (success) {
                    this.totalCatsAttended++;
                    // Registrar estadísticas
                    if (needId === 'food') this.sessionStats.fed++;
                    if (needId === 'litter') this.sessionStats.litter++;
                    if (needId === 'play') this.sessionStats.played++;
                    if (needId === 'pet') this.sessionStats.petted++;

                    // Consumir objeto en mano
                    this.pam.setCarriedItem(null);
                }
            });
        } else {
            // No tiene el objeto adecuado: aviso sonoro
            AudioSys.playWarning();
        }
    }

    triggerCatOnDeskEvent() {
        // Elegir un gato activo para subirlo al teclado
        const activeCats = this.cats.filter(c => c.isActive && !c.currentNeed);
        if (activeCats.length === 0) return;

        const naughtyCat = activeCats[Math.floor(Math.random() * activeCats.length)];
        this.catOnDesk = naughtyCat;
        naughtyCat.isOnDesk = true;
        this.sessionStats.keyboard_incidents++;

        // Moverlo visualmente encima de la laptop
        naughtyCat.setPosition(135, 260);
        naughtyCat.bubbleIcon.setTexture('icon_keyboard');
        naughtyCat.bubbleContainer.setVisible(true);

        AudioSys.playWarning();
        AudioSys.playMeow(true);

        this.deskPrompt.setText('⚠️ ¡ESPANTAR DEL TECLADO!');
        this.deskPrompt.setStyle({ backgroundColor: '#d32f2f', fill: '#ffffff' });
    }

    shooCatFromDesk() {
        if (!this.catOnDesk) return;
        const cat = this.catOnDesk;
        cat.isOnDesk = false;
        cat.bubbleContainer.setVisible(false);
        this.catOnDesk = null;

        // Bajar al michi al centro de la alfombra
        this.tweens.add({
            targets: cat,
            x: 400,
            y: 400,
            duration: 500,
            ease: 'Power2'
        });

        this.deskPrompt.setText('💻 Escribir Tesis');
        this.deskPrompt.setStyle({ backgroundColor: '#00000088', fill: '#ffffff' });
        AudioSys.playPurr();
    }

    async handleWin() {
        this.isGameOver = true;
        AudioSys.stopAmbientBgm();
        AudioSys.playWin();

        const payload = {
            player_name: this.playerName,
            thesis_progress: 100,
            time_seconds: this.elapsedTime,
            chapter_reached: this.currentChapterIndex + 1,
            won: true,
            cats_attended: this.totalCatsAttended,
            stats: this.sessionStats
        };

        // Guardar resultado en SQLite
        await DatabaseAPI.saveScore(payload);

        this.scene.stop('UIScene');
        this.scene.start('WinScene', payload);
    }

    async handleGameOver(neglectedCat) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        AudioSys.stopAmbientBgm();
        AudioSys.playGameOver();

        const payload = {
            player_name: this.playerName,
            thesis_progress: this.thesisProgress,
            time_seconds: this.elapsedTime,
            chapter_reached: this.currentChapterIndex + 1,
            won: false,
            cats_attended: this.totalCatsAttended,
            cat_name: neglectedCat.catName,
            stats: this.sessionStats
        };

        // Guardar progreso alcanzado en SQLite
        await DatabaseAPI.saveScore(payload);

        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', payload);
    }
}
