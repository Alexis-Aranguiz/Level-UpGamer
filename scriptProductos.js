let carrito = [];
let total = 0;


let puntosLevelUp = parseInt(localStorage.getItem('puntosLevelUp')) || 0;

function agregarAlCarrito(nombre, precio) {
    
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
        producto.cantidad = nuevaCantidad > 0 ? Number(nuevaCantidad) : 1;
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

    carrito.forEach((item) => {
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

  
    let puntosDiv = document.getElementById("puntos-levelup");
    if (!puntosDiv) {
        puntosDiv = document.createElement("div");
        puntosDiv.id = "puntos-levelup";
        lista.parentNode.appendChild(puntosDiv);
    }
    puntosDiv.innerHTML = `Puntos Level-Up acumulados: <b>${puntosLevelUp}</b>`;

    
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
    
    const puntos = Math.floor(total * 0.001);
    puntosLevelUp += puntos; 

    
    localStorage.setItem('puntosLevelUp', puntosLevelUp);

    const mensaje = `
        ¡Compra realizada correctamente!<br>
        Recibirás una boleta en tu correo electrónico.<br>
        Has ganado <b>${puntos} puntos Level-Up</b>.<br>
        Total acumulado: <b>${puntosLevelUp} puntos Level-Up</b>.
    `;

    
    carrito = [];
    calcularTotal();
    mostrarCarrito();

    
    let pagarDiv = document.getElementById("pagar-div");
    if (pagarDiv) {
        pagarDiv.innerHTML = `<div id="mensaje-pago" style="margin-top:10px;">${mensaje}</div>`;
    }

    
    let puntosDiv = document.getElementById("puntos-levelup");
    if (puntosDiv) {
        puntosDiv.innerHTML = `Puntos Level-Up acumulados: <b>${puntosLevelUp}</b>`;
    }
}


function getReseñasExtra(nombre) {
    return JSON.parse(localStorage.getItem("reseñas_" + nombre)) || [];
}
function saveReseña(nombre, reseña) {
    const arr = getReseñasExtra(nombre);
    arr.push(reseña);
    localStorage.setItem("reseñas_" + nombre, JSON.stringify(arr));
}


document.getElementById('btn-reseñar').onclick = function() {
    document.getElementById('form-reseña').style.display = 'block';
};


let estrellasSeleccionadas = 0;
document.querySelectorAll('#estrellas-reseña span').forEach(star => {
    star.onclick = function() {
        estrellasSeleccionadas = parseInt(this.getAttribute('data-star'));
        document.querySelectorAll('#estrellas-reseña span').forEach((s, i) => {
            s.textContent = i < estrellasSeleccionadas ? "★" : "☆";
        });
    };
});


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


function mostrarReseñasModal(nombreProducto) {
    
    const producto = productos.find(p => p.nombre === nombreProducto);
    const reseñasOriginales = producto ? (producto.reseñas || []) : [];
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


document.querySelectorAll('.producto').forEach(card => {
    card.addEventListener('click', function() {
        const nombre = card.getAttribute('data-nombre');
        const img = card.getAttribute('data-img');

       
        document.getElementById('modal-detalle').style.display = 'block';
        document.getElementById('modal-nombre').textContent = nombre;
        document.getElementById('modal-img').src = img;
        document.getElementById('modal-img').alt = nombre;

        
        const p = productos.find(x => x.nombre === nombre);
        const descLargaDesdeArray =
            p ? (p.descripcionLarga || p.descripcion || "") : "";

        
        const descFromDataset = card.getAttribute('data-descripcion') || "";

        
        const descripcionParaModal = descLargaDesdeArray || descFromDataset || "";
        document.getElementById('modal-descripcion').innerHTML = descripcionParaModal;

       
        document.getElementById('form-reseña').style.display = 'none';
        mostrarReseñasModal(nombre);
    });

 
    const btn = card.querySelector('button');
    if (btn) btn.addEventListener('click', e => e.stopPropagation());
    const link = card.querySelector('a');
    if (link) link.addEventListener('click', e => e.stopPropagation());
});


document.getElementById("share-facebook").onclick = () => {
    const { url } = getShareData();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
};
document.getElementById("share-twitter").onclick = () => {
    const { texto } = getShareData();
    window.open(`https://twitter.com/intent/tweet?text=${texto}`, "_blank");
};
document.getElementById("share-whatsapp").onclick = () => {
    const { texto } = getShareData();
    window.open(`https://wa.me/?text=${texto}`, "_blank");
};
