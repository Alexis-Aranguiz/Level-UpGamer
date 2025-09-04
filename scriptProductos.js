let carrito = [];
let total = 0;

function agregarAlCarrito(nombre, precio) {
    // Si el producto ya está en el carrito, aumenta la cantidad
    const existente = carrito.find(item => item.nombre === nombre);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    calcularTotal();
    mostrarCarrito();
}

function eliminarDelCarrito(nombre) {
    carrito = carrito.filter(item => item.nombre !== nombre);
    calcularTotal();
    mostrarCarrito();
}

function modificarCantidad(nombre, nuevaCantidad) {
    const producto = carrito.find(item => item.nombre === nombre);
    if (producto) {
        producto.cantidad = nuevaCantidad > 0 ? nuevaCantidad : 1;
    }
    calcularTotal();
    mostrarCarrito();
}

function calcularTotal() {
    total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function mostrarCarrito() {
    let lista = document.getElementById("lista-carrito");
    lista.innerHTML = "";

    carrito.forEach((item, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            ${item.nombre} - $${item.precio} x ${item.cantidad} = $${item.precio * item.cantidad}
            <button onclick="eliminarDelCarrito('${item.nombre}')">Eliminar</button>
            <input type="number" min="1" value="${item.cantidad}" style="width:40px"
                onchange="modificarCantidad('${item.nombre}', this.value)">
        `;
        lista.appendChild(li);
    });

    document.getElementById("total").textContent = "Total: $" + total;
}