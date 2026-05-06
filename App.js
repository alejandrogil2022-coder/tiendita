import { initHome } from './pages/Home/index.js';
import { initCart } from './pages/Cart/index.js';
import { initLogin } from './pages/login/index.js';

export default function App() {
    // Aquí podemos ejecutar lógica global de la app
    // y luego iniciar las vistas de cada página
    initHome();
    initCart();
    initLogin();
}