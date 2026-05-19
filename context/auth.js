export function getUsuarioLogueado() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

export function logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrito'); // También limpiamos el carrito al cerrar sesión
    window.location.href = '../login/login.html';
}