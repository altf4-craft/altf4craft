async function enviarPedido(pedido) {
  try {
    const response = await fetch("/.netlify/functions/sendMail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WEBHOOK-SECRET": window.WEBHOOK_SECRET || "" // ver nota abajo
      },
      body: JSON.stringify(pedido),
    });

    const result = await response.json();

    if (response.ok) {
      // usar alerta flotante en lugar de alert()
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta("Pedido enviado correctamente. ¡Gracias por tu compra!", "success");
      }
      localStorage.removeItem("carrito");
      localStorage.removeItem("cliente");
      return true;
    } else {
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta("Error al enviar el pedido: " + (result.message || "Error desconocido"), "error");
      }
      return false;
    }
  } catch (err) {
    console.error(err);
    if (typeof mostrarAlerta === 'function') {
      mostrarAlerta("Ocurrió un error al procesar el pedido.", "error");
    }
    return false;
  }
}

window.agregarAlCarrito = function(idOrProduct, cantidadManual = 1, variacionSeleccion = null) {
  try {
    // Resolver producto (acepta id o objeto)
    let producto = null;
    let id = null;
    if (typeof idOrProduct === 'object' && idOrProduct !== null) {
      producto = idOrProduct;
      id = producto.id ?? producto.sku ?? producto.codigo;
    } else {
      id = String(idOrProduct ?? '');
      producto = (window.productos || []).find(p =>
        String(p.id) === id || String(p.sku) === id || String(p.codigo) === id
      );
    }

    if (!producto) {
      console.error('agregarAlCarrito: producto no encontrado', idOrProduct);
      if (typeof mostrarAlerta === 'function') mostrarAlerta('Producto no encontrado', 'error');
      return;
    }

    // Cantidad solicitada
    let cantidad = Math.max(0, Number(cantidadManual) || 1);

    // Determinar stock disponible (variación > producto)
    let disponible = Infinity;
    let variacionNombre = null;
    if (variacionSeleccion) {
      if (typeof variacionSeleccion === 'object') {
        variacionNombre = variacionSeleccion.nombre ?? variacionSeleccion.id ?? String(variacionSeleccion);
        if (typeof variacionSeleccion.stock !== 'undefined') {
          disponible = Number(variacionSeleccion.stock);
        }
      } else {
        // buscar variación por id/nombre en el producto
        variacionNombre = String(variacionSeleccion);
        const v = (producto.variaciones || []).find(x =>
          String(x.id) === variacionNombre || String(x.nombre) === variacionNombre
        );
        if (v && typeof v.stock !== 'undefined') disponible = Number(v.stock);
      }
    }

    // si no se obtuvo stock de la variación, tomar el del producto si existe
    if (!isFinite(disponible) && typeof producto.stock !== 'undefined') {
      disponible = Number(producto.stock);
    }

    if (!isFinite(disponible)) {
      // si no hay información de stock, asumimos ilimitado (comportamiento previo)
      disponible = Infinity;
    }

    const idStr = String(id ?? producto.id ?? '');

    const itemExistente = carrito.find(item => String(item.id) === idStr && item.variacion === variacionNombre);

    if (itemExistente) {
      const maxAñadible = Math.max(0, disponible === Infinity ? Infinity : (disponible - Number(itemExistente.cantidad)));
      if (maxAñadible <= 0) {
        if (typeof mostrarAlerta === 'function') mostrarAlerta('No hay suficiente stock para agregar más unidades', 'error');
        return;
      }
      const añadir = Math.min(cantidad, maxAñadible);
      itemExistente.cantidad += añadir;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
      if (añadir < cantidad && typeof mostrarAlerta === 'function') {
        mostrarAlerta(`Solo se añadieron ${añadir} unidades (límite de stock alcanzado)`, 'warning');
      }
    } else {
      // para nuevo item, limitar la cantidad al stock disponible
      const cantidadPermitida = disponible === Infinity ? cantidad : Math.min(cantidad, disponible);
      if (cantidadPermitida <= 0) {
        if (typeof mostrarAlerta === 'function') mostrarAlerta('Producto sin stock', 'error');
        return;
      }

      // Precio / variación (mantener lógica previa)
      let precio = Number(producto.precio ?? 0);
      if (variacionSeleccion) {
        if (typeof variacionSeleccion === 'object') {
          precio = Number(variacionSeleccion.precio ?? precio);
        } else {
          const v = (producto.variaciones || []).find(x =>
            String(x.id) === String(variacionSeleccion) || String(x.nombre) === String(variacionSeleccion)
          );
          if (v) precio = Number(v.precio ?? precio);
        }
      }

      carrito.push({
        id: idStr,
        nombre: producto.nombre,
        precio,
        cantidad: cantidadPermitida,
        variacion: variacionNombre,
        subtotal: cantidadPermitida * precio,
        imagen: producto.imagen || (Array.isArray(producto.imagenes) && producto.imagenes[0]) || ''
      });

      if (cantidadPermitida < cantidad && typeof mostrarAlerta === 'function') {
        mostrarAlerta(`Solo se añadieron ${cantidadPermitida} unidades (límite de stock)`, 'warning');
      }
    }

    if (typeof guardarCarrito === 'function') guardarCarrito();
    if (typeof actualizarCarrito === 'function') actualizarCarrito();
    if (typeof mostrarAlerta === 'function') mostrarAlerta();
  } catch (err) {
    console.error('agregarAlCarrito error:', err);
    if (typeof mostrarAlerta === 'function') mostrarAlerta('Error al agregar al carrito', 'error');
  }
};