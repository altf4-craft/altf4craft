// page-cart-mejorado.js - Renderizado mejorado del carrito

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();

  // Delegación de eventos en los items del carrito
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cant-minus')) {
      const id = e.target.getAttribute('data-id');
      const variacion = e.target.getAttribute('data-variacion') || null;
      if (typeof window.cambiarCantidad === 'function') {
        window.cambiarCantidad(id, -1, variacion);
        renderCartPage();
      }
    } else if (e.target.classList.contains('cant-plus')) {
      const id = e.target.getAttribute('data-id');
      const variacion = e.target.getAttribute('data-variacion') || null;
      if (typeof window.cambiarCantidad === 'function') {
        window.cambiarCantidad(id, 1, variacion);
        renderCartPage();
      }
    } else if (e.target.classList.contains('carrito-item-delete') || e.target.closest('.carrito-item-delete')) {
      // Confirmación al eliminar
      const btn = e.target.closest('.carrito-item-delete');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const variacion = btn.getAttribute('data-variacion') || null;
      const nombre = btn.closest('.carrito-item')?.querySelector('.carrito-item-title')?.textContent || 'este producto';
      if (!confirm(`¿Eliminar ${nombre} del carrito?`)) return;
      if (typeof window.eliminarDelCarrito === 'function') {
        window.eliminarDelCarrito(id, variacion);
      } else {
        window.carrito = (window.carrito || []).filter(
          it => !(String(it.id) === String(id) && (variacion == null || it.variacion === variacion))
        );
        if (typeof window.guardarCarrito === 'function') window.guardarCarrito();
      }
      renderCartPage();
    }
  });
});

