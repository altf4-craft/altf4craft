// Renderiza el carrito en cart.html y conecta controles con las funciones globales
document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();

  const listaEl = document.getElementById('lista-carrito');
  if (!listaEl) return;

  // handler único para delegación de eventos en el carrito
  function onCartClick(e) {
    const target = e.target;
    const id = target.getAttribute('data-id');
    const variacion = target.getAttribute('data-variacion') || null;

    if (target.classList.contains('cant-minus')) {
      if (typeof window.cambiarCantidad === 'function') {
        window.cambiarCantidad(id, -1, variacion);
        renderCartPage();
      }
    } else if (target.classList.contains('cant-plus')) {
      if (typeof window.cambiarCantidad === 'function') {
        window.cambiarCantidad(id, 1, variacion);
        renderCartPage();
      }
    } else if (target.classList.contains('eliminar-item')) {
      if (typeof window.eliminarDelCarrito === 'function') {
        window.eliminarDelCarrito(id, variacion);
        renderCartPage();
      } else {
        // fallback sencillo
        window.carrito = (window.carrito || []).filter(it => !(String(it.id) === String(id) && (variacion == null || it.variacion === variacion)));
        if (typeof window.guardarCarrito === 'function') window.guardarCarrito();
        renderCartPage();
      }
    }
  }

  // Asegurarnos de no añadir el listener más de una vez
  listaEl.removeEventListener('click', onCartClick);
  listaEl.addEventListener('click', onCartClick);
});

function renderCartPage() {
  const listaEl = document.getElementById('lista-carrito');
  const totalEl = document.getElementById('total');
  const descuentoEl = document.getElementById('descuento-aplicado');

  if (!listaEl) return;

  const carritoLocal = JSON.parse(localStorage.getItem('carrito')) || [];
  listaEl.innerHTML = '';

  if (!carritoLocal.length) {
    listaEl.innerHTML = '<li>El carrito está vacío. <a href="index.html">Volver al catálogo</a></li>';
    if (totalEl) totalEl.textContent = 'Total: $0';
    if (descuentoEl) descuentoEl.textContent = '';
    return;
  }

  carritoLocal.forEach(item => {
    // encontrar producto para saber el stock
    const producto = (window.productos || []).find(p => String(p.id) === String(item.id));
    let maxStock = item.cantidad; // por defecto permitir la cantidad actual
    if (producto) {
      // buscar stock en variación si existe
      if (item.variacion) {
        const v = (producto.variaciones || []).find(x => String(x.id) === String(item.variacion) || String(x.nombre) === String(item.variacion));
        if (v && typeof v.stock !== 'undefined') maxStock = Number(v.stock);
        else maxStock = typeof producto.stock !== 'undefined' ? Number(producto.stock) : item.cantidad;
      } else {
        maxStock = typeof producto.stock !== 'undefined' ? Number(producto.stock) : item.cantidad;
      }
    }

    const disabledPlus = (Number(item.cantidad) >= maxStock) ? 'disabled' : '';

    const li = document.createElement('li');
    li.className = 'carrito-item';
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(item.nombre)}</strong>
        <div>Precio: $${Number(item.precio).toFixed(2)}</div>
        <div>
          <button class="cant-minus" data-id="${item.id}" data-variacion="${item.variacion || ''}">-</button>
          <span class="cantidad">${item.cantidad}</span>
          <button class="cant-plus" data-id="${item.id}" data-variacion="${item.variacion || ''}" ${disabledPlus}>+</button>
        </div>
        <div>Subtotal: $${Number(item.subtotal).toFixed(2)}</div>
        <div><button class="eliminar-item" data-id="${item.id}" data-variacion="${item.variacion || ''}">Eliminar</button></div>
      </div>
    `;
    listaEl.appendChild(li);
  });

  const total = carritoLocal.reduce((sum, it) => sum + Number(it.subtotal || 0), 0);
  if (totalEl) totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// pequeño helper
function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}