document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Lógica para Agregar al Carrito (index.html) ---
    const productosDivs = document.querySelectorAll(".producto");

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

                const producto = {
                    nombre,
                    precio,
                    imagen,
                    cantidad: cantidadActual
                };

                agregarAlCarrito(producto);
                
                // Resetear el contador a 1 después de agregar al carrito
                cantidadActual = 1;
                spanCantidad.textContent = cantidadActual;
            });
        }
    });

    function agregarAlCarrito(productoNuevo) {
        // Obtener el carrito actual desde el LocalStorage (o un array vacío si no existe)
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        
        // Verificar si el producto ya está en el carrito para aumentar su cantidad
        const productoExistente = carrito.find(item => item.nombre === productoNuevo.nombre);
        if (productoExistente) {
            // Ahora sumamos la cantidad que eligió el usuario en el selector, no siempre 1
            productoExistente.cantidad += productoNuevo.cantidad;
        } else {
            carrito.push(productoNuevo);
        }

        // Guardar el carrito actualizado nuevamente en el LocalStorage
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarNotificacion(`¡${productoNuevo.nombre} agregado al carrito!`, "#00c853");
    }


    // --- 2. Lógica para Mostrar el Carrito (carrito.html) ---
    const listaCarrito = document.getElementById("lista-carrito");
    const elementoTotal = document.querySelector(".carrito h3");
    const btnCompra = document.querySelector(".btn-compra");

    // Si existe el contenedor #lista-carrito, significa que estamos en carrito.html
    if (listaCarrito) {
        renderizarCarrito();

        btnCompra.addEventListener("click", () => {
            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            if (carrito.length === 0) {
                mostrarNotificacion("El carrito está vacío. ¡Agrega productos antes de comprar!", "#ff4d4d");
            } else {
                mostrarNotificacion("¡Compra finalizada con éxito! Gracias por tu compra.", "#00c853");
                localStorage.removeItem("carrito"); // Vaciar el carrito
                renderizarCarrito();
            }
        });
    }

    function renderizarCarrito() {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        listaCarrito.innerHTML = "";
        let total = 0;

        if (carrito.length === 0) {
            listaCarrito.innerHTML = "<p style='margin: 20px 0;'>No hay productos en tu carrito.</p>";
            elementoTotal.textContent = "Total: $0";
            return;
        }

        carrito.forEach((producto, index) => {
            const itemDiv = document.createElement("div");
            // Estilos básicos aplicados desde JS para mantener intacto tu styles.css
            itemDiv.style.display = "flex";
            itemDiv.style.justifyContent = "space-between";
            itemDiv.style.alignItems = "center";
            itemDiv.style.background = "white";
            itemDiv.style.padding = "10px 20px";
            itemDiv.style.marginBottom = "10px";
            itemDiv.style.borderRadius = "8px";
            itemDiv.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.1)";

            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;

            itemDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; width: 50%; text-align: left;">
                    <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                    <h4 style="margin: 0;">${producto.nombre}</h4>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="cambiarCantidad(${index}, -1)" style="padding: 5px 10px; cursor: pointer; border: 1px solid #ccc; background: #f9f9f9; border-radius: 4px; font-weight: bold;">-</button>
                    <p style="margin: 0; min-width: 20px; text-align: center;">${producto.cantidad}</p>
                    <button onclick="cambiarCantidad(${index}, 1)" style="padding: 5px 10px; cursor: pointer; border: 1px solid #ccc; background: #f9f9f9; border-radius: 4px; font-weight: bold;">+</button>
                </div>
                <p style="margin: 0; font-weight: bold;">$${formatearPrecio(subtotal)}</p>
                <button onclick="eliminarDelCarrito(${index})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Eliminar</button>
            `;

            listaCarrito.appendChild(itemDiv);
        });

        elementoTotal.textContent = `Total: $${formatearPrecio(total)}`;
    }

    // Función global para poder ser llamada desde el HTML inyectado
    window.eliminarDelCarrito = function(index) {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        carrito.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderizarCarrito(); // Actualizar la vista automáticamente
    };

    // Función global para cambiar la cantidad sumando o restando
    window.cambiarCantidad = function(index, cambio) {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        
        carrito[index].cantidad += cambio;
        
        // Si la cantidad llega a 0 (o menos), se elimina el producto del carrito
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderizarCarrito(); // Recargar la lista para reflejar el cambio y recalcular total
    };

    // Función de ayuda para volver a colocar los puntos en los miles (Ej: 10000 -> 10.000)
    function formatearPrecio(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Función para mostrar notificaciones personalizadas (toast)
    function mostrarNotificacion(mensaje, colorFondo) {
        const notificacion = document.createElement("div");
        notificacion.textContent = mensaje;
        
        // Estilos de la notificación aplicados por JS
        notificacion.style.position = "fixed";
        notificacion.style.bottom = "20px";
        notificacion.style.right = "20px";
        notificacion.style.backgroundColor = colorFondo;
        notificacion.style.color = "white";
        notificacion.style.padding = "15px 25px";
        notificacion.style.borderRadius = "8px";
        notificacion.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.2)";
        notificacion.style.zIndex = "1000";
        notificacion.style.fontWeight = "bold";
        notificacion.style.opacity = "0";
        notificacion.style.transform = "translateY(20px)";
        notificacion.style.transition = "all 0.3s ease";

        document.body.appendChild(notificacion);

        // Animación de entrada
        setTimeout(() => {
            notificacion.style.opacity = "1";
            notificacion.style.transform = "translateY(0)";
        }, 10);

        // Animación de salida y eliminación tras 3 segundos
        setTimeout(() => {
            notificacion.style.opacity = "0";
            notificacion.style.transform = "translateY(20px)";
            setTimeout(() => {
                notificacion.remove();
            }, 300);
        }, 3000);
    }
});