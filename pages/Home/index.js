import { getCart, saveCart } from '../../context/cart.js';
import { mostrarNotificacion } from '../../utils/helpers.js';

export async function initHome() {
    const gridProductos = document.querySelector(".grid-productos");
    if (!gridProductos) return; // Si no hay contenedor, no estamos en Home

    try {
        // 1. Obtener los productos desde el backend
        const response = await fetch('/api/productos');
        const productos = await response.json();

        // 2. Limpiar el mensaje de "Cargando productos..."
        gridProductos.innerHTML = '';

        if (productos.length === 0) {
            gridProductos.innerHTML = '<p style="text-align: center; width: 100%;">No hay productos disponibles por ahora.</p>';
            return;
        }

        // 3. Renderizar (dibujar) cada producto
        productos.forEach((producto) => {
            const precioFormateado = new Intl.NumberFormat('es-CO').format(producto.precio);
            const stockReal = parseInt(producto.stock) || 0; // Nos aseguramos de que sea un número
            
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            productoDiv.dataset.id = producto.id;

            // Usar la imagen de la BD o una por defecto
            const imagenUrl = producto.imagen_url ? producto.imagen_url : '../../assets/img/default.jpg';

            productoDiv.innerHTML = `
                <img src="${imagenUrl}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p class="producto-precio">$${precioFormateado}</p>
                <p class="producto-stock" style="font-size: 14px; color: #555; margin-bottom: 10px;">
                    ${stockReal > 0 ? `Stock disponible: <strong>${stockReal}</strong>` : '<span style="color: red; font-weight: bold;">Agotado</span>'}
                </p>
                <div class="acciones-producto">
                    <div class="control-cantidad">
                        <button class="restar-prod">-</button>
                        <span class="cantidad-prod">${stockReal > 0 ? 1 : 0}</span>
                        <button class="sumar-prod">+</button>
                    </div>
                    <button class="btn-agregar">Agregar</button>
                </div>
            `;

            // 4. Agregar la lógica de los botones PARA ESTE PRODUCTO
            const btnRestar = productoDiv.querySelector(".restar-prod");
            const btnSumar = productoDiv.querySelector(".sumar-prod");
            const spanCantidad = productoDiv.querySelector(".cantidad-prod");
            const btnAgregar = productoDiv.querySelector(".btn-agregar");

            let cantidadActual = stockReal > 0 ? 1 : 0;

            // Si no hay stock, deshabilitamos todos los botones
            if (stockReal === 0) {
                btnAgregar.disabled = true;
                btnAgregar.style.backgroundColor = '#ccc';
                btnAgregar.style.cursor = 'not-allowed';
                btnSumar.disabled = true;
                btnRestar.disabled = true;
            }

            btnRestar.addEventListener("click", () => {
                if (cantidadActual > 1) {
                    cantidadActual--;
                    spanCantidad.textContent = cantidadActual;
                }
            });

            btnSumar.addEventListener("click", () => {
                if (cantidadActual < stockReal) {
                    cantidadActual++;
                    spanCantidad.textContent = cantidadActual;
                } else {
                    mostrarNotificacion(`Solo hay ${stockReal} unidades disponibles.`, "#ff4d4d");
                }
            });

            btnAgregar.addEventListener("click", () => {
                // Usar datos directos de la BD, ¡es mucho más seguro!
                const id = producto.id.toString();
                const nombre = producto.nombre;
                const precio = parseFloat(producto.precio);
                const imagen = imagenUrl;

                let carrito = getCart();
                const productoExistente = carrito.find(item => item.id === id);
                const cantidadEnCarrito = productoExistente ? productoExistente.cantidad : 0;

                // Validar que la suma de lo que ya está en el carrito + lo que va a agregar no supere el stock
                if (cantidadEnCarrito + cantidadActual > stockReal) {
                    mostrarNotificacion(`No puedes agregar más. Stock máximo: ${stockReal} (Ya tienes ${cantidadEnCarrito} en el carrito).`, "#ff4d4d");
                    return;
                }
                
                if (productoExistente) productoExistente.cantidad += cantidadActual;
                else carrito.push({ id, nombre, precio, imagen, cantidad: cantidadActual });

                saveCart(carrito);
                mostrarNotificacion(`¡${nombre} agregado al carrito!`, "#00c853");
                
                cantidadActual = 1;
                spanCantidad.textContent = cantidadActual;
            });
            
            // 5. Inyectar en el HTML
            gridProductos.appendChild(productoDiv);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
        gridProductos.innerHTML = '<p style="text-align: center; width: 100%; color: red;">Error al cargar los productos. Por favor, recarga la página.</p>';
    }
}