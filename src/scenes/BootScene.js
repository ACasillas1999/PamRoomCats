// src/scenes/BootScene.js - Generación de texturas y preparación inicial
import { generateGameTextures } from '../systems/TextureGenerator.js';
import { AudioSys } from '../systems/AudioSystem.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Cargar sprites HD pixel art de Pam
        this.load.image('pam_idle', 'src/assets/pam_idle.png');
        this.load.image('pam_walk_1', 'src/assets/pam_walk_1.png');
        this.load.image('pam_walk_2', 'src/assets/pam_walk_2.png');
        this.load.image('pam_walk_3', 'src/assets/pam_walk_3.png');
        this.load.image('pam_walk_4', 'src/assets/pam_walk_4.png');
        this.load.image('pam_typing', 'src/assets/pam_typing.png');
        this.load.image('pam_typing_alt', 'src/assets/pam_typing_alt.png');

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
