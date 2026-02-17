# 📦 Sistema de Cantidad Mínima para Stickers

## ✨ Cambios Realizados

Se ha implementado un sistema completo de cantidad mínima de compra para los productos de la categoría Papelería, específicamente para los stickers de diferentes tamaños.

---

## 📋 Configuración de Cantidad Mínima

### Stickers - Valores Configurados:
- **4 CM**: 35 unidades mínimo
- **5 CM**: 40 unidades mínimo  
- **6 CM**: 48 unidades mínimo
- **7 CM**: 40 unidades mínimo

---

## 🔧 Archivos Modificados

### 1. **data/productos.json**
   - ✅ Agregado campo `cantidadMinima` a cada variación del producto P007 (Stickers Personalizado)
   - Cada variación ahora incluye: `"cantidadMinima": valor`

   **Ejemplo:**
   ```json
   {
     "id": "4 CM",
     "nombre": "4 CM",
     "imagen": "img/stickers.jpeg",
     "stock": 200,
     "precio": 80,
     "cantidadMinima": 35
   }
   ```

### 2. **js/page-product.js**
   Cambios principales:
   - ✅ Agregado atributo `data-cantidad-minima` en las opciones del select
   - ✅ Crear elemento visual para mostrar el aviso de cantidad mínima
   - ✅ Función `actualizarMinimo()` que:
     - Actualiza el atributo `min` del input de cantidad
     - Muestra aviso visual diciendo "⚠️ Cantidad mínima: X unidades"
     - Ajusta automáticamente el valor del input si es menor al mínimo
   - ✅ Validación antes de agregar al carrito que verifica `cantidad >= cantidadMinima`
   - ✅ Muestra alerta personalizada si la cantidad es insuficiente

### 3. **js/carrito.js**
   Cambios principales:
   - ✅ Extrae `cantidadMinima` de la variación seleccionada
   - ✅ Valida cantidad antes de agregar al carrito
   - ✅ Muestra mensaje de error si no cumple con el mínimo: `"⚠️ Cantidad mínima: X unidades. Ingresaste Y."`
   - ✅ Almacena `cantidadMinima` en cada item del carrito para futuras validaciones

### 4. **css/style.css**
   - ✅ Agregado estilo `.cantidad-minima-aviso` con:
     - Fondo amarillo (#fff3cd)
     - Borde naranja (#ffc107)
     - Texto oscuro para mejor contraste
     - Padding y border-radius para mejor presentación

---

## 🎯 Flujo de Funcionamiento

### En la Página de Producto (product.html):

1. **Al cargar la página:**
   - Se muestra la variante por defecto (4 CM)
   - Se muestra automáticamente: "⚠️ Cantidad mínima: 35 unidades"
   - El input de cantidad tiene `min="35"`

2. **Al cambiar de variante:**
   - Se actualiza dinámicamente el mínimo según la variante seleccionada
   - Se muestra el nuevo aviso de cantidad mínima
   - El input se ajusta al nuevo mínimo si es necesario

3. **Al intentar agregar al carrito:**
   - Se valida que `cantidad >= cantidadMinima`
   - Si NO cumple: Muestra alerta ⚠️ "Cantidad mínima: X unidades. Ingresaste Y."
   - Si SÍ cumple: Agrega al carrito normalmente

### En el Carrito (carrito.js):

- Validación adicional al agregar artículos
- Se almacena `cantidadMinima` en cada item para auditoría
- Previene agregar cantidad insuficiente desde cualquier origen

---

## 💡 Características

✅ **Validación en Tiempo Real:** El input solo permite números >= cantidad mínima  
✅ **Feedback Visual:** Aviso claro y destacado del mínimo requerido  
✅ **Actualización Dinámica:** El mínimo se ajusta cuando cambias de variante  
✅ **Doble Validación:** Se valida tanto en página de producto como en el carrito  
✅ **Usuario Amigable:** Mensajes claros en lugar de rechazos silenciosos  

---

## 🔍 Cómo Ajustar los Valores

Si necesitas cambiar los mínimos en el futuro:

1. Abre `data/productos.json`
2. Busca el producto "Stickers Personalizado" (P007)
3. Encuentra la sección `variaciones`
4. Modifica el valor de `cantidadMinima` para cada variación

**Ejemplo - Cambiar mínimo de 4 CM a 50:**
```json
{
  "id": "4 CM",
  "nombre": "4 CM",
  "cantidadMinima": 50  ← Cambiar este valor
}
```

---

## 🧪 Pruebas Recomendadas

1. ✅ Abre la página de Stickers
2. ✅ Verifica que se muestre el aviso de cantidad mínima
3. ✅ Intenta ingresar una cantidad menor al mínimo en el input (debe bloquearse)
4. ✅ Cambia de variante y verifica que el mínimo se actualice
5. ✅ Intenta agregar al carrito con cantidad insuficiente (debe mostrar alerta)
6. ✅ Agrega con cantidad correcta y verifica que funcione

---

## 📝 Notas Técnicas

- Los valores mínimos se pueden aplicar a cualquier producto, no solo stickers
- El sistema es flexible y puede extenderse a otros productos de la sección Papelería
- La validación es bilateral (cliente y lógica del carrito) para máxima seguridad
- Los estilos son consistentes con el diseño existente de la tienda

