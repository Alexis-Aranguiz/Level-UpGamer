let carrito = [];
let total = 0;

// Recuperar puntos desde localStorage o iniciar en 0
let puntosLevelUp = parseInt(localStorage.getItem('puntosLevelUp')) || 0;

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

    // Mostrar puntos Level-Up actuales
    let puntosDiv = document.getElementById("puntos-levelup");
    if (!puntosDiv) {
        puntosDiv = document.createElement("div");
        puntosDiv.id = "puntos-levelup";
        lista.parentNode.appendChild(puntosDiv);
    }
    puntosDiv.innerHTML = `Puntos Level-Up acumulados: <b>${puntosLevelUp}</b>`;

    // Mostrar botón de pagar solo si hay productos
    let pagarDiv = document.getElementById("pagar-div");
    if (!pagarDiv) {
        pagarDiv = document.createElement("div");
        pagarDiv.id = "pagar-div";
        lista.parentNode.appendChild(pagarDiv);
    }
    pagarDiv.innerHTML = "";

    if (carrito.length > 0) {
        pagarDiv.innerHTML = `<button id="btn-pagar">Pagar</button>
            <div id="mensaje-pago" style="margin-top:10px;"></div>`;
        document.getElementById("btn-pagar").onclick = realizarPago;
    }
}

function realizarPago() {
    // Calcular puntos Level-Up (1% del total)
    const puntos = Math.floor(total * 0.001);
    puntosLevelUp += puntos; // Sumar a los puntos acumulados

    // Guardar los puntos en localStorage
    localStorage.setItem('puntosLevelUp', puntosLevelUp);

    const mensaje = `
        ¡Compra realizada correctamente!<br>
        Recibirás una boleta en tu correo electrónico.<br>
        Has ganado <b>${puntos} puntos Level-Up</b>.<br>
        Total acumulado: <b>${puntosLevelUp} puntos Level-Up</b>.
    `;

    // Vaciar carrito antes de mostrar el mensaje
    carrito = [];
    calcularTotal();
    mostrarCarrito();

    // Mostrar el mensaje aunque el carrito esté vacío
    let pagarDiv = document.getElementById("pagar-div");
    if (pagarDiv) {
        pagarDiv.innerHTML = `<div id="mensaje-pago" style="margin-top:10px;">${mensaje}</div>`;
    }

    // Actualizar visualización de puntos
    let puntosDiv = document.getElementById("puntos-levelup");
    if (puntosDiv) {
        puntosDiv.innerHTML = `Puntos Level-Up acumulados: <b>${puntosLevelUp}</b>`;
    }
}

// Guardar y cargar reseñas en localStorage por producto
function getReseñasExtra(nombre) {
    return JSON.parse(localStorage.getItem("reseñas_" + nombre)) || [];
}
function saveReseña(nombre, reseña) {
    const arr = getReseñasExtra(nombre);
    arr.push(reseña);
    localStorage.setItem("reseñas_" + nombre, JSON.stringify(arr));
}

// Mostrar el formulario de reseña
document.getElementById('btn-reseñar').onclick = function() {
    document.getElementById('form-reseña').style.display = 'block';
};

// Manejo de estrellas seleccionables
let estrellasSeleccionadas = 0;
document.querySelectorAll('#estrellas-reseña span').forEach(star => {
    star.onclick = function() {
        estrellasSeleccionadas = parseInt(this.getAttribute('data-star'));
        document.querySelectorAll('#estrellas-reseña span').forEach((s, i) => {
            s.textContent = i < estrellasSeleccionadas ? "★" : "☆";
        });
    };
});

// Enviar reseña
document.getElementById('enviar-reseña').onclick = function() {
    const texto = document.getElementById('texto-reseña').value.trim();
    if (!texto) {
        alert("Por favor, escribe tu reseña.");
        return;
    }
    if (estrellasSeleccionadas === 0) {
        alert("Por favor, selecciona una calificación.");
        return;
    }
    const nombreProducto = document.getElementById('modal-nombre').textContent;
    saveReseña(nombreProducto, { texto, estrellas: estrellasSeleccionadas });
    document.getElementById('texto-reseña').value = "";
    estrellasSeleccionadas = 0;
    document.querySelectorAll('#estrellas-reseña span').forEach(s => s.textContent = "☆");
    document.getElementById('form-reseña').style.display = 'none';
    mostrarReseñasModal(nombreProducto);
    alert("¡Gracias por tu reseña!");
};

// Mostrar reseñas (originales + nuevas) en el modal
function mostrarReseñasModal(nombreProducto) {
    // Busca el producto original
    const producto = productos.find(p => p.nombre === nombreProducto);
    const reseñasOriginales = producto ? producto.reseñas : [];
    const reseñasExtras = getReseñasExtra(nombreProducto);
    const reseñas = [...reseñasOriginales, ...reseñasExtras];
    const listaReseñas = document.getElementById('modal-lista-reseñas');
    listaReseñas.innerHTML = "";
    reseñas.forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="estrellas">${"★".repeat(r.estrellas)}${"☆".repeat(5 - r.estrellas)}</span> ${r.texto}`;
        listaReseñas.appendChild(li);
    });
}

// Modifica el evento de mostrar modal para usar mostrarReseñasModal
document.querySelectorAll('.producto').forEach(producto => {
    producto.addEventListener('click', function(e) {
        document.getElementById('modal-detalle').style.display = 'block';
        document.getElementById('modal-nombre').textContent = producto.getAttribute('data-nombre');
        document.getElementById('modal-img').src = producto.getAttribute('data-img');
        document.getElementById('modal-img').alt = producto.getAttribute('data-nombre');
        document.getElementById('modal-descripcion').innerHTML = producto.getAttribute('data-descripcion');
        document.getElementById('form-reseña').style.display = 'none';
        mostrarReseñasModal(producto.getAttribute('data-nombre'));
    });
    producto.querySelector('button').addEventListener('click', function(e) {
        e.stopPropagation();
    });
});