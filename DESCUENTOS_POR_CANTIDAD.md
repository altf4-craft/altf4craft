# Sistema de Descuentos por Cantidad

## Descripción General

El sistema permite aplicar descuentos automáticos a cualquier producto según la cantidad de unidades compradas. Los descuentos se configuran directamente en el archivo `data/productos.json` y se aplican automáticamente en el carrito sin necesidad de cupones.

---

## Cómo Configurar Descuentos

### Estructura en `productos.json`

Cada producto puede incluir un campo `descuentosPorCantidad` con un array de objetos:

```json
{
  "id": "P002",
  "nombre": "Charm Personalizado",
  "precio": 2500,
  "stock": 10,
  "descuentosPorCantidad": [
    { "cantidad": 5, "descuento": 10 },   // 10% si compras 5 o más
    { "cantidad": 10, "descuento": 15 },  // 15% si compras 10 o más
    { "cantidad": 20, "descuento": 20 }   // 20% si compras 20 o más
  ],
  ...resto de propiedades
}
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cantidad` | number | Cantidad mínima de unidades para aplicar el descuento |
| `descuento` | number | Porcentaje de descuento a aplicar (sin símbolo %) |

### Reglas Importantes

1. **Los descuentos se aplican automáticamente** - No requieren cupones ni acciones manuales
2. **Solo aplica el mayor descuento** - Si compras 25 unidades, se aplica el 20% (no se acumulan)
3. **El campo es opcional** - Si un producto no tiene `descuentosPorCantidad`, no se aplica descuento
4. **Se recalcula al cambiar cantidad** - Los descuentos se actualizan dinámicamente en tiempo real

---

## Ejemplos de Configuración

### Ejemplo 1: Descuentos escalonados simples

```json
"descuentosPorCantidad": [
  { "cantidad": 3, "descuento": 5 },
  { "cantidad": 5, "descuento": 10 },
  { "cantidad": 10, "descuento": 15 }
]
```

**Comportamiento:**
- 1-2 unidades: 0% descuento
- 3-4 unidades: 5% descuento
- 5-9 unidades: 10% descuento
- 10+ unidades: 15% descuento

### Ejemplo 2: Descuentos agresivos para volumen

```json
"descuentosPorCantidad": [
  { "cantidad": 10, "descuento": 20 },
  { "cantidad": 25, "descuento": 35 },
  { "cantidad": 50, "descuento": 45 }
]
```

### Ejemplo 3: Un solo nivel de descuento

```json
"descuentosPorCantidad": [
  { "cantidad": 6, "descuento": 12 }
]
```
Aplica 12% de descuento a partir de 6 unidades.

---

## Cómo Funciona en el Carrito

### Cálculo de Descuento

```
Precio Base × Cantidad = Subtotal Base
Descuento Monto = Subtotal Base × (Porcentaje / 100)
Subtotal Final = Subtotal Base - Descuento Monto
```

**Ejemplo:**
- Producto: $100
- Cantidad: 5 unidades
- Descuento: 10%

```
Subtotal Base = $100 × 5 = $500
Descuento Monto = $500 × (10 / 100) = $50
Subtotal Final = $500 - $50 = $450
```

### Visualización en el Carrito

El carrito muestra:
- precio unitario
- cantidad
- subtotal CON descuento aplicado
- badge verde con "🎉 XX% OFF (-$XX.XX)" si hay descuento

**Ejemplo:**
```
Charm Personalizado - $2500 x [−] 3 [+] = $6750 🎉 10% OFF (-$750)
```

---

## Interacción con Cupones

Los descuentos por cantidad y los cupones son **independientes**:

1. **Descuentos por Cantidad**: Se aplican automáticamente según la cantidad
2. **Cupones**: Se aplican manualmente como descuento adicional

**Ejemplo combinado:**
- Subtotal: $500 (con 10% descuento por cantidad = $450)
- Cupón: 15% de descuento
- Descuento por cupón: $450 × 15% = $67.50
- **Total Final: $382.50**

---

## Archivos Involucrados

### Nuevos archivos
- **`js/descuentos-cantidad.js`** - Funciones para calcular descuentos por cantidad

### Archivos modificados
- **`data/productos.json`** - Agregar `descuentosPorCantidad` a los productos
- **`js/script.js`** - Integración de descuentos automáticos en `actualizarCarrito()`
- **`cart.html`** - Carga del nuevo script `descuentos-cantidad.js`

---

## Funciones Disponibles

### `obtenerDescuentoPorCantidad(producto, cantidad)`

Obtiene el porcentaje de descuento para un producto según la cantidad.

```javascript
const producto = window.productos.find(p => p.id === 'P002');
const descuento = obtenerDescuentoPorCantidad(producto, 15); // Devuelve: 15
```

### `calcularSubtotalConDescuento(item, producto)`

Calcula el subtotal con descuento para un item del carrito.

```javascript
const resultado = calcularSubtotalConDescuento(item, producto);
// Devuelve: {
//   precioBase: 2500,
//   cantidad: 5,
//   descuentoPorcentaje: 10,
//   descuentoMonto: 1250,
//   subtotal: 11250,
//   precioTotalBase: 12500
// }
```

### `calcularDescuentosCarrito(carrito, productos)`

Calcula descuentos totales del carrito.

```javascript
const detalles = calcularDescuentosCarrito(carrito, window.productos);
// Devuelve: {
//   totalSinDescuentos: 15000,
//   descuentoTotalMonto: 1500,
//   descuentoTotalPorcentaje: 10,
//   totalConDescuentos: 13500,
//   detalles: [...]
// }
```

---

## Testing

Para verificar que los descuentos funcionan:

1. Abre `index.html` en el navegador
2. Agrega el "Charm Personalizado" (P002) al carrito
3. Prueba diferentes cantidades en el carrito:
   - 1-4 unidades: Sin descuento
   - 5-9 unidades: 10% de descuento
   - 10-19 unidades: 15% de descuento
   - 20+ unidades: 20% de descuento
4. Verifica que el subtotal se actualice correctamente

---

## Notas Técnicas

- Los descuentos se calculan sobre el **subtotal del producto**, no sobre el total general
- Los descuentos por cantidad se aplican **antes** que los cupones
- El sistema es **retrocompatible** - Productos sin `descuentosPorCantidad` funcionan sin cambios
- El descuento se recalcula en tiempo real al cambiar cantidades
- Compatible con variaciones de productos

---

## Casos de Uso Comunes

### E-commerce B2B
Aplicar descuentos significativos para órdenes en volumen:
```json
"descuentosPorCantidad": [
  { "cantidad": 50, "descuento": 30 },
  { "cantidad": 100, "descuento": 40 },
  { "cantidad": 500, "descuento": 50 }
]
```

### Merchandising
Incentivar compras de múltiples unidades:
```json
"descuentosPorCantidad": [
  { "cantidad": 3, "descuento": 8 },
  { "cantidad": 6, "descuento": 15 },
  { "cantidad": 12, "descuento": 25 }
]
```

### Liquidación
Descuentos progresivos para stock antiguo:
```json
"descuentosPorCantidad": [
  { "cantidad": 2, "descuento": 20 },
  { "cantidad": 1, "descuento": 50 }
]
```

