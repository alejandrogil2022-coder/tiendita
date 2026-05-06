export function formatearPrecio(numero) {
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function mostrarNotificacion(mensaje, colorFondo) {
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