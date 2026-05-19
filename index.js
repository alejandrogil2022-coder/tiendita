import App from './App.js';
import { initHeader } from './components/header.js';

// Los scripts con type="module" se ejecutan por defecto cuando el DOM está listo
// Primero inicializamos el header para que se actualice según el estado de login
try {
    initHeader();
} catch (error) {
    console.error("Error al cargar el header:", error);
}

// Luego, el resto de la aplicación
App();