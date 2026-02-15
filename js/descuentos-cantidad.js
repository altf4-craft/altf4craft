/**
 * Sistema de descuentos por cantidad de productos
 * 
 * Cada producto puede tener un array de descuentos aplicables según la cantidad comprada:
 * "descuentosPorCantidad": [
 *   { "cantidad": 5, "descuento": 10 },   // 10% si compras 5+ unidades
 *   { "cantidad": 10, "descuento": 15 },  // 15% si compras 10+
 *   { "cantidad": 20, "descuento": 20 }   // 20% si compras 20+
 * ]
 */

/**
 * Obtiene el descuento aplicable para un producto según la cantidad
 * @param {Object} producto - El objeto del producto
 * @param {number} cantidad - Cantidad de unidades compradas
 * @returns {number} Porcentaje de descuento (0 si no aplica)
 */
function obtenerDescuentoPorCantidad(producto, cantidad) {
  if (!producto || !producto.descuentosPorCantidad || !Array.isArray(producto.descuentosPorCantidad)) {
    return 0;
  }

  // Ordenar descuentos por cantidad (descendente) para obtener el mayor descuento aplicable
  const descuentosOrdenados = [...producto.descuentosPorCantidad].sort((a, b) => b.cantidad - a.cantidad);

  // Buscar el primer descuento donde la cantidad sea menor o igual a la cantidad comprada
  for (const desc of descuentosOrdenados) {
    if (cantidad >= desc.cantidad) {
      return Number(desc.descuento) || 0;
    }
  }

  return 0;
}

// Hacer accesible globalmente
window.obtenerDescuentoPorCantidad = obtenerDescuentoPorCantidad;

/**
 * Calcula el subtotal con descuento por cantidad para un item del carrito
 * @param {Object} item - Item del carrito
 * @param {Object} producto - Objeto del producto
 * @returns {Object} { precioBase, descuentoPorcentaje, descuentoMonto, subtotal }
 */
function calcularSubtotalConDescuento(item, producto) {
  const precioBase = Number(item.precio) || 0;
  const cantidad = Number(item.cantidad) || 1;
  const precioTotalBase = precioBase * cantidad;

  const descuentoPorcentaje = obtenerDescuentoPorCantidad(producto, cantidad);
  const descuentoMonto = descuentoPorcentaje > 0 
    ? (precioTotalBase * descuentoPorcentaje) / 100 
    : 0;
  const subtotal = precioTotalBase - descuentoMonto;

  return {
    precioBase,
    cantidad,
    descuentoPorcentaje,
    descuentoMonto,
    subtotal,
    precioTotalBase
  };
}

/**
 * Obtiene información completa de descuentos del carrito
 * @param {Array} carrito - Array de items del carrito
 * @param {Array} productos - Array de productos disponibles
 * @returns {Object} { totalSinDescuentos, descuentoTotalMonto, descuentoTotalPorcentaje, totalConDescuentos, detalles }
 */
function calcularDescuentosCarrito(carrito, productos) {
  let totalSinDescuentos = 0;
  let descuentoTotalMonto = 0;
  const detalles = [];

  carrito.forEach(item => {
    const producto = (productos || []).find(p => String(p.id) === String(item.id));
    
    if (producto) {
      const calc = calcularSubtotalConDescuento(item, producto);
      totalSinDescuentos += calc.precioTotalBase;
      descuentoTotalMonto += calc.descuentoMonto;

      if (calc.descuentoPorcentaje > 0) {
        detalles.push({
          id: item.id,
          nombre: item.nombre,
          cantidad: calc.cantidad,
          descuentoPorcentaje: calc.descuentoPorcentaje,
          descuentoMonto: calc.descuentoMonto
        });
      }
    } else {
      totalSinDescuentos += item.subtotal;
    }
  });

  const totalConDescuentos = totalSinDescuentos - descuentoTotalMonto;
  const descuentoTotalPorcentaje = totalSinDescuentos > 0 
    ? (descuentoTotalMonto / totalSinDescuentos) * 100 
    : 0;

  return {
    totalSinDescuentos,
    descuentoTotalMonto,
    descuentoTotalPorcentaje,
    totalConDescuentos,
    detalles
  };
}

/**
 * Actualiza el array del carrito con subtotales que incluyen descuentos por cantidad
 * Modifica el carrito en lugar para que se refleje en localStorage
 * @param {Array} carrito - Array de items del carrito
 * @param {Array} productos - Array de productos disponibles
 * @returns {Array} El carrito modificado
 */
function actualizarSubtotalesConDescuentos(carrito, productos) {
  carrito.forEach(item => {
    const producto = (productos || []).find(p => String(p.id) === String(item.id));
    if (producto) {
      const calc = calcularSubtotalConDescuento(item, producto);
      item.subtotal = calc.subtotal;
      item.descuentoBonificacionPorcentaje = calc.descuentoPorcentaje;
      item.descuentoBonificacionMonto = calc.descuentoMonto;
    }
  });
  return carrito;
}

// Hacer todas las funciones accesibles globalmente
window.calcularSubtotalConDescuento = calcularSubtotalConDescuento;
window.calcularDescuentosCarrito = calcularDescuentosCarrito;
window.actualizarSubtotalesConDescuentos = actualizarSubtotalesConDescuentos;
