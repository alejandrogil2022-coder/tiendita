import { getCart, saveCart } from '../../context/cart.js';
import { mostrarNotificacion } from '../../utils/helpers.js';

export function initHome() {
    const productosDivs = document.querySelectorAll(".producto");
    if (productosDivs.length === 0) return; // Si no hay productos, no estamos en Home

    productosDivs.forEach((productoDiv) => {
        const btnRestar = productoDiv.querySelector(".restar-prod");
        const btnSumar = productoDiv.querySelector(".sumar-prod");
        const spanCantidad = productoDiv.querySelector(".cantidad-prod");
        const btnAgregar = productoDiv.querySelector(".btn-agregar");

        if (btnRestar && btnSumar && spanCantidad && btnAgregar) {
            let cantidadActual = 1;

            btnRestar.addEventListener("click", () => {
                if (cantidadActual > 1) {
                    cantidadActual--;
                    spanCantidad.textContent = cantidadActual;
                }
            });

            btnSumar.addEventListener("click", () => {
                cantidadActual++;
                spanCantidad.textContent = cantidadActual;
            });

            btnAgregar.addEventListener("click", () => {
                const nombre = productoDiv.querySelector("h3").textContent;
                const precioTexto = productoDiv.querySelector("p").textContent;
                const precio = parseFloat(precioTexto.replace("$", "").replace(".", ""));
                const imagen = productoDiv.querySelector("img").src;

                let carrito = getCart();
                const productoExistente = carrito.find(item => item.nombre === nombre);
                
                if (productoExistente) productoExistente.cantidad += cantidadActual;
                else carrito.push({ nombre, precio, imagen, cantidad: cantidadActual });

                saveCart(carrito);
                mostrarNotificacion(`¡${nombre} agregado al carrito!`, "#00c853");
                
                cantidadActual = 1;
                spanCantidad.textContent = cantidadActual;
            });
        }
    });
}