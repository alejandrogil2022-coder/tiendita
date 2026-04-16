document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA PARA EL INICIO (index.html) ---
    const botonesAgregar = document.querySelectorAll('.producto button');
    
    if (botonesAgregar.length > 0) {
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const productoDiv = e.target.parentElement;
                const nombre = productoDiv.querySelector('h3').innerText;
                const precioTexto = productoDiv.querySelector('p').innerText;
                
                // Limpiamos el texto del precio (formato: $50.000 -> 50000)
                const precio = parseFloat(precioTexto.replace('$', '').replace(/\./g, '')); 
                
                const producto = { nombre, precio, cantidad: 1 };
                agregarAlCarrito(producto);
            });
        });
    }

    // --- LÓGICA PARA EL CARRITO (carrito.html) ---
    const listaCarrito = document.getElementById('lista-carrito');
    if (listaCarrito) {
        mostrarCarrito();
    }
});

// Función para guardar en LocalStorage (base de datos local del navegador)
function agregarAlCarrito(productoNuevo) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Comprobamos si el producto ya está en el carrito
    const index = carrito.findIndex(p => p.nombre === productoNuevo.nombre);
    if (index !== -1) {
        carrito[index].cantidad += 1; // Si existe, aumentamos la cantidad
    } else {
        carrito.push(productoNuevo); // Si no existe, lo agregamos
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${productoNuevo.nombre} fue agregado al carrito.`);
}

// Función para renderizar los productos en la vista del carrito
function mostrarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalElement = document.querySelector('.carrito h3');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    listaCarrito.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p>El carrito está vacío.</p>';
    } else {
        carrito.forEach((producto, index) => {
            const item = document.createElement('div');
            item.className = 'cart-item';
            item.innerHTML = `
                <p><strong>${producto.nombre}</strong> - $${producto.precio.toLocaleString('es-CO')} x ${producto.cantidad}</p>
                <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar">Eliminar</button>
            `;
            listaCarrito.appendChild(item);
            total += producto.precio * producto.cantidad;
        });
    }

    totalElement.innerText = `Total: $${total.toLocaleString('es-CO')}`;
}

// Función para eliminar un producto del carrito
window.eliminarDelCarrito = function(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
};