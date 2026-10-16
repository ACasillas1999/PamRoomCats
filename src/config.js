// src/config.js - Configuración general y constantes de balance
export const GameConfig = {
    width: 1200,
    height: 600,
    pamSpeed: 175,
    
    // Balance de la tesis
    thesis: {
        totalProgress: 100,
        // Velocidad base: % por segundo mientras Pam escribe
        typingSpeedBase: 1.25, // ~80 segundos de tecleo continuo para ganar
        chapters: [
            { id: 1, name: "Cap. 1: Introducción", min: 0, max: 20, activeCats: 2, decayMultiplier: 1.0 },
            { id: 2, name: "Cap. 2: Marco Teórico", min: 20, max: 40, activeCats: 3, decayMultiplier: 1.15 },
            { id: 3, name: "Cap. 3: Metodología", min: 40, max: 60, activeCats: 3, decayMultiplier: 1.35 },
            { id: 4, name: "Cap. 4: Resultados", min: 60, max: 80, activeCats: 4, decayMultiplier: 1.55 },
            { id: 5, name: "Cap. 5: Conclusiones", min: 80, max: 100, activeCats: 4, decayMultiplier: 1.8 }
        ]
    },

    // Balance de los gatos
    cats: [
        { id: 'michi', name: 'Michi', color: 'orange', startX: 250, startY: 340, personality: 'glutton' },
        { id: 'luna', name: 'Luna', color: 'black', startX: 420, startY: 420, personality: 'demanding' },
        { id: 'mochi', name: 'Mochi', color: 'white', startX: 700, startY: 360, personality: 'playful' },
        { id: 'kiko', name: 'Kiko', color: 'calico', startX: 520, startY: 280, personality: 'clingy' }
    ],

    needs: {
        decayPerSecond: 3.5, // Cuánto baja la barra cuando el gato tiene una necesidad activa
        intervalMin: 6,      // Segundos mínimos entre una necesidad y otra
        intervalMax: 14,     // Segundos máximos
        types: {
            FOOD: { id: 'food', label: 'Hambre', icon: '🍗', actionTime: 1.2, refillAmount: 60 },
            LITTER: { id: 'litter', label: 'Arenero', icon: '🚽', actionTime: 1.5, refillAmount: 60 },
            PLAY: { id: 'play', label: 'Jugar', icon: '🧶', actionTime: 1.6, refillAmount: 50 },
            PET: { id: 'pet', label: 'Cariño', icon: '❤️', actionTime: 1.4, refillAmount: 45 }
        }
    },

    // Eventos sorpresa
    events: {
        catOnKeyboardChance: 0.15, // Probabilidad cuando la barra de un gato es muy baja o en cap 4-5
        keyboardPenaltyPerSec: 1.5 // Progreso de tesis perdido por segundo si un gato está sobre el teclado
    }
};
