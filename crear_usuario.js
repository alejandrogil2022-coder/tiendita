async function crearUsuarioPrueba() {
    try {
        const respuesta = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'Juan Perez',
                email: 'juan@ejemplo.com',
                password: '12345678'
            })
        });
        const data = await respuesta.json();
        console.log('Resultado:', data);
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

crearUsuarioPrueba();