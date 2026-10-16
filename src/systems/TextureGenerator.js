// src/systems/TextureGenerator.js - Generador procedural de texturas pixel art para Phaser
export function generateGameTextures(scene) {
    const createPixelCanvas = (key, width, height, drawFn) => {
        if (scene.textures.exists(key) || (scene.load && scene.load.get && scene.load.get(key))) return;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, width, height);
        scene.textures.addCanvas(key, canvas);
    };

    // 1. Habitación acogedora de Pam panorámica moderna (1200 x 600)
    createPixelCanvas('room_bg', 1200, 600, (ctx, w, h) => {
        // Pared superior (lila pastel suave / estética lo-fi)
        ctx.fillStyle = '#392b47';
        ctx.fillRect(0, 0, w, 220);

        // Moldura / zócalo
        ctx.fillStyle = '#5c4573';
        ctx.fillRect(0, 212, w, 8);

        // Piso de duela de madera cálida
        ctx.fillStyle = '#b58455';
        ctx.fillRect(0, 220, w, 380);

        // Líneas de duela
        ctx.strokeStyle = '#9c6f44';
        ctx.lineWidth = 2;
        for (let y = 220; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
            // Juntas verticales escalonadas
            const offset = (y % 80 === 0) ? 0 : 50;
            for (let x = offset; x < w; x += 120) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 40);
                ctx.stroke();
            }
        }

        // Gran alfombra redonda acogedora para gatos en el centro
        ctx.fillStyle = '#ebd3be';
        ctx.beginPath();
        ctx.ellipse(600, 410, 250, 115, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4b79b';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Ventana con vista al cielo nocturno estrellado
        ctx.fillStyle = '#221631';
        ctx.fillRect(500, 25, 200, 150);
        // Estrellas
        ctx.fillStyle = '#fff9d2';
        const stars = [[520, 45], [570, 70], [650, 40], [620, 100], [540, 120], [670, 90]];
        stars.forEach(([sx, sy]) => {
            ctx.fillRect(sx, sy, 3, 3);
        });
        // Luna creciente
        ctx.fillStyle = '#ffef9f';
        ctx.beginPath();
        ctx.arc(640, 65, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#221631';
        ctx.beginPath();
        ctx.arc(648, 62, 19, 0, Math.PI * 2);
        ctx.fill();

        // Marco de la ventana y cortinas
        ctx.strokeStyle = '#f8e4d9';
        ctx.lineWidth = 6;
        ctx.strokeRect(500, 25, 200, 150);
        // Cruz de la ventana
        ctx.beginPath();
        ctx.moveTo(600, 25);
        ctx.lineTo(600, 175);
        ctx.moveTo(500, 100);
        ctx.lineTo(700, 100);
        ctx.stroke();

        // Cortinas rosas suaves
        ctx.fillStyle = '#f09bb0';
        ctx.fillRect(485, 20, 25, 160);
        ctx.fillRect(690, 20, 25, 160);

        // Estantería de libros en la pared izquierda
        ctx.fillStyle = '#7a5135';
        ctx.fillRect(180, 50, 220, 16);
        ctx.fillRect(180, 120, 220, 16);
        // Libros coloridos
        const bookColors = ['#f44336', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#ff9800'];
        for (let b = 0; b < 12; b++) {
            ctx.fillStyle = bookColors[b % bookColors.length];
            ctx.fillRect(195 + b * 16, 66 - (b % 3) * 6, 13, 54 + (b % 3) * 6);
        }
        for (let b = 0; b < 10; b++) {
            ctx.fillStyle = bookColors[(b + 2) % bookColors.length];
            ctx.fillRect(195 + b * 19, 136 - (b % 2) * 8, 15, 54 + (b % 2) * 8);
        }

        // Póster de gato en la pared derecha
        ctx.fillStyle = '#fce4ec';
        ctx.fillRect(820, 50, 120, 130);
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 4;
        ctx.strokeRect(820, 50, 120, 130);
        ctx.fillStyle = '#e91e63';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText("KEEP CALM", 840, 80);
        ctx.fillText("& PET CATS", 840, 100);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(880, 140, 15, 0, Math.PI * 2);
        ctx.fill();
    });

    // 2. Estación de trabajo / Escritorio de Pam con Laptop (160 x 130)
    createPixelCanvas('desk', 160, 130, (ctx) => {
        // Sombra en el suelo
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(80, 120, 75, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Patas del escritorio
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(15, 50, 10, 65);
        ctx.fillRect(135, 50, 10, 65);

        // Tabla del escritorio
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(10, 35, 140, 20);
        ctx.fillStyle = '#a1887f';
        ctx.fillRect(10, 35, 140, 5); // Brillo

        // Laptop abierta
        ctx.fillStyle = '#90a4ae';
        ctx.fillRect(55, 10, 50, 32); // Pantalla
        ctx.fillStyle = '#42a5f5'; // Pantalla encendida
        ctx.fillRect(58, 13, 44, 26);
        // Líneas de texto de tesis en pantalla
        ctx.fillStyle = '#e3f2fd';
        for (let l = 16; l < 36; l += 4) {
            ctx.fillRect(61, l, 25 + (l % 12), 2);
        }
        // Base de la laptop
        ctx.fillStyle = '#78909c';
        ctx.fillRect(50, 42, 60, 6);

        // Taza de café humeante
        ctx.fillStyle = '#ef5350';
        ctx.fillRect(120, 30, 14, 16);
        ctx.fillStyle = '#fff';
        ctx.fillRect(118, 33, 4, 8); // Asa

        // Lámpara de escritorio
        ctx.fillStyle = '#fbc02d';
        ctx.beginPath();
        ctx.arc(30, 25, 12, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#616161';
        ctx.fillRect(28, 25, 4, 18);
    });

    // 3. Estación de Comida (Plato de michis y bolsa de croquetas) (90 x 70)
    createPixelCanvas('station_food', 90, 70, (ctx) => {
        // Tapete pequeño
        ctx.fillStyle = '#b2dfdb';
        ctx.beginPath();
        ctx.roundRect(10, 25, 70, 38, 8);
        ctx.fill();

        // Bolsa de croquetas
        ctx.fillStyle = '#f57c00';
        ctx.fillRect(15, 10, 25, 36);
        ctx.fillStyle = '#ffe082';
        ctx.fillRect(18, 20, 19, 12);
        ctx.fillStyle = '#d84315';
        ctx.fillRect(22, 10, 11, 4);

        // Plato doble de michi
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.ellipse(60, 44, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cuenco croquetas
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.arc(54, 44, 6, 0, Math.PI * 2);
        ctx.fill();
        // Cuenco agua
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(66, 44, 6, 0, Math.PI * 2);
        ctx.fill();
    });

    // 4. Estación de Arenero (90 x 70)
    createPixelCanvas('station_litter', 90, 70, (ctx) => {
        // Caja de arena
        ctx.fillStyle = '#ab47bc';
        ctx.beginPath();
        ctx.roundRect(15, 20, 60, 40, 6);
        ctx.fill();
        // Arena
        ctx.fillStyle = '#e0cfb3';
        ctx.beginPath();
        ctx.roundRect(20, 24, 50, 32, 4);
        ctx.fill();
        // Pala para arena
        ctx.fillStyle = '#26a69a';
        ctx.fillRect(66, 12, 8, 22);
        ctx.fillRect(62, 30, 16, 12);
    });

    // 5. Estación de Juguetes / Cesta con estambre (70 x 70)
    createPixelCanvas('station_toy', 70, 70, (ctx) => {
        // Cesta tejida
        ctx.fillStyle = '#a1887f';
        ctx.beginPath();
        ctx.ellipse(35, 45, 26, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bola de estambre roja
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(30, 36, 12, 0, Math.PI * 2);
        ctx.fill();
        // Hilo suelto
        ctx.strokeStyle = '#e91e63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(35, 38);
        ctx.quadraticCurveTo(45, 50, 56, 48);
        ctx.stroke();
        // Ratón de juguete
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.ellipse(45, 36, 8, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    // 6. Los sprites oficiales de Pam ('pam_idle', 'pam_typing', 'pam_typing_alt')
    // se cargan directamente como assets PNG en BootScene.js para máxima fidelidad visual.

    // 7. Sprites de los 4 Gatos (40 x 32)
    const catPalettes = {
        orange: { body: '#ff9800', belly: '#ffe0b2', stripes: '#e65100', ears: '#ffab40', eyes: '#4caf50' },
        black:  { body: '#263238', belly: '#37474f', stripes: '#1a237e', ears: '#ff80ab', eyes: '#ffeb3b' },
        white:  { body: '#f5f5f5', belly: '#ffffff', stripes: '#b0bec5', ears: '#ff80ab', eyes: '#29b6f6' },
        calico: { body: '#ffffff', belly: '#ffe0b2', stripes: '#d84315', ears: '#212121', eyes: '#8bc34a' }
    };

    Object.entries(catPalettes).forEach(([key, col]) => {
        // Gato descansando / Idle
        createPixelCanvas(`cat_${key}_idle`, 44, 32, (ctx) => {
            // Sombra
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.beginPath();
            ctx.ellipse(22, 29, 14, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cola curvada
            ctx.strokeStyle = col.body;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(8, 22);
            ctx.quadraticCurveTo(2, 14, 4, 8);
            ctx.stroke();

            // Cuerpo esponjoso
            ctx.fillStyle = col.body;
            ctx.beginPath();
            ctx.ellipse(20, 22, 13, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pancita suave
            ctx.fillStyle = col.belly;
            ctx.beginPath();
            ctx.ellipse(20, 24, 9, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cabeza
            ctx.fillStyle = col.body;
            ctx.beginPath();
            ctx.arc(31, 16, 8, 0, Math.PI * 2);
            ctx.fill();

            // Orejitas puntiagudas
            ctx.fillStyle = col.ears;
            ctx.beginPath();
            ctx.moveTo(26, 12);
            ctx.lineTo(29, 6);
            ctx.lineTo(32, 12);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(33, 12);
            ctx.lineTo(36, 6);
            ctx.lineTo(38, 12);
            ctx.fill();

            // Ojitos brillantes
            ctx.fillStyle = col.eyes;
            ctx.fillRect(32, 15, 2, 3);
            ctx.fillRect(36, 15, 2, 3);

            // Naricita rosa
            ctx.fillStyle = '#ff80ab';
            ctx.fillRect(34, 19, 2, 1.5);
        });

        // Gato alertado / pidiendo atención
        createPixelCanvas(`cat_${key}_alert`, 44, 32, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.beginPath();
            ctx.ellipse(22, 29, 14, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cola erguida con emoción
            ctx.strokeStyle = col.body;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(8, 22);
            ctx.lineTo(6, 4);
            ctx.stroke();

            // Cuerpo
            ctx.fillStyle = col.body;
            ctx.beginPath();
            ctx.ellipse(20, 21, 13, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cabeza
            ctx.fillStyle = col.body;
            ctx.beginPath();
            ctx.arc(32, 14, 9, 0, Math.PI * 2);
            ctx.fill();

            // Orejas alertas
            ctx.fillStyle = col.ears;
            ctx.beginPath();
            ctx.moveTo(26, 10);
            ctx.lineTo(30, 3);
            ctx.lineTo(33, 10);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(34, 10);
            ctx.lineTo(38, 3);
            ctx.lineTo(40, 10);
            ctx.fill();

            // Ojitos muy abiertos
            ctx.fillStyle = col.eyes;
            ctx.beginPath();
            ctx.arc(33, 14, 2.5, 0, Math.PI * 2);
            ctx.arc(38, 14, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // 8. Globos de Pensamiento e Íconos de Necesidad (36 x 36)
    createPixelCanvas('bubble_bg', 40, 40, (ctx) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(4, 4, 32, 26, 8);
        ctx.fill();
        ctx.stroke();

        // Pico de la burbuja
        ctx.beginPath();
        ctx.moveTo(16, 30);
        ctx.lineTo(12, 38);
        ctx.lineTo(22, 30);
        ctx.fill();
        ctx.stroke();
    });

    // Íconos nítidos
    createPixelCanvas('icon_food', 24, 24, (ctx) => {
        ctx.font = '16px "Segoe UI Emoji", sans-serif';
        ctx.fillText('🍗', 3, 18);
    });
    createPixelCanvas('icon_litter', 24, 24, (ctx) => {
        ctx.font = '16px "Segoe UI Emoji", sans-serif';
        ctx.fillText('🚽', 3, 18);
    });
    createPixelCanvas('icon_play', 24, 24, (ctx) => {
        ctx.font = '16px "Segoe UI Emoji", sans-serif';
        ctx.fillText('🧶', 3, 18);
    });
    createPixelCanvas('icon_pet', 24, 24, (ctx) => {
        ctx.font = '16px "Segoe UI Emoji", sans-serif';
        ctx.fillText('❤️', 3, 18);
    });
    createPixelCanvas('icon_keyboard', 24, 24, (ctx) => {
        ctx.font = '16px "Segoe UI Emoji", sans-serif';
        ctx.fillText('⌨️', 3, 18);
    });

    // 9. Íconos vectoriales profesionales para controles HUD (sin emojis)
    createPixelCanvas('ui_icon_pause', 36, 36, (ctx) => {
        ctx.fillStyle = '#ffffff';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(11, 9, 4.5, 18, 2);
            ctx.roundRect(20.5, 9, 4.5, 18, 2);
            ctx.fill();
        } else {
            ctx.fillRect(11, 9, 4.5, 18);
            ctx.fillRect(20.5, 9, 4.5, 18);
        }
    });

    createPixelCanvas('ui_icon_sound_on', 36, 36, (ctx) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(8, 14);
        ctx.lineTo(13, 14);
        ctx.lineTo(19, 9);
        ctx.lineTo(19, 27);
        ctx.lineTo(13, 22);
        ctx.lineTo(8, 22);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(17, 18, 6.5, -Math.PI / 4, Math.PI / 4, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(17, 18, 11.5, -Math.PI / 3.2, Math.PI / 3.2, false);
        ctx.stroke();
    });

    createPixelCanvas('ui_icon_sound_off', 36, 36, (ctx) => {
        ctx.fillStyle = '#b0bec5';
        ctx.beginPath();
        ctx.moveTo(8, 14);
        ctx.lineTo(13, 14);
        ctx.lineTo(19, 9);
        ctx.lineTo(19, 27);
        ctx.lineTo(13, 22);
        ctx.lineTo(8, 22);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ff5252';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(8, 28);
        ctx.lineTo(28, 8);
        ctx.stroke();
    });

    createPixelCanvas('ui_icon_fullscreen', 36, 36, (ctx) => {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        // Superior izquierda
        ctx.beginPath();
        ctx.moveTo(9, 15);
        ctx.lineTo(9, 9);
        ctx.lineTo(15, 9);
        ctx.stroke();

        // Superior derecha
        ctx.beginPath();
        ctx.moveTo(21, 9);
        ctx.lineTo(27, 9);
        ctx.lineTo(27, 15);
        ctx.stroke();

        // Inferior izquierda
        ctx.beginPath();
        ctx.moveTo(9, 21);
        ctx.lineTo(9, 27);
        ctx.lineTo(15, 27);
        ctx.stroke();

        // Inferior derecha
        ctx.beginPath();
        ctx.moveTo(21, 27);
        ctx.lineTo(27, 27);
        ctx.lineTo(27, 21);
        ctx.stroke();
    });
}
