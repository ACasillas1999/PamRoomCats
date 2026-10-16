// src/main.js - Configuración e inicialización del juego en Phaser 3
import { GameConfig } from './config.js?v=2000';
import { BootScene } from './scenes/BootScene.js?v=2000';
import { MenuScene } from './scenes/MenuScene.js?v=2000';
import { GameScene } from './scenes/GameScene.js?v=2000';
import { UIScene } from './scenes/UIScene.js?v=2000';
import { LeaderboardScene } from './scenes/LeaderboardScene.js?v=2000';
import { WinScene } from './scenes/WinScene.js?v=2000';
import { GameOverScene } from './scenes/GameOverScene.js?v=2000';
import { PauseScene } from './scenes/PauseScene.js?v=2000';

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
        PauseScene,
        LeaderboardScene,
        WinScene,
        GameOverScene
    ]
};

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Phaser.Game(config);
});
