document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    document.getElementById('producto-detalle').innerHTML = '<p>Producto no encontrado.</p>';
    return;
  }
  // Cargar productos desde data/productos.json
  try {
    const res = await fetch('data/productos.json');
    const productos = await res.json();
    const producto = productos.find(p => String(p.id) === String(id) || String(p.sku) === String(id));
    if (!producto) {
      document.getElementById('producto-detalle').innerHTML = '<p>Producto no encontrado.</p>';
      return;
    }

    renderProducto(producto);
  } catch (err) {
    console.error(err);
    document.getElementById('producto-detalle').innerHTML = '<p>Error al cargar el producto.</p>';
  }
});

function renderProducto(producto) {
  const cont = document.getElementById('producto-detalle');
  
  // Define cambiarImagen function in global scope
  window.cambiarImagen = function(thumbEl, src) {
    // Remove active class from all thumbnails
    document.querySelectorAll('.producto-thumb').forEach(el => 
      el.classList.remove('active')
    );
    // Add active class to clicked thumbnail
    thumbEl.classList.add('active');
    // Update main image
    document.getElementById('imagen-principal').src = src;
  };

  // Build variants dropdown HTML
  let variacionesHTML = '';
  if (producto.variaciones && producto.variaciones.length > 0) {
    variacionesHTML = `
      <div class="variantes-container">
        <label class="variant-label">Seleccionar variante:</label>
        <select class="variant-select" id="variacion-select">
          ${producto.variaciones.map((variacion, idx) => `
            <option value="${variacion.id}" 
              data-precio="${variacion.precio}"
              data-nombre="${variacion.nombre}"
              ${idx === 0 ? 'selected' : ''}>
              ${escapeHtml(variacion.nombre)}
            </option>
          `).join('')}
        </select>
        <span class="variant-price" id="variacion-precio">
          $${Number(producto.variaciones[0]?.precio || producto.precio).toFixed(2)}
        </span>
      </div>
    `;
  }

  // Main product HTML template
  cont.innerHTML = `
    <div class="producto-page">
      <div class="producto-imagenes">
        <img src="${producto.imagen}" 
          alt="${escapeHtml(producto.nombre)}" 
          class="producto-page-img" 
          id="imagen-principal"
        />
        ${producto.imagenes && producto.imagenes.length > 0 ? `
          <div class="producto-galeria">
            <div class="thumb-container">
              <img src="${producto.imagen}" 
                alt="Principal"
                class="producto-thumb active"
                onclick="cambiarImagen(this, '${producto.imagen}')"
              />
              ${producto.imagenes.map(img => `
                <img src="${img}" 
                  alt="${escapeHtml(producto.nombre)}"
                  class="producto-thumb"
                  onclick="cambiarImagen(this, '${img}')"
                />
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="producto-page-info">
        <h2>${escapeHtml(producto.nombre)}</h2>
        <p class="producto-descripcion">${producto.descripcion || ''}</p>
        
        ${variacionesHTML}
        
        <div class="controles-compra">
          <label>
            Cantidad: 
            <input id="cantidad-add" 
              type="number" 
              value="1" 
              min="1" 
              max="${Number(producto.stock || 1)}" 
            />
          </label>
          <div style="margin-top:12px;">
            <button id="btn-agregar">Agregar al carrito</button>
            <a href="index.html" style="margin-left:12px;">Volver al catálogo</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Update price when variant is selected
  const variantSelect = document.getElementById('variacion-select');
  const precioElement = document.getElementById('variacion-precio');
  
  if (variantSelect) {
    variantSelect.addEventListener('change', (e) => {
      const option = e.target.options[e.target.selectedIndex];
      const precio = option.dataset.precio;
      if (precio) {
        precioElement.textContent = `$${Number(precio).toFixed(2)}`;
      }
    });
  }

  document.getElementById('btn-agregar').addEventListener('click', () => {
    const cantidad = Number(document.getElementById('cantidad-add').value) || 1;
    const variantSelect = document.getElementById('variacion-select');
    
    if (variantSelect) {
      const option = variantSelect.options[variantSelect.selectedIndex];
      if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(
          producto.id,
          cantidad,
          option.dataset.nombre
        );
        alert('Producto agregado al carrito');
      }
    } else {
      if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(producto.id, cantidad);
        alert('Producto agregado al carrito');
      }
    }
  });
}

function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}