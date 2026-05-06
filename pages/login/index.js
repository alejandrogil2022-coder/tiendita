import { mostrarNotificacion } from '../../utils/helpers.js';

export function initLogin() {
    const loginForm = document.getElementById('login-form');

    if (!loginForm) return; // Si no hay formulario, no estamos en login

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita la recarga de página por defecto

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simulamos la validación del Login
        if (email && password) {
            mostrarNotificacion(`¡Bienvenido/a de nuevo, ${email}!`, '#00c853');
            
            // Redirigir a la vista de Home después de una pequeña pausa
            setTimeout(() => {
                window.location.href = '../../pages/Home/index.html';
            }, 1500);
        } else {
            mostrarNotificacion('Por favor, ingresa tu correo y contraseña.', '#ff4d4d');
        }
    });
}