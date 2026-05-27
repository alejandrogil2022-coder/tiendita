import { getCart, saveCart, clearCart } from '../../context/cart.js';
import { getUsuarioLogueado } from '../../context/auth.js';
import { formatearPrecio, mostrarNotificacion } from '../../utils/helpers.js';

export async function initCart() {
    const listaCarrito = document.getElementById("lista-carrito");
    const elementoTotal = document.querySelector(".carrito h3");
    const btnCompra = document.querySelector(".btn-compra");

    if (!listaCarrito) return;

    // Cargar los productos desde la base de datos para conocer el stock real actual
    let productosDB = [];
    try {
        const response = await fetch('/api/productos');
        productosDB = await response.json();
    } catch (error) {
        console.error("Error al obtener productos para validar stock:", error);
    }

    function renderizarCarrito() {
        let carrito = getCart();
        listaCarrito.innerHTML = "";
        let total = 0;

        if (carrito.length === 0) {
            listaCarrito.innerHTML = "<p style='margin: 20px 0;'>No hay productos en tu carrito.</p>";
            elementoTotal.textContent = "Total: $0";
            return;
        }

        carrito.forEach((producto, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item-carrito");
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;

            itemDiv.innerHTML = `
                <div class="item-carrito-info">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <h4>${producto.nombre}</h4>
                </div>
                <div class="item-carrito-controles">
                    <button onclick="window.cambiarCantidad(${index}, -1)">-</button>
                    <p>${producto.cantidad}</p>
                    <button onclick="window.cambiarCantidad(${index}, 1)">+</button>
                </div>
                <p class="item-carrito-precio">$${formatearPrecio(subtotal)}</p>
                <button class="btn-eliminar" onclick="window.eliminarDelCarrito(${index})">Eliminar</button>
            `;
            listaCarrito.appendChild(itemDiv);
        });

        elementoTotal.textContent = `Total: $${formatearPrecio(total)}`;
    }

    window.eliminarDelCarrito = function(index) {
        let carrito = getCart();
        const nombreProducto = carrito[index].nombre;
        carrito.splice(index, 1);
        saveCart(carrito);
        renderizarCarrito();
        mostrarNotificacion(`¡${nombreProducto} eliminado del carrito!`, "#ff4d4d");
    };

    window.cambiarCantidad = function(index, cambio) {
        let carrito = getCart();
        
        // Si el usuario intenta sumar, validamos contra el stock real
        if (cambio > 0) {
            const idProducto = carrito[index].id;
            const productoBD = productosDB.find(p => p.id?.toString() === idProducto?.toString());
            const stockReal = productoBD ? parseInt(productoBD.stock) || 0 : 0;
            
            if (carrito[index].cantidad + cambio > stockReal) {
                mostrarNotificacion(`No puedes agregar más. Stock máximo disponible: ${stockReal}`, "#ff4d4d");
                return;
            }
        }

        carrito[index].cantidad += cambio;
        if (carrito[index].cantidad <= 0) {
            const nombreProducto = carrito[index].nombre;
            carrito.splice(index, 1);
            mostrarNotificacion(`¡${nombreProducto} eliminado del carrito!`, "#ff4d4d");
        }
        saveCart(carrito);
        renderizarCarrito();
    };

    if (btnCompra) {
        btnCompra.addEventListener("click", async () => {
            let carrito = getCart();
            const usuario = getUsuarioLogueado();

            // 1. Validar que el usuario haya iniciado sesión
            if (!usuario) {
                mostrarNotificacion("Debes iniciar sesión para poder comprar.", "#ff4d4d");
                setTimeout(() => {
                    window.location.href = '../../pages/login/login.html';
                }, 2000);
                return;
            }

            // 2. Validar que el carrito no esté vacío
            if (carrito.length === 0) {
                mostrarNotificacion("El carrito está vacío. ¡Agrega productos antes de comprar!", "#ff4d4d");
                return;
            }

            // 3. Preparar los datos para enviar al backend
            const pedido = {
                usuario_id: usuario.id,
                productos: carrito
            };

            // 4. Enviar la petición al servidor
            try {
                const response = await fetch('/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pedido)
                });

                if (response.ok) {
                    mostrarNotificacion("¡Compra finalizada con éxito! Gracias.", "#00c853");
                    clearCart();
                    renderizarCarrito();
                } else {
                    mostrarNotificacion("Hubo un error al procesar tu pedido.", "#ff4d4d");
                }
            } catch (error) {
                mostrarNotificacion("Error de conexión al procesar el pedido.", "#ff4d4d");
            }
        });
    }
    renderizarCarrito();
}