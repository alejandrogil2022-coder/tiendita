import { mostrarNotificacion } from '../../utils/helpers.js';
import { getUsuarioLogueado } from '../../context/auth.js';

export function initLogin() {
    const loginForm = document.getElementById('login-form');

    // Si el usuario ya está logueado, lo redirigimos al Home para que no vea el login de nuevo
    if (getUsuarioLogueado() && loginForm) {
        window.location.href = '../Home/index.html';
        return;
    }

    if (!loginForm) return; // Si no hay formulario, no estamos en login

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita la recarga de página por defecto

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email && password) {
            try {
                // Hacemos la petición real al servidor
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    mostrarNotificacion(`¡Bienvenido/a, ${data.usuario.nombre}!`, '#00c853');
                    // Guardamos el usuario en localStorage para mantener la sesión
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    setTimeout(() => {
                        window.location.href = '../Home/index.html';
                    }, 1500);
                } else {
                    mostrarNotificacion(data.error || 'Error al iniciar sesión', '#ff4d4d');
                }
            } catch (error) {
                mostrarNotificacion('Error de conexión con el servidor', '#ff4d4d');
                console.error('Error:', error);
            }
        } else {
            mostrarNotificacion('Por favor, ingresa tu correo y contraseña.', '#ff4d4d');
        }
    });

    // --- Lógica del Modal de Registro ---
    const btnAbrirModal = document.getElementById('btn-abrir-registro');
    const modalRegistro = document.getElementById('modal-registro');
    const btnCerrarModal = document.getElementById('btn-cerrar-registro');
    const registerForm = document.getElementById('register-form');

    if (btnAbrirModal && modalRegistro) {
        btnAbrirModal.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que salte hacia arriba
            modalRegistro.style.display = 'flex'; // Usamos flex para centrarlo
        });
    }

    if (btnCerrarModal && modalRegistro) {
        btnCerrarModal.addEventListener('click', () => {
            modalRegistro.style.display = 'none';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('reg-nombre').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            if (nombre && email && password) {
                try {
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre, email, password })
                    });
                    const data = await response.json();
                    
                    if (response.ok) {
                        mostrarNotificacion('¡Registro exitoso! Ahora puedes iniciar sesión.', '#00c853');
                        modalRegistro.style.display = 'none'; // Cerramos el modal
                        registerForm.reset(); // Limpiamos el formulario
                    } else {
                        mostrarNotificacion(data.error || 'Error al registrar', '#ff4d4d');
                    }
                } catch (error) {
                    mostrarNotificacion('Error de conexión con el servidor', '#ff4d4d');
                }
            }
        });
    }
}