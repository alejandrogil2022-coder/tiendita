import { getUsuarioLogueado } from '../../context/auth.js';
import { mostrarNotificacion } from '../../utils/helpers.js';

export async function initPedidos() {
    const usuario = getUsuarioLogueado();
    
    // Proteger la ruta por si alguien entra sin iniciar sesión
    if (!usuario) {
        mostrarNotificacion('Debes iniciar sesión para ver tus pedidos.', '#ff4d4d');
        setTimeout(() => window.location.href = '../login/login.html', 1500);
        return;
    }

    const tbody = document.getElementById('mis-pedidos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4">Buscando tus pedidos...</td></tr>';

    try {
        const response = await fetch(`/api/usuarios/${usuario.id}/pedidos`);
        const pedidos = await response.json();

        tbody.innerHTML = '';
        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Aún no has realizado ninguna compra en Tiendita.</td></tr>';
            return;
        }

        pedidos.forEach(p => {
            const fecha = new Date(p.fecha_pedido).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const totalFormatted = new Intl.NumberFormat('es-CO').format(p.total);
            
            // Colores dinámicos: Verde si está enviado, naranja si está pendiente
            const estadoColor = p.estado === 'Enviado' ? '#00c853' : '#f39c12';

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: bold;">#${p.id}</td>
                    <td>$${totalFormatted}</td>
                    <td>${fecha}</td>
                    <td style="color: ${estadoColor}; font-weight: bold;">${p.estado}</td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" style="color: red;">Error al cargar tus pedidos</td></tr>';
    }
}