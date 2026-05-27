import 'dotenv/config'; // Carga las variables de entorno
import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import pool from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite recibir datos en formato JSON

// Servir archivos estáticos del frontend
app.use(express.static(__dirname));

// Ruta para REGISTRAR un nuevo usuario
app.post('/api/register', async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        // Generamos un "salt" y encriptamos la contraseña (10 rondas es el estándar seguro)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email',
            [nombre, email, passwordHash]
        );
        
        res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// Ruta para INICIAR SESIÓN (Login)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Buscamos el usuario en la BD por su correo
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = resultado.rows[0];
        
        // 2. Comparamos la contraseña en texto plano enviada con el HASH de la base de datos
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordValida) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        res.status(200).json({ 
            mensaje: 'Login exitoso', 
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, es_admin: usuario.es_admin }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
});

// Ruta para CREAR un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    const { usuario_id, productos } = req.body;

    if (!usuario_id || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Faltan datos para crear el pedido.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Iniciar transacción

        // 1. Calcular el total del pedido
        let total = 0;
        for (const producto of productos) {
            total += producto.precio * producto.cantidad;
        }

        // 2. Insertar en la tabla 'pedidos'
        const pedidoResult = await client.query(
            'INSERT INTO pedidos (usuario_id, total) VALUES ($1, $2) RETURNING id',
            [usuario_id, total]
        );
        const pedidoId = pedidoResult.rows[0].id;

        // 3. Insertar cada producto en 'pedido_detalles' y actualizar el stock
        for (const producto of productos) {
            await client.query(
                'INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [pedidoId, producto.id, producto.cantidad, producto.precio]
            );

            // 4. Restar la cantidad comprada del stock actual del producto
            await client.query(
                'UPDATE productos SET stock = stock - $1 WHERE id = $2',
                [producto.cantidad, producto.id]
            );
        }

        await client.query('COMMIT'); // Confirmar transacción
        res.status(201).json({ mensaje: 'Pedido creado con éxito', pedidoId });
    } catch (error) {
        await client.query('ROLLBACK'); // Revertir en caso de error
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error en el servidor al crear el pedido' });
    } finally {
        client.release(); // Liberar el cliente
    }
});

// Ruta para OBTENER todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para AGREGAR un nuevo producto (Para el panel de Admin)
app.post('/api/productos', async (req, res) => {
    const { nombre, precio, imagen_url } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Faltan datos importantes del producto.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, precio, imagen_url) VALUES ($1, $2, $3) RETURNING *',
            [nombre, precio, imagen_url || '../../assets/img/default.jpg']
        );
        res.status(201).json({ mensaje: 'Producto agregado con éxito', producto: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

// Ruta para ACTUALIZAR el stock de un producto
app.put('/api/productos/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE productos SET stock = $1 WHERE id = $2 RETURNING *',
            [stock, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json({ mensaje: 'Stock actualizado con éxito', producto: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el stock' });
    }
});

// Ruta para OBTENER todos los pedidos (Panel Admin)
app.get('/api/pedidos', async (req, res) => {
    try {
        const query = `
            SELECT p.id, u.nombre as cliente, p.total, p.estado, p.fecha_pedido
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.fecha_pedido DESC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

// Ruta para ACTUALIZAR el estado de un pedido (Panel Admin)
app.put('/api/pedidos/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.status(200).json({ mensaje: 'Estado actualizado con éxito', pedido: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
});

// Ruta para OBTENER los pedidos de un USUARIO ESPECÍFICO
app.get('/api/usuarios/:id/pedidos', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT id, total, estado, fecha_pedido
            FROM pedidos
            WHERE usuario_id = $1
            ORDER BY fecha_pedido DESC
        `;
        const result = await pool.query(query, [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los pedidos del usuario' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la Tiendita corriendo en http://localhost:${PORT}`);
});