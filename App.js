import { initHome } from './pages/Home/index.js';
import { initCart } from './pages/Cart/index.js';
import { initLogin } from './pages/login/index.js';
import { initAdmin } from './pages/Admin/index.js';
import { initPedidos } from './pages/Pedidos/index.js';

export default function App() {
    // En lugar de depender de la URL (que puede fallar según cómo abras el archivo),
    // verificamos qué elementos clave existen en la pantalla para saber en qué página estamos.
    
    if (document.querySelector('.grid-productos')) {
        initHome();
    }
    
    if (document.querySelector('.carrito')) {
        initCart();
    }
    
    if (document.querySelector('.login-box')) {
        initLogin();
    }
    
    if (document.querySelector('.admin-panel')) {
        initAdmin();
    }
    
    if (document.querySelector('.mis-pedidos-panel')) {
        initPedidos();
    }
}