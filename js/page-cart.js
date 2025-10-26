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
    if (target.classList.contains('cant-minus')) {
      cambiarCantidad(id, -1);
      renderCartPage();
    } else if (target.classList.contains('cant-plus')) {
      cambiarCantidad(id, 1);
      renderCartPage();
    } else if (target.classList.contains('eliminar-item')) {
      eliminarDelCarrito(id);
      renderCartPage();
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