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

// Reemplaza/usa esta función para renderizar la página de checkout/carrito
function renderCartPage() {
  const listaEl = document.getElementById('lista-carrito');
  const totalEl = document.getElementById('total');
  const descuentoEl = document.getElementById('descuento-aplicado');

  if (!listaEl) return;

  const carritoLocal = JSON.parse(localStorage.getItem('carrito')) || [];
  listaEl.innerHTML = '';

  // contenedor principal con dos columnas
  const grid = document.createElement('div');
  grid.className = 'checkout-grid';

  // columna izquierda (formulario de datos del cliente)
  const leftCol = document.createElement('div');
  leftCol.className = 'checkout-left';

  // intentar reubicar el form existente (#form-datos) dentro de la izquierda
  const existingForm = document.getElementById('form-datos');
  if (existingForm) {
    // mover el formulario al leftCol (se quita de su posición previa)
    leftCol.appendChild(existingForm);
  } else {
    // fallback: si no existe form-datos, mostrar info básica
    const fallback = document.createElement('div');
    fallback.innerHTML = '<h3>Datos del cliente</h3><p>Formulario no encontrado (ID: form-datos).</p>';
    leftCol.appendChild(fallback);
  }

  // columna derecha (resumen del carrito)
  const rightCol = document.createElement('aside');
  rightCol.className = 'checkout-right';

  // cabecera
  const header = document.createElement('div');
  header.className = 'cart-header';
  const h = document.createElement('h3');
  h.textContent = 'Tu carrito';
  header.appendChild(h);
  const count = document.createElement('div');
  count.className = 'cart-count';
  count.textContent = `(${carritoLocal.length})`;
  header.appendChild(count);
  rightCol.appendChild(header);

  // items
  const ul = document.createElement('ul');
  ul.className = 'cart-items';

  carritoLocal.forEach(item => {
    const li = document.createElement('li');

    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = item.nombre || 'Producto';
    meta.appendChild(name);
    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = `$${Number(item.precio).toFixed(2)} — Subtotal: $${Number(item.subtotal).toFixed(2)}`;
    meta.appendChild(desc);

    // controles de cantidad compactos
    const controls = document.createElement('div');
    controls.className = 'qty-controls';

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'cant-minus';
    minus.setAttribute('data-id', item.id);
    minus.setAttribute('data-variacion', item.variacion || '');
    minus.textContent = '-';

    const spanQty = document.createElement('span');
    spanQty.className = 'cantidad';
    spanQty.textContent = item.cantidad;

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'cant-plus';
    plus.setAttribute('data-id', item.id);
    plus.setAttribute('data-variacion', item.variacion || '');
    plus.textContent = '+';

    // Eliminar
    const eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.className = 'eliminar-item';
    eliminar.setAttribute('data-id', item.id);
    eliminar.setAttribute('data-variacion', item.variacion || '');
    eliminar.textContent = 'Eliminar';
    eliminar.style.marginLeft = '8px';
    eliminar.style.background = 'transparent';
    eliminar.style.border = 'none';
    eliminar.style.color = '#6b5968';
    eliminar.style.cursor = 'pointer';

    controls.appendChild(minus);
    controls.appendChild(spanQty);
    controls.appendChild(plus);
    controls.appendChild(eliminar);

    li.appendChild(meta);
    li.appendChild(controls);
    ul.appendChild(li);
  });

  rightCol.appendChild(ul);

  // total y promo
  const totalWrap = document.createElement('div');
  totalWrap.className = 'cart-total';
  const totalLabel = document.createElement('div');
  totalLabel.textContent = 'Total:';
  const totalValue = document.createElement('div');
  const totalSum = carritoLocal.reduce((s, it) => s + Number(it.subtotal || 0), 0);
  totalValue.textContent = `$${totalSum.toFixed(2)}`;
  totalWrap.appendChild(totalLabel);
  totalWrap.appendChild(totalValue);
  rightCol.appendChild(totalWrap);

  // promo code input
  const promo = document.createElement('div');
  promo.className = 'promo';
  const promoInput = document.createElement('input');
  promoInput.type = 'text';
  promoInput.placeholder = 'Código promo';
  promoInput.id = 'promo-input';
  const promoBtn = document.createElement('button');
  promoBtn.type = 'button';
  promoBtn.id = 'apply-promo';
  promoBtn.textContent = 'Aplicar';
  promoBtn.style.background = '#f276b6';
  promoBtn.style.border = 'none';
  promoBtn.style.color = '#fff';
  promoBtn.style.padding = '6px 10px';
  promoBtn.style.borderRadius = '4px';
  promo.appendChild(promoInput);
  promo.appendChild(promoBtn);
  rightCol.appendChild(promo);

  // ensamblar grid
  grid.appendChild(leftCol);
  grid.appendChild(rightCol);

  // insertar en DOM
  listaEl.appendChild(grid);

  // actualizar total element si existe fuera del contenedor
  if (totalEl) totalEl.textContent = `Total: $${totalSum.toFixed(2)}`;
  if (descuentoEl) descuentoEl.textContent = '';

}

// pequeño helper
function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}