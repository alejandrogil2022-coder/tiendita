import { getUsuarioLogueado, logout } from '../context/auth.js';

export function initHeader() {
    const authContainer = document.getElementById('auth-link-container');
    if (!authContainer) return;

    const usuario = getUsuarioLogueado();

    if (usuario) {
        // Usuario logueado: mostrar ícono de perfil y opción de cerrar sesión
        authContainer.innerHTML = `
            <div class="user-profile">
                <div class="user-icon" title="${usuario.nombre}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a5.5 5.5 0 0 1 5.5 5.5c0 1.54-.64 2.92-1.68 3.92.05.08.1.16.15.25l.02.05.02.05c.3.68.46 1.42.46 2.18 0 2.42-1.73 4.44-4 4.9V22h-2v-1.6c-2.27-.46-4-2.48-4-4.9 0-.76.16-1.5.46-2.18l.02-.05.02-.05.15-.25A5.49 5.49 0 0 1 6.5 8a5.5 5.5 0 0 1 5.5-5.5zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>
                </div>
                <div class="user-dropdown">
                    <span>Hola, ${usuario.nombre.split(' ')[0]}</span>
                    <a href="../Pedidos/index.html">Mis Pedidos</a>
                    ${usuario.es_admin === 1 ? '<a href="../Admin/index.html">Panel Admin</a>' : ''}
                    <a href="#" id="logout-btn">Cerrar Sesión</a>
                </div>
            </div>
        `;
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    } else if (!window.location.pathname.includes('/login.html')) {
        // Usuario no logueado y NO estamos en la página de login: mostrar "Iniciar Sesión"
        authContainer.innerHTML = `
            <a href="../login/login.html">Iniciar Sesión</a>
        `;
    }
}