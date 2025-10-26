let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Variable global para guardar el total con descuento
let totalConDescuento = null;
let porcentajeDescuento = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize cart for all pages
  actualizarCarrito();

  // Only run on index.html (main page)
  if (document.querySelector('.banner-carrusel')) {
    initializeCarousel();
    productos = await cargarProductos();
    mostrarProductos(productos);
  }

  // renderiza footer en todas las páginas que carguen este script
  try { renderFooter(); } catch (e) { console.error('renderFooter error', e); }
});

async function cargarProductos() {
  try {
    const respuesta = await fetch("./data/productos.json");
    const data = await respuesta.json();
    return data; // 👈 devolvemos los productos
  } catch (error) {
    console.error("Error cargando productos:", error);
    return []; // devolvemos array vacío si falla
  }
}

function mostrarProductos(listaProductos) {
  const catalogo = document.getElementById('catalogo');
  catalogo.innerHTML = '';

  listaProductos.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" onclick="mostrarDetalle('${producto.id}')">
      <h2>${producto.nombre}</h2>
      <p>Precio: $${producto.precio}</p>
      <p>3 cuotas de $${(producto.precio/3).toFixed(2)}</p>
      <button onclick="mostrarDetalle('${producto.id}')">Ver más</button>
    `;

    // Si no hay stock, deshabilitar el botón
    if (producto.stock <= 0) {
      div.querySelector("button").disabled = true;
      div.querySelector("button").textContent = "Sin stock";
    }

    catalogo.appendChild(div);
  });
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const contadorCarrito = document.getElementById('contador-carrito');

  // Siempre actualizar contador si existe (todas las páginas)
  if (contadorCarrito) {
    contadorCarrito.textContent = carrito.length;
  }

  // Si no estamos en la página del carrito (no hay lista), salir
  if (!lista) return;

  // Si estamos en la página del carrito, renderizar la lista y totales
  lista.innerHTML = '';

  carrito.forEach(item => {
    const producto = (window.productos || []).find(p => String(p.id) === String(item.id));
    const maxStock = producto ? producto.stock : item.cantidad;

    const li = document.createElement('li');
    li.innerHTML = `
      ${item.nombre} - $${item.precio} x 
      <button onclick="cambiarCantidad('${item.id}', -1)">-</button>
      <span id="cantidad-${item.id}">${item.cantidad}</span>
      <button onclick="cambiarCantidad('${item.id}', 1)">+</button>
      = $${item.subtotal}
      <button onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
    `;
    lista.appendChild(li);
  });

  const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const totalEl = document.getElementById('total');
  const descuentoEl = document.getElementById('descuento-aplicado');
  const mensajeCuponEl = document.getElementById('mensaje-cupon');

  if (typeof porcentajeDescuento === 'number' && porcentajeDescuento > 0) {
    const descuento = (total * porcentajeDescuento) / 100;
    totalConDescuento = total - descuento;
    if (totalEl) totalEl.textContent = `Total: $${totalConDescuento.toFixed(2)}`;
    if (descuentoEl) descuentoEl.textContent = `Descuento aplicado: -$${descuento.toFixed(2)}`;
  } else {
    totalConDescuento = null;
    if (totalEl) totalEl.textContent = `Total: $${total}`;
    if (descuentoEl) descuentoEl.textContent = '';
  }

  if (contadorCarrito) contadorCarrito.textContent = carrito.length;

  if (carrito.length === 0) {
    if (descuentoEl) descuentoEl.textContent = '';
    if (mensajeCuponEl) mensajeCuponEl.textContent = '';
    totalConDescuento = null;
    porcentajeDescuento = null;
  }
}

document.getElementById('form-datos').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const datos = {};
  formData.forEach((valor, clave) => datos[clave] = valor);

  if (carrito.length === 0) {
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta("Tu carrito está vacío.", "error");
    }
    e.preventDefault();
    return;
  }

  const totalSinDescuento = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  let total = totalSinDescuento;
  if (typeof porcentajeDescuento === 'number' && porcentajeDescuento > 0) {
    const descuento = (totalSinDescuento * porcentajeDescuento) / 100;
    total = totalSinDescuento - descuento;
  }

  const pedido = {
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.celular,
    envio: datos.envio,
    recibe: datos.recibe,
    pago: datos.pago,
    publicidad: datos.publicidad,
    factura: datos.factura,
    productos: carrito,
    total: Number(total.toFixed(2))
  };

  // Enviar al backend (Netlify Function)
  const ok = await enviarPedido(pedido);
  if (!ok) return;

  // Limpiar y mostrar confirmación
  localStorage.removeItem('carrito');
  carrito = [];
  actualizarCarrito();
  if (typeof cargarProductos === 'function') productos = await cargarProductos();
  if (typeof mostrarProductos === 'function') mostrarProductos(productos);

  const contenedor = document.getElementById('form-datos').parentElement;
  let mensajeConfirmacion = document.getElementById("mensaje-confirmacion");
  if (!mensajeConfirmacion) {
    mensajeConfirmacion = document.createElement('p');
    mensajeConfirmacion.id = "mensaje-confirmacion";
    mensajeConfirmacion.style.fontWeight = 'bold';
    mensajeConfirmacion.style.color = '#e8499a';
    contenedor.appendChild(mensajeConfirmacion);
  }
  mensajeConfirmacion.textContent = '¡Gracias por tu pedido! Muy pronto nos pondremos en contacto.';
  setTimeout(() => { mensajeConfirmacion.textContent = ''; }, 10000);
  this.reset();
});

function cambiarCantidad(id, cambio = 0, variacion = null) {
  if (!id) return;
  // asegurar tipos numéricos
  const delta = Number(cambio) || 0;
  if (delta === 0) return;

  // localizar item
  const idStr = String(id);
  const idx = carrito.findIndex(it => String(it.id) === idStr && (variacion == null || it.variacion === variacion));
  if (idx === -1) {
    // si no existe y delta > 0, añadirlo (usa agregarAlCarrito si existe)
    if (delta > 0 && typeof window.agregarAlCarrito === 'function') {
      window.agregarAlCarrito(idStr, delta, variacion);
    }
    return;
  }

  const item = carrito[idx];

  // calcular nueva cantidad con límites razonables
  const nuevaCantidad = Math.max(0, Math.min(9999, Number(item.cantidad) + delta));
  if (!Number.isFinite(nuevaCantidad)) return;

  if (nuevaCantidad === 0) {
    // eliminar ítem
    carrito.splice(idx, 1);
  } else {
    item.cantidad = nuevaCantidad;
    item.subtotal = Number(item.precio) * item.cantidad;
  }

  if (typeof guardarCarrito === 'function') guardarCarrito();
  if (typeof actualizarCarrito === 'function') actualizarCarrito();
}
window.cambiarCantidad = cambiarCantidad;

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Mostrar alerta flotante (mensaje corto, auto-hide)
function mostrarAlerta(message = '¡Producto agregado al carrito!', type = 'success') {
  const alerta = document.getElementById('alerta');
  if (!alerta) return;
  alerta.textContent = message;
  alerta.style.display = 'block';
  // color inline según tipo (usa tu CSS si prefieres clases)
  alerta.style.backgroundColor = type === 'error' ? '#e64a4a' : '#cfa2d7';
  // auto-hide
  setTimeout(() => {
    if (alerta) alerta.style.display = 'none';
  }, 2000);
}

// Hacer accesible globalmente si algún script lo llama como window.mostrarAlerta
window.mostrarAlerta = mostrarAlerta;

function abrirModal() {
  document.getElementById('modal-carrito').style.display = 'block';
}

function cerrarModal() {
  document.getElementById('modal-carrito').style.display = 'none';
}

function filtrarProductos() {
  const texto = document.getElementById('buscador').value.toLowerCase();
  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
  mostrarProductos(productosFiltrados);
}

function ordenarProductos() {
  const filtro = document.getElementById('filtro').value;
  let productosOrdenados = [...productos];

  if (filtro === 'precio-asc') {
    productosOrdenados.sort((a, b) => a.precio - b.precio);
  } else if (filtro === 'precio-desc') {
    productosOrdenados.sort((a, b) => b.precio - a.precio);
  } else if (filtro === 'nombre') {
    productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  mostrarProductos(productosOrdenados);
}

// Reemplazar la versión modal por una que navegue a la página de producto
function mostrarDetalle(id) {
  // redirige a product.html con query param id
  window.location.href = `product.html?id=${encodeURIComponent(id)}`;
}

// Nueva función para ir a la página del carrito
function goToCart() {
  window.location.href = 'cart.html';
}

let imagenesCarrusel = [];
let indiceImagenCarrusel = 0;

// AGREGA ESTA FUNCIÓN PARA CERRAR EL MODAL DETALLE
function cerrarDetalle() {
  document.getElementById('modal-detalle').style.display = 'none';
}

// Banner carousel functionality
function initializeCarousel() {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.getElementById('banner-puntos');
  const prevBtn = document.getElementById('banner-prev');
  const nextBtn = document.getElementById('banner-next');
  let currentSlide = 0;

  if (!slides.length || !dots || !prevBtn || !nextBtn) return;

  // Create dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('span');
    dot.addEventListener('click', () => goToSlide(idx));
    dots.appendChild(dot);
  });

  // Update dots and slides
  function updateSlides() {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[currentSlide].classList.add('active');
    
    const allDots = dots.querySelectorAll('span');
    allDots.forEach(dot => dot.classList.remove('activo'));
    allDots[currentSlide].classList.add('activo');
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlides();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlides();
  }

  function goToSlide(idx) {
    currentSlide = idx;
    updateSlides();
  }

  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Auto advance
  let interval = setInterval(nextSlide, 5000);

  // Pause on hover
  const carousel = document.querySelector('.banner-carrusel');
  carousel.addEventListener('mouseenter', () => clearInterval(interval));
  carousel.addEventListener('mouseleave', () => {
    clearInterval(interval);
    interval = setInterval(nextSlide, 5000);
  });

  // Initial state
  updateSlides();
}

// Modifica la función aplicarDescuento en cupones.js así:
function aplicarDescuento(porcentaje) {
  porcentajeDescuento = porcentaje;
  actualizarCarrito();
}

document.addEventListener('DOMContentLoaded', function() {
  const envioSelect = document.querySelector('select[name="envio"]');
  const pagoSelect = document.querySelector('select[name="pago"]');

  function actualizarOpcionesPago() {
    // Verifica si ya existe la opción "Efectivo"
    let efectivoOption = Array.from(pagoSelect.options).find(opt => opt.value === "Efectivo");

    if (envioSelect.value === "Punto de retiro" || envioSelect.value === "Evento") {
      // Si no existe, la agrega
      if (!efectivoOption) {
        const option = document.createElement("option");
        option.value = "Efectivo";
        option.textContent = "Efectivo";
        pagoSelect.appendChild(option);
      }
    } else {
      // Si existe y no corresponde, la elimina
      if (efectivoOption) {
        pagoSelect.removeChild(efectivoOption);
      }
      // Si el usuario tenía seleccionado "Efectivo", lo cambia a la primera opción
      if (pagoSelect.value === "Efectivo") {
        pagoSelect.selectedIndex = 0;
      }
    }
  }

  envioSelect.addEventListener("change", actualizarOpcionesPago);
  // Ejecuta al cargar la página por si hay valores preseleccionados
  actualizarOpcionesPago();
});

// Renderizar footer común (usa innerHTML para no romper estructura)
function renderFooter() {
  const footerInner = `
    <div class="site-footer-inner">
      <p>&copy; ${new Date().getFullYear()} Alt F4 Craft - Todos los derechos reservados.</p>
      <p><a href="https://www.instagram.com/altf4.craft/" target="_blank" rel="noopener">Instagram</a></p>
    </div>
  `;
  document.querySelectorAll('.site-footer').forEach(el => {
    try { el.innerHTML = footerInner; }
    catch (err) { console.error('renderFooter error', err); }
  });
}

