// src/ui/Button.js - Componente de botones profesionales con animación suave y efectos de sonido
import { AudioSys } from '../systems/AudioSystem.js';

/**
 * Crea un botón profesional con estilo de cápsula/tarjeta, animación fluida y sonido.
 */
export function createProButton(scene, {
    x,
    y,
    text,
    color = 0x241838,
    hoverColor = null,
    strokeColor = 0xffffff,
    textColor = '#ffffff',
    width = 240,
    height = 46,
    fontSize = '15px',
    radius = 12,
    iconKey = null,
    onClick
}) {
    const container = scene.add.container(x, y);

    const bg = scene.add.graphics();
    const drawBg = (fillCol, strokeCol, strokeAlpha = 0.85, strokeWidth = 2) => {
        bg.clear();
        bg.fillStyle(fillCol, 1);
        if (bg.fillRoundedRect) {
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        } else {
            bg.fillRect(-width / 2, -height / 2, width, height);
        }
        bg.lineStyle(strokeWidth, strokeCol, strokeAlpha);
        if (bg.strokeRoundedRect) {
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
        } else {
            bg.strokeRect(-width / 2, -height / 2, width, height);
        }
    };

    drawBg(color, strokeColor, 0.85, 2);

    const label = scene.add.text(0, 0, text, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: fontSize,
        fontStyle: 'bold',
        fill: textColor
    }).setOrigin(0.5);

    let icon = null;
    if (iconKey && scene.textures.exists(iconKey)) {
        icon = scene.add.image(-width / 2 + 28, 0, iconKey).setScale(0.7);
        label.setX(12);
        container.add(icon);
    }

    container.add([bg, label]);

    // Zona interactiva precisa
    const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input.cursor = 'pointer';

    container.on('pointerover', () => {
        AudioSys.playHover();
        drawBg(hoverColor || color, 0xffffff, 1.0, 2.5);
        scene.tweens.killTweensOf(container);
        scene.tweens.add({
            targets: container,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 130,
            ease: 'Back.easeOut'
        });
    });

    container.on('pointerout', () => {
        drawBg(color, strokeColor, 0.85, 2);
        scene.tweens.killTweensOf(container);
        scene.tweens.add({
            targets: container,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 130,
            ease: 'Quad.easeOut'
        });
    });

    container.on('pointerdown', () => {
        AudioSys.playClick();
        scene.tweens.add({
            targets: container,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 65,
            yoyo: true,
            onComplete: () => {
                if (onClick) onClick(label, container);
            }
        });
    });

    return {
        container,
        label,
        bg,
        setText: (t) => label.setText(t),
        setVisible: (v) => container.setVisible(v)
    };
}

/**
 * Crea un botón circular profesional de ícono (para Pausa, Sonido, Pantalla Completa).
 */
export function createProIconButton(scene, {
    x,
    y,
    iconKey,
    radius = 18,
    bgColor = 0x241838,
    strokeColor = 0xffffff,
    onClick
}) {
    const container = scene.add.container(x, y);

    const bg = scene.add.circle(0, 0, radius, bgColor, 0.88);
    bg.setStrokeStyle(2, strokeColor, 0.8);

    const icon = scene.add.image(0, 0, iconKey).setScale(0.75);

    container.add([bg, icon]);

    const hitArea = new Phaser.Geom.Circle(0, 0, Math.max(radius + 10, 24));
    container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    container.input.cursor = 'pointer';

    container.on('pointerover', () => {
        AudioSys.playHover();
        bg.setStrokeStyle(2.5, 0xffde59, 1.0);
        scene.tweens.killTweensOf(container);
        scene.tweens.add({
            targets: container,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 130,
            ease: 'Back.easeOut'
        });
    });

    container.on('pointerout', () => {
        bg.setStrokeStyle(2, strokeColor, 0.8);
        scene.tweens.killTweensOf(container);
        scene.tweens.add({
            targets: container,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 130,
            ease: 'Quad.easeOut'
        });
    });

    container.on('pointerdown', () => {
        AudioSys.playClick();
        scene.tweens.add({
            targets: container,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 60,
            yoyo: true,
            onComplete: () => {
                if (onClick) onClick(icon, container);
            }
        });
    });

    return {
        container,
        icon,
        bg,
        setIcon: (newKey) => icon.setTexture(newKey),
        setVisible: (v) => container.setVisible(v)
    };
}
