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
      // Redirigir a página de gracias después de 1 segundo
      setTimeout(() => {
        window.location.href = "checkout.html";
      }, 1000);
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

    const cantidad = Number(cantidadManual) || 1;

    // Precio / variación
    let precio = Number(producto.precio ?? 0);
    let variacionNombre = null;
    let cantidadMinima = 1;
    
    if (variacionSeleccion) {
      if (typeof variacionSeleccion === 'object') {
        variacionNombre = variacionSeleccion.nombre ?? variacionSeleccion.id ?? String(variacionSeleccion);
        precio = Number(variacionSeleccion.precio ?? precio);
        cantidadMinima = Number(variacionSeleccion.cantidadMinima ?? 1);
      } else {
        variacionNombre = String(variacionSeleccion);
        const v = (producto.variaciones || []).find(x =>
          String(x.id) === variacionNombre || String(x.nombre) === variacionNombre
        );
        if (v) {
          precio = Number(v.precio ?? precio);
          cantidadMinima = Number(v.cantidadMinima ?? 1);
        }
      }
    }

    // Validar cantidad mínima
    if (cantidad < cantidadMinima) {
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta(`⚠️ Cantidad mínima: ${cantidadMinima} unidades. Ingresaste ${cantidad}.`, 'warning');
      } else {
        alert(`Cantidad mínima: ${cantidadMinima} unidades. Ingresaste ${cantidad}.`);
      }
      return;
    }

    const idStr = String(id ?? producto.id ?? '');

    const itemExistente = carrito.find(item => String(item.id) === idStr && item.variacion === variacionNombre);

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
    } else {
      carrito.push({
        id: idStr,
        nombre: producto.nombre,
        precio,
        cantidad,
        variacion: variacionNombre,
        subtotal: cantidad * precio,
        imagen: producto.imagen || (Array.isArray(producto.imagenes) && producto.imagenes[0]) || '',
        cantidadMinima: cantidadMinima
      });
    }

    // Sincronizar con window.carrito
    if (typeof window !== 'undefined') window.carrito = carrito;
    
    if (typeof guardarCarrito === 'function') guardarCarrito();
    if (typeof actualizarCarrito === 'function') actualizarCarrito();
    if (typeof mostrarAlerta === 'function') mostrarAlerta();
  } catch (err) {
    console.error('agregarAlCarrito error:', err);
    if (typeof mostrarAlerta === 'function') mostrarAlerta('Error al agregar al carrito', 'error');
  }
};
