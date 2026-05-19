import { getUsuarioLogueado } from '../../context/auth.js';
import { mostrarNotificacion } from '../../utils/helpers.js';

export function initAdmin() {
    const usuario = getUsuarioLogueado();
    
    // 1. Proteger la ruta (Expulsar a los que no son admin)
    if (!usuario || usuario.es_admin !== 1) {
        mostrarNotificacion('Acceso denegado. No tienes permisos de administrador.', '#ff4d4d');
        setTimeout(() => window.location.href = '../Home/index.html', 1500);
        return;
    }

    // --- Lógica de Pestañas (Tabs) ---
    const tabAgregar = document.getElementById('tab-agregar');
    const tabStock = document.getElementById('tab-stock');
    const tabPedidos = document.getElementById('tab-pedidos');
    const sectionAgregar = document.getElementById('section-agregar');
    const sectionStock = document.getElementById('section-stock');
    const sectionPedidos = document.getElementById('section-pedidos');

    if (tabAgregar && tabStock && tabPedidos) {
        tabAgregar.addEventListener('click', () => {
            sectionAgregar.hidden = false;
            sectionStock.hidden = true;
            sectionPedidos.hidden = true;
            tabAgregar.classList.add('active');
            tabStock.classList.remove('active');
            tabPedidos.classList.remove('active');
        });

        tabStock.addEventListener('click', () => {
            sectionAgregar.hidden = true;
            sectionStock.hidden = false;
            sectionPedidos.hidden = true;
            tabStock.classList.add('active');
            tabAgregar.classList.remove('active');
            tabPedidos.classList.remove('active');
            cargarStock(); // Cargar la tabla al abrir la pestaña
        });

        tabPedidos.addEventListener('click', () => {
            sectionAgregar.hidden = true;
            sectionStock.hidden = true;
            sectionPedidos.hidden = false;
            tabPedidos.classList.add('active');
            tabAgregar.classList.remove('active');
            tabStock.classList.remove('active');
            cargarPedidos(); // Cargar los pedidos al abrir la pestaña
        });
    }

    // --- Lógica de la tabla de Stock ---
    async function cargarStock() {
        const tbody = document.getElementById('stock-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="4">Cargando productos...</td></tr>';
        
        try {
            const response = await fetch('http://localhost:3000/api/productos');
            const productos = await response.json();
            
            tbody.innerHTML = '';
            productos.forEach(p => {
                tbody.innerHTML += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nombre}</td>
                        <td>
                            <input type="number" id="stock-${p.id}" class="stock-input" value="${p.stock || 0}" min="0">
                        </td>
                        <td>
                            <button class="btn-update-stock" onclick="window.actualizarStock(${p.id})">Guardar</button>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="4" style="color: red;">Error al cargar el stock</td></tr>';
        }
    }

    // Función global para ser llamada desde el HTML dinámico (el botón Guardar)
    window.actualizarStock = async function(id) {
        const stock = document.getElementById(`stock-${id}`).value;
        try {
            const response = await fetch(`http://localhost:3000/api/productos/${id}/stock`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: parseInt(stock) })
            });
            
            if (response.ok) {
                mostrarNotificacion('¡Stock actualizado correctamente!', '#00c853');
            } else {
                mostrarNotificacion('Error al actualizar el stock', '#ff4d4d');
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión', '#ff4d4d');
        }
    };

    // --- Lógica de la tabla de Pedidos ---
    async function cargarPedidos() {
        const tbody = document.getElementById('pedidos-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="5">Cargando pedidos...</td></tr>';
        
        try {
            const response = await fetch('http://localhost:3000/api/pedidos');
            const pedidos = await response.json();
            
            tbody.innerHTML = '';
            if (pedidos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">No hay pedidos registrados.</td></tr>';
                return;
            }

            pedidos.forEach(p => {
                const isEnviado = p.estado === 'Enviado';
                const fecha = new Date(p.fecha_pedido).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const totalFormatted = new Intl.NumberFormat('es-CO').format(p.total);

                tbody.innerHTML += `
                    <tr>
                        <td>#${p.id}</td>
                        <td>${p.cliente}</td>
                        <td>$${totalFormatted}</td>
                        <td>${fecha}</td>
                        <td>
                            <input type="checkbox" style="transform: scale(1.5); cursor: pointer;" ${isEnviado ? 'checked' : ''} onchange="window.actualizarEstadoPedido(${p.id}, this.checked)">
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5" style="color: red;">Error al cargar los pedidos</td></tr>';
        }
    }

    window.actualizarEstadoPedido = async function(id, isChecked) {
        const nuevoEstado = isChecked ? 'Enviado' : 'Pendiente';
        try {
            const response = await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            
            if (response.ok) {
                mostrarNotificacion(`Pedido #${id} marcado como ${nuevoEstado}`, '#00c853');
            } else {
                mostrarNotificacion('Error al actualizar el estado', '#ff4d4d');
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión', '#ff4d4d');
        }
    };

    const adminForm = document.getElementById('admin-form');
    
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('prod-nombre').value;
            const precio = document.getElementById('prod-precio').value;
            const imagen_url = document.getElementById('prod-imagen').value;

            try {
                const response = await fetch('http://localhost:3000/api/productos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, precio, imagen_url: imagen_url || '../../assets/img/default.jpg' })
                });
                
                if (response.ok) {
                    mostrarNotificacion('¡Producto agregado correctamente a la BD!', '#00c853');
                    adminForm.reset();
                } else {
                    mostrarNotificacion('Error al agregar el producto', '#ff4d4d');
                }
            } catch (error) {
                mostrarNotificacion('Error de conexión con el servidor', '#ff4d4d');
            }
        });
    }
}