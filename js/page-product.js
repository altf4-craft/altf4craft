document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const cont = document.getElementById('producto-detalle');
  if (!cont) return;

  if (!id) {
    cont.innerHTML = '<p>Producto no especificado.</p>';
    return;
  }

  try {
    const res = await fetch('data/productos.json');
    const productos = await res.json();

    // exponer globalmente para que carrito.js pueda usarlo
    window.productos = productos;

    const producto = productos.find(p => String(p.id) === String(id) || String(p.sku) === String(id));
    if (!producto) {
      cont.innerHTML = '<p>Producto no encontrado.</p>';
      return;
    }

    renderProducto(producto);
  } catch (err) {
    console.error('Error cargando productos:', err);
    cont.innerHTML = '<p>Error al cargar el producto.</p>';
  }
});

function renderProducto(producto) {
  const cont = document.getElementById('producto-detalle');

  // función global para cambiar imagen principal
  window.cambiarImagen = function(thumbEl, src) {
    document.querySelectorAll('.producto-thumb').forEach(el => el.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
    const main = document.getElementById('imagen-principal');
    if (main) main.src = src;
  };

  // construir HTML de variaciones como dropdown (si existen)
  let variacionesHTML = '';
  if (producto.variaciones && producto.variaciones.length > 0) {
    variacionesHTML = `
      <div class="variantes-container">
        <label class="variant-label">Seleccionar variante:</label>
        <select class="variant-select" id="variacion-select">
          ${producto.variaciones.map((v, idx) => `
            <option value="${v.id ?? v.nombre ?? idx}"
              data-nombre="${escapeHtml(v.nombre ?? '')}"
              data-precio="${Number(v.precio ?? producto.precio).toFixed(2)}"
              data-imagen="${escapeHtml(v.imagen ?? '')}"
              ${idx === 0 ? 'selected' : ''}>
              ${escapeHtml(v.nombre ?? ('Opción ' + (idx+1)))}
            </option>
          `).join('')}
        </select>
        <div class="variant-price" id="variacion-precio">$${Number(producto.variaciones[0]?.precio ?? producto.precio).toFixed(2)}</div>
      </div>
    `;
  }

  cont.innerHTML = `
    <div class="producto-page">
      <div class="producto-imagenes">
        <img src="${escapeHtml(producto.imagen || (producto.imagenes && producto.imagenes[0]) || '')}" 
             alt="${escapeHtml(producto.nombre)}" 
             class="producto-page-img" 
             id="imagen-principal" />
        ${Array.isArray(producto.imagenes) && producto.imagenes.length > 0 ? `
          <div class="producto-galeria">
            <img src="${escapeHtml(producto.imagen)}" class="producto-thumb active" onclick="cambiarImagen(this,'${escapeHtml(producto.imagen)}')" />
            ${producto.imagenes.map(img => `
              <img src="${escapeHtml(img)}" class="producto-thumb" onclick="cambiarImagen(this,'${escapeHtml(img)}')" />
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="producto-page-info">
        <h2>${escapeHtml(producto.nombre)}</h2>
        <p class="producto-precio" id="precio-general">$${Number(producto.precio || 0).toFixed(2)}</p>
        <p class="producto-descripcion" style="white-space:pre-line;">${escapeHtml(producto.descripcion || '')}</p>

        ${variacionesHTML}

        <div class="controles-compra">
          <label>
            Cantidad:
            <input id="cantidad-add" type="number" value="1" min="1" max="${Number(producto.stock || 1)}" />
          </label>
          <div style="margin-top:12px;">
            <button id="btn-agregar">Agregar al carrito</button>
            <a href="index.html" style="margin-left:12px;">Volver al catálogo</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // actualizar precio/imagen al cambiar variante
  const variantSelect = document.getElementById('variacion-select');
  const precioElem = document.getElementById('variacion-precio') || document.getElementById('precio-general');
  if (variantSelect) {
    variantSelect.addEventListener('change', (e) => {
      const opt = e.target.options[e.target.selectedIndex];
      if (opt && precioElem) precioElem.textContent = `$${Number(opt.dataset.precio || producto.precio).toFixed(2)}`;
      if (opt && opt.dataset.imagen) {
        const img = opt.dataset.imagen;
        if (img) window.cambiarImagen(document.querySelector(`img.producto-thumb[src="${img}"]`) || null, img);
      }
    });
  }

  // handler de agregar al carrito — pasar el objeto producto y la variación seleccionada (obj) si existe
  document.getElementById('btn-agregar').addEventListener('click', () => {
    const cantidad = Number(document.getElementById('cantidad-add').value) || 1;
    let variacionObj = null;
    if (variantSelect) {
      const opt = variantSelect.options[variantSelect.selectedIndex];
      const vId = opt.value;
      variacionObj = (producto.variaciones || []).find(v => String(v.id ?? v.nombre ?? '') === String(vId) || String(v.nombre) === opt.dataset.nombre) || {
        id: vId,
        nombre: opt.dataset.nombre,
        precio: Number(opt.dataset.precio || producto.precio),
        imagen: opt.dataset.imagen || ''
      };
    }

    if (typeof window.agregarAlCarrito !== 'function') {
      console.error('agregarAlCarrito no está definida. Asegurate de cargar carrito.js antes que page-product.js');
      alert('Error al agregar al carrito (función no disponible).');
      return;
    }

    // pasar el objeto producto directamente — agregarAlCarrito lo maneja
    try {
      window.agregarAlCarrito(producto, cantidad, variacionObj);
      const contador = document.getElementById('contador-carrito');
      if (contador) {
        const arr = JSON.parse(localStorage.getItem('carrito') || '[]');
        contador.textContent = arr.length;
      }
      // ahora usamos la alerta flotante
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta('Producto agregado al carrito', 'success');
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta('Error al agregar al carrito', 'error');
      }
    }
  });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}