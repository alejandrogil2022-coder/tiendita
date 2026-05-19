import pool from './db.js';

// Lista de tus 10 productos tal como están en tu HTML
const productos = [
    { id: 1, nombre: 'Leche', precio: 5000, imagen_url: '../../assets/img/producto1.jpg' },
    { id: 2, nombre: 'Arroz Diana', precio: 10000, imagen_url: '../../assets/img/producto2.jpg' },
    { id: 3, nombre: 'Soda', precio: 2000, imagen_url: '../../assets/img/producto3.jpg' },
    { id: 4, nombre: 'Pasta', precio: 13000, imagen_url: '../../assets/img/producto4.jpg' },
    { id: 5, nombre: 'Galletas', precio: 4000, imagen_url: '../../assets/img/producto5.jpg' },
    { id: 6, nombre: 'Papas de limon', precio: 3500, imagen_url: '../../assets/img/producto6.jpg' },
    { id: 7, nombre: 'Yogurt Alpina', precio: 6000, imagen_url: '../../assets/img/producto7.jpg' },
    { id: 8, nombre: 'Manzanas', precio: 3000, imagen_url: '../../assets/img/producto8.jpg' },
    { id: 9, nombre: 'Del Valle', precio: 4500, imagen_url: '../../assets/img/producto9.jpg' },
    { id: 10, nombre: 'Tocineta', precio: 9000, imagen_url: '../../assets/img/producto10.jpg' }
];

async function poblarProductos() {
    try {
        // 1. Crear la tabla de productos si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                precio NUMERIC(10, 2) NOT NULL,
                imagen_url VARCHAR(255)
            );
        `);
        console.log('Tabla "productos" verificada/creada.');

        // 2. Insertar cada producto
        for (const prod of productos) {
            await pool.query(
                `INSERT INTO productos (id, nombre, precio, imagen_url) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id) DO UPDATE 
                 SET nombre = EXCLUDED.nombre, precio = EXCLUDED.precio, imagen_url = EXCLUDED.imagen_url;`,
                [prod.id, prod.nombre, prod.precio, prod.imagen_url]
            );
        }
        
        // 3. Sincronizar el contador automático de IDs para que no intente usar el ID 1 de nuevo
        await pool.query(`SELECT setval(pg_get_serial_sequence('productos', 'id'), (SELECT MAX(id) FROM productos));`);

        console.log('✅ ¡Los 10 productos fueron agregados a la base de datos con éxito!');
    } catch (error) {
        console.error('❌ Error al agregar productos:', error);
    } finally {
        pool.end(); // Cerrar la conexión para que el script termine
    }
}

poblarProductos();