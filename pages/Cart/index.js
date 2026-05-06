import { getCart, saveCart, clearCart } from '../../context/cart.js';
import { formatearPrecio, mostrarNotificacion } from '../../utils/helpers.js';

export function initCart() {
    const listaCarrito = document.getElementById("lista-carrito");
    const elementoTotal = document.querySelector(".carrito h3");
    const btnCompra = document.querySelector(".btn-compra");

    if (!listaCarrito) return;

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
        btnCompra.addEventListener("click", () => {
            let carrito = getCart();
            if (carrito.length === 0) {
                mostrarNotificacion("El carrito está vacío. ¡Agrega productos antes de comprar!", "#ff4d4d");
            } else {
                mostrarNotificacion("¡Compra finalizada con éxito! Gracias.", "#00c853");
                clearCart();
                renderizarCarrito();
            }
        });
    }
    renderizarCarrito();
}