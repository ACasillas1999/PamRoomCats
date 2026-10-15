// src/main.js - Configuración e inicialización del juego en Phaser 3
import { GameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { LeaderboardScene } from './scenes/LeaderboardScene.js';
import { WinScene } from './scenes/WinScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GameConfig.width,
    height: GameConfig.height,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        UIScene,
        LeaderboardScene,
        WinScene,
        GameOverScene
    ]
};

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Phaser.Game(config);
});
