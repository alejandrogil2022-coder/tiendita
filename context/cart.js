export function getCart() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

export function saveCart(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function clearCart() {
    localStorage.removeItem("carrito");
}