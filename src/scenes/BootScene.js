// src/scenes/BootScene.js - Generación de texturas y preparación inicial
import { generateGameTextures } from '../systems/TextureGenerator.js';
import { AudioSys } from '../systems/AudioSystem.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Generar texturas de pixel art directamente en memoria
        generateGameTextures(this);
    }

    create() {
        // Inicializar Audio al primer clic del usuario
        this.input.once('pointerdown', () => {
            AudioSys.init();
        });

        // Pasar a la pantalla de menú
        this.scene.start('MenuScene');
    }
}
