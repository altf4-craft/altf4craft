# Guía de Implementación - Carrito Mejorado y Checkout con Pasos

## Archivos Nuevos Creados

### 1. **Carrito Mejorado**

#### HTML: [cart-mejorado.html](cart-mejorado.html)
- Nuevo diseño del carrito con layout en dos columnas
- Sidebar con resumen de la compra
- Mejor presentación de productos

#### CSS: [css/stylecart-mejorado.css](css/stylecart-mejorado.css)
- Estilos modernos para los productos
- Cards de artículos con hover effects
- Sección de cupones mejorada
- Responsive design

#### JavaScript: [js/page-cart-mejorado.js](js/page-cart-mejorado.js)
- Renderizado optimizado del carrito
- Mejor manejo de eventos
- Cálculo de descuentos por cantidad

**Para usar el carrito mejorado:**
- Reemplaza el link del carrito de `cart.html` a `cart-mejorado.html`
- Mantiene toda la funcionalidad existente
- Mejor UX para dispositivos móviles

---

### 2. **Checkout con Pasos**

#### HTML: [checkout-pasos.html](checkout-pasos.html)
Nuevo checkout separado en 4 pasos:

1. **Paso 1: Método de Entrega**
   - Seleccionar entre: Punto de retiro, Evento, Envío por correo
   - Dato dinámico "¿Quién recibe?" para Punto de retiro/Evento
   - Campos de dirección solo para envío por correo

2. **Paso 2: Datos del Cliente**
   - Nombre, Email, Celular
   - DNI (obligatorio si es envío por correo o factura)
   - Autorización de publicación
   - Opción de factura

3. **Paso 3: Método de Pago**
   - **Mercado Pago**: Integración segura
   - **Transferencia**: Upload de comprobante
   - Datos bancarios para referencia

4. **Paso 4: Confirmación**
   - Resumen completo de la orden
   - Revisión de todos los datos
   - Confirmación final

#### CSS: [css/checkout-pasos.css](css/checkout-pasos.css)
- Indicador de pasos visual
- Animaciones de transición entre pasos
- Estilos para métodos de envío/pago
- Upload area con drag & drop
- Responsive design

#### JavaScript: [js/checkout-pasos.js](js/checkout-pasos.js)
Funcionalidades principales:
- Navegación entre pasos con validación
- Mostrar/ocultar secciones según selecciones
- Upload de comprobante de transferencia
- Validación de formularios
- Integración con sendMail (Netlify Function)

---

## Cómo Usar

### Opción 1: Reemplazar el checkout actual
```bash
# En cart.html, cambiar link de checkout
# De: <a href="checkout.html">
# A:  <a href="checkout-pasos.html">
```

### Opción 2: Mantener ambos
Puedes tener ambos checkouts disponibles:
- `cart.html` → `checkout.html` (original)
- `cart-mejorado.html` → `checkout-pasos.html` (nuevo)

---

## Integración con Mercado Pago

Para habilitar Mercado Pago, necesitas:

1. **Crear cuenta en Mercado Pago**
   - Ve a https://www.mercadopago.com.ar

2. **Obtener tu Access Token**
   - Settings → API keys → Access Token

3. **Configurar variable de entorno en Netlify**
   - Ve a Site settings → Build & deploy → Environment
   - Agrega: `MERCADO_PAGO_TOKEN=tu_access_token`

4. **Crear endpoint en Netlify Functions**
   ```javascript
   // netlify/functions/mercadoPago.js
   const mercadopago = require('mercadopago');

   exports.handler = async (event) => {
     mercadopago.configure({
       access_token: process.env.MERCADO_PAGO_TOKEN
     });

     const preferencia = {
       items: JSON.parse(event.body).items,
       back_urls: {
         success: 'https://tudominio.com/checkout.html',
         failure: 'https://tudominio.com/checkout-pasos.html',
         pending: 'https://tudominio.com/checkout.html'
       }
     };

     try {
       const response = await mercadopago.preferences.create(preferencia);
       return {
         statusCode: 200,
         body: JSON.stringify({ url: response.body.init_point })
       };
     } catch (error) {
       return {
         statusCode: 500,
         body: JSON.stringify({ error: error.message })
       };
     }
   };
   ```

5. **Actualizar checkout-pasos.js**
   - Descomenta la función `redirectToMercadoPago()`
   - Implementa la llamada a tu endpoint

---

## Características del Nuevo Checkout

✅ **Validación en tiempo real**
- Cada paso valida antes de avanzar
- Mensajes de error claros

✅ **Secciones dinámicas**
- Los campos se muestran/ocultan según lo seleccionado
- Mejor UX sin campos innecesarios

✅ **Upload de archivos**
- Drag & drop para comprobantes
- Validación de tamaño (máximo 5MB)
- Vista previa del archivo

✅ **Resumen dinámico**
- Se actualiza en cada paso
- Muestra el total con descuentos aplicados

✅ **Responsive**
- Se adapta a móviles, tablets y desktop
- Indicadores de paso visibles en todos los tamaños

---

## Próximos Pasos

1. **Prueba del carrito mejorado**
   - Accede a `cart-mejorado.html`
   - Verifica que la navegación funcione

2. **Prueba del checkout**
   - Accede a `checkout-pasos.html` desde el carrito
   - Recorre todos los pasos
   - Prueba diferentes métodos de envío/pago

3. **Integración con Mercado Pago**
   - Sigue los pasos en la sección anterior
   - Prueba con pagos de prueba

4. **Deploy en Netlify**
   - Commit de los cambios
   - Push a tu rama principal
   - Netlify desplegad automáticamente

---

## Archivos Modificados

- `README.md` - Actualizado con el estado de las mejoras

---

## Notas Importante

- El nuevo checkout mantiene la integración con el sendMail existente
- Los datos se envían de la misma forma al backend
- La página de agradecimiento siguiente siendo `checkout.html`
- Todos los estilos usan la paleta de colores existente
- Compatible con todos los navegadores modernos

---

¡Todo listo para usar! 🚀