function renderCartPage() {
  if (window.DEBUG) console.log('renderCartPage start - window.carrito', JSON.parse(JSON.stringify(window.carrito || [])));
  // Preferir la variable global si está sincronizada, fallback a localStorage
  const carritoLocal = (Array.isArray(window.carrito) && window.carrito.length)
    ? window.carrito
    : (JSON.parse(localStorage.getItem('carrito')) || []);
  const carritoVacio = document.getElementById('carrito-vacio');
  const carritoContenido = document.getElementById('carrito-contenido');
  const listaEl = document.getElementById('lista-carrito');

  if (!listaEl) return;

  // Mostrar/ocultar secciones
  if (carritoLocal.length === 0) {
    if (carritoVacio) carritoVacio.style.display = 'block';
    if (carritoContenido) carritoContenido.style.display = 'none';
    return;
  }

  if (carritoVacio) carritoVacio.style.display = 'none';
  if (carritoContenido) carritoContenido.style.display = 'block';

  listaEl.innerHTML = '';
  let totalBase = 0;
  let totalConDescuentos = 0;
  let descuentoTotal = 0;

  carritoLocal.forEach(item => {
    const producto = (window.productos || []).find(p => String(p.id) === String(item.id));
    let maxStock = item.cantidad;
    
    if (producto) {
      if (item.variacion) {
        const v = (producto.variaciones || []).find(
          x => String(x.id) === String(item.variacion) || String(x.nombre) === String(item.variacion)
        );
        if (v && typeof v.stock !== 'undefined') maxStock = Number(v.stock);
        else maxStock = typeof producto.stock !== 'undefined' ? Number(producto.stock) : item.cantidad;
      } else {
        maxStock = typeof producto.stock !== 'undefined' ? Number(producto.stock) : item.cantidad;
      }
    }

    // Nombre de variante
    let nombreVariante = '';
    if (item.variacion && producto && producto.variaciones) {
      const variante = producto.variaciones.find(v =>
        String(v.id) === String(item.variacion) || String(v.nombre) === String(item.variacion)
      );
      if (variante) {
        nombreVariante = variante.nombre;
      }
    }

    // Calcular descuentos por cantidad
    let subtotalFinal = item.subtotal;
    let descuentoPorcentaje = 0;
    let descuentoMonto = 0;

    if (typeof window.obtenerDescuentoPorCantidad === 'function' && producto) {
      descuentoPorcentaje = window.obtenerDescuentoPorCantidad(producto, item.cantidad);
      if (descuentoPorcentaje > 0) {
        const precioTotalBase = item.precio * item.cantidad;
        descuentoMonto = (precioTotalBase * descuentoPorcentaje) / 100;
        subtotalFinal = precioTotalBase - descuentoMonto;
      }
    }

    totalBase += item.precio * item.cantidad;
    totalConDescuentos += subtotalFinal;
    descuentoTotal += descuentoMonto;

    const disabledPlus = Number(item.cantidad) >= maxStock ? 'disabled' : '';

    const li = document.createElement('li');
    li.className = 'carrito-item';
    li.innerHTML = `
      <img src="${escapeHtml(item.imagen || '')}" alt="${escapeHtml(item.nombre)}" class="carrito-item-image" onerror="this.src='img/placeholder.png'" />
      <div class="carrito-item-content">
        <div class="carrito-item-header">
          <div>
            <h4 class="carrito-item-title">${escapeHtml(item.nombre)}</h4>
            ${nombreVariante ? `<div class="carrito-item-variante">${escapeHtml(nombreVariante)}</div>` : ''}
          </div>
          <button type="button" class="carrito-item-delete" data-id="${item.id}" data-variacion="${item.variacion || ''}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="carrito-item-precio">$${Number(item.precio).toFixed(2)}</div>
        <div class="carrito-item-controls">
          <div class="cantidad-control">
            <button type="button" class="cant-minus" data-id="${item.id}" data-variacion="${item.variacion || ''}">−</button>
            <span class="cantidad">${item.cantidad}</span>
            <button type="button" class="cant-plus" data-id="${item.id}" data-variacion="${item.variacion || ''}" ${disabledPlus}>+</button>
          </div>
        </div>
        <div class="carrito-item-subtotal">Subtotal: $${subtotalFinal.toFixed(2)}</div>
        ${descuentoPorcentaje > 0 ? `<div class="carrito-item-descuento">🎉 ${descuentoPorcentaje}% OFF (-$${descuentoMonto.toFixed(2)})</div>` : ''}
      </div>
    `;
    listaEl.appendChild(li);
  });

  // Actualizar resumen
  const subtotalEl = document.getElementById('subtotal');
  const descuentoLinea = document.getElementById('descuento-linea');
  const montoDescuentoEl = document.getElementById('monto-descuento');
  const totalEl = document.getElementById('total');

  if (subtotalEl) subtotalEl.textContent = `$${totalBase.toFixed(2)}`;

  const porcentajeDescuento = window.porcentajeDescuento || 0;
  if (porcentajeDescuento > 0 && descuentoLinea && montoDescuentoEl) {
    const descuentoCupon = (totalConDescuentos * porcentajeDescuento) / 100;
    descuentoLinea.style.display = 'block';
    montoDescuentoEl.textContent = `-$${descuentoCupon.toFixed(2)}`;
  } else if (descuentoLinea) {
    descuentoLinea.style.display = 'none';
  }

  const totalFinal = totalConDescuentos - (totalConDescuentos * (porcentajeDescuento || 0)) / 100;
  if (totalEl) totalEl.textContent = `$${totalFinal.toFixed(2)}`;

  // Control del botón de proceder
  const btnProceder = document.getElementById('btn-proceder');
  if (btnProceder) {
    if (carritoLocal.length === 0) {
      btnProceder.setAttribute('disabled', 'disabled');
      btnProceder.classList.add('disabled');
    } else {
      btnProceder.removeAttribute('disabled');
      btnProceder.classList.remove('disabled');
    }
  }

  // Handler para proceder al checkout
  if (btnProceder && !btnProceder.dataset.init) {
    btnProceder.addEventListener('click', () => {
      const carritoNow = (Array.isArray(window.carrito) && window.carrito.length) ? window.carrito : (JSON.parse(localStorage.getItem('carrito')) || []);
      if (!carritoNow.length) return;
      window.location.href = 'checkout-pasos.html';
    });
    btnProceder.dataset.init = '1';
  }
  if (window.DEBUG) console.log('renderCartPage end - totals:', { subtotal: totalBase, totalFinal });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
