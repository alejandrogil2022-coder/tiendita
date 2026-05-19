-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    es_admin INT DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen_url VARCHAR(255),
    stock INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Pedidos (La cabecera de la compra)
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente', -- Ej: Pendiente, Pagado, Enviado
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario
        FOREIGN KEY(usuario_id) 
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- Tabla de Detalles del Pedido (Los productos específicos dentro de una compra)
CREATE TABLE pedido_detalles (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_pedido
        FOREIGN KEY(pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_producto
        FOREIGN KEY(producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);