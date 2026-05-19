import pkg from 'pg';
import 'dotenv/config'; // Carga las variables del archivo .env
const { Pool } = pkg;

// Configuración de la conexión a la base de datos
// Ahora los datos se leen desde el archivo .env por seguridad
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
    ssl: {
        rejectUnauthorized: false // Requerido por servicios en la nube como Render/Supabase
    }
});

// Probando la conexión
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error adquiriendo el cliente', err.stack);
    }
    console.log('¡Conexión a la base de datos exitosa!');
});

export default pool;