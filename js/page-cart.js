// Renderiza el carrito en cart.html y conecta controles con las funciones globales
document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
});

function renderCartPage() {
  const listaEl = document.getElementById('lista-carrito');
  const totalEl = document.getElementById('total');
  const descuentoEl = document.getElementById('descuento-aplicado');

  let carritoLocal = JSON.parse(localStorage.getItem('carrito')) || [];
  listaEl.innerHTML = '';

  if (!carritoLocal.length) {
    listaEl.innerHTML = '<li>El carrito está vacío. <a href="index.html">Volver al catálogo</a></li>';
    totalEl.textContent = 'Total: $0';
    return;
  }

  carritoLocal.forEach(item => {
    const li = document.createElement('li');
    li.className = 'carrito-item';
    li.innerHTML = `
      <div class="item-imagen"><img src="${item.imagen || 'img/placeholder.png'}" alt="${escapeHtml(item.nombre)}" width="80"></div>
      <div class="item-info">
        <strong>${escapeHtml(item.nombre)}</strong>
        <div>Precio: $${Number(item.precio).toFixed(2)}</div>
        <div>Cant: 
          <button data-id="${item.id}" class="cant-minus">-</button>
          <span class="cantidad">${item.cantidad}</span>
          <button data-id="${item.id}" class="cant-plus">+</button>
        </div>
        <div>Subtotal: $<span class="subtotal">${Number(item.subtotal).toFixed(2)}</span></div>
        <div><button data-id="${item.id}" class="eliminar-item">Eliminar</button></div>
      </div>
    `;
    listaEl.appendChild(li);
  });

  // mostrar total
  const total = carritoLocal.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);
  totalEl.textContent = `Total: $${total.toFixed(2)}`;

  if (window.porcentajeDescuento) {
    descuentoEl.textContent = `Descuento aplicado: ${window.porcentajeDescuento}%`;
  }

  // Delegación de eventos para botones de cantidad y eliminar
  listaEl.addEventListener('click', (e) => {
    const target = e.target;
    const id = target.getAttribute('data-id');
    // botones +/- tienen clases cant-minus / cant-plus
    if (target.classList.contains('cant-minus')) {
      // si tienes variaciones, almacena data-variacion en el botón y pásala
      const variacion = target.getAttribute('data-variacion') || null;
      if (typeof window.cambiarCantidad === 'function') {
        window.cambiarCantidad(id, -1, variacion);
        renderCartPage();
      }
    } else if (target.classList.contains('cant-plus')) {
      const variacion = target.getAttribute('data-variacion') || null;
      if (typeof window.cambiarCantidad === 'function') {
        window.cambiarCantidad(id, 1, variacion);
        renderCartPage();
      }
    } else if (target.classList.contains('eliminar-item')) {
      const variacion = target.getAttribute('data-variacion') || null;
      if (typeof window.eliminarDelCarrito === 'function') {
        window.eliminarDelCarrito(id, variacion);
        renderCartPage();
      } else {
        // fallback
        carrito = carrito.filter(it => !(String(it.id) === String(id) && (variacion == null || it.variacion === variacion)));
        if (typeof guardarCarrito === 'function') guardarCarrito();
        renderCartPage();
      }
    }
  });
}

// helpers
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}