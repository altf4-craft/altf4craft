# 📋 DOCUMENTO FUNCIONAL - Alt F4 Craft

**Versión:** 2.0  
**Fecha de Actualización:** Febrero 2026  
**Estado:** Producción  

---

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Funcionalidades Principales](#funcionalidades-principales)
4. [Estructura de Datos](#estructura-de-datos)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Guía de Pruebas](#guía-de-pruebas)
7. [Casos de Uso y Resultados Esperados](#casos-de-uso-y-resultados-esperados)
8. [Problemas Conocidos y Soluciones](#problemas-conocidos-y-soluciones)
9. [Guía de Instalación y Ejecución](#guía-de-instalación-y-ejecución)

---

## 1. Descripción General

**Alt F4 Craft** es una plataforma de e-commerce especializada en productos personalizados de acrílico y papelería para emprendedores y marcas. 

### Propósito Principal
Permitir a los usuarios explorar, personalizar y comprar productos variados con opciones de descuentos por cantidad, cupones, y múltiples métodos de envío y pago.

### Públicos Objetivo
- **Emprendedores** que deseen ofrecer merch personalizado
- **Marcas** buscando merchandising corporativo
- **Clientes finales** interesados en productos de acrílico personalizados

### Productos Principales
- ✨ Charms personalizados (2-3 cm)
- 🔑 Llaveros personalizados (4-5 cm)
- 🎨 Standees personalizados (10-15 cm)
- 📝 Anotadores personalizados (9,5 x 18 cm)
- 🏷️ Stickers personalizado (múltiples tamaños)

---

## 2. Arquitectura del Proyecto

### 2.1 Estructura Técnica

```
altf4craft/
├── Frontend (HTML/CSS/JS)
│   ├── index.html                  # Página de inicio
│   ├── product.html                # Detalle de producto
│   ├── cart.html                   # Carrito (versión original)
│   ├── cart-mejorado.html          # Carrito (versión mejorada)
│   ├── checkout.html               # Checkout (versión original)
│   ├── checkout-pasos.html         # Checkout paso a paso
│   │
│   ├── css/
│   │   ├── style.css               # Estilos principales
│   │   ├── stylecart.css           # Estilos carrito original
│   │   ├── stylecart-mejorado.css  # Estilos carrito mejorado
│   │   └── checkout-pasos.css      # Estilos checkout pasos
│   │
│   └── js/
│       ├── script.js               # Lógica principal
│       ├── carrito.js              # Gestión del carrito
│       ├── cupones.js              # Validación de cupones
│       ├── descuentos-cantidad.js  # Cálculo de descuentos
│       ├── form-helpers.js         # Helpers de validación
│       ├── page-product.js         # Lógica página producto
│       ├── page-cart.js            # Lógica página carrito
│       ├── page-cart-mejorado.js   # Lógica carrito mejorado
│       └── checkout-pasos.js       # Lógica checkout pasos
│
├── Backend (Node.js + Netlify Functions)
│   ├── server.js                   # Servidor desarrollo (HTTP)
│   ├── netlify/
│   │   └── functions/
│   │       ├── sendMail.js         # Función para enviar emails
│   │       └── package.json        # Dependencias backend
│   │
│   └── netlify.toml                # Configuración Netlify
│
├── Data (JSON)
│   ├── data/productos.json         # Catálogo de productos
│   └── data/cupones.json           # Cupones disponibles
│
├── Email Templates
│   └── emails/pedido.html          # Template de email del pedido
│
├── Configuración
│   ├── _redirects                  # Redirecciones Netlify
│   └── netlify.toml                # Config Netlify (build, functions)
│
└── Documentación
    ├── README.md
    ├── GUIA_NUEVAS_MEJORAS.md
    ├── MEJORAS_IMPLEMENTADAS.md
    ├── CANTIDAD_MINIMA_STICKERS.md
    └── DESCUENTOS_POR_CANTIDAD.md
```

### 2.2 Stack Tecnológico

| Capa          | Tecnología                      | Propósito          |
|---------------|---------------------------------|--------------------|
| **Frontend**  | HTML5, CSS3, Vanilla JavaScript | UI/UX interactiva  |
| **Estado**    | LocalStorage                    | Persistencia del carrito |
| **Backend**   | Node.js (desarrollo)            | Servidor local     |
| **Funciones** | Netlify Functions (serverless)  | Envío de emails    |
| **Hosting**   | Netlify                         | Deploy y hosting   |
| **Datos**     | JSON (archivos estáticos)       | Catálogo y cupones |

---

## 3. Funcionalidades Principales

### 3.1 Catálogo de Productos

#### A. Visualización de Productos
- **Página Principal (index.html)**
  - Muestra lista de todos los productos disponibles
  - Vista en grid responsive
  - Información básica: nombre, precio, imagen
  - Botón "Ver más" o "Comprar" que lleva a detalle

#### B. Detalle del Producto
- **Página de Producto (product.html)**
  - Datos completos: descripción, imágenes, características
  - **Sistema de Variaciones**
    - Selector de tamaños/opciones
    - Actualización dinámica de precio según variación
    - Stock disponible por variación
  - **Cantidad a Comprar**
    - Campo input con validación
    - **Cantidad Mínima por Variación** (especialmente para stickers)
    - Aviso visual: "⚠️ Cantidad mínima: X unidades"
    - Ajuste automático si se ingresa cantidad menor al mínimo
  - **Descuentos por Cantidad**
    - Muestra descuentos aplicables según cantidad
    - Ejemplo: "Compra 5 o más: -25%"
  - Botón "Agregar al Carrito"

---

### 3.2 Sistema de Carrito

#### A. Almacenamiento
- **LocalStorage**: Carrito se persiste en el navegador
- **Estructura**: Array de objetos con información de items

#### B. Funcionalidades
- ✅ Agregar productos con variación y cantidad
- ✅ Aumentar/disminuir cantidad de items
- ✅ Eliminar items del carrito
- ✅ Visualizar subtotal y total
- ✅ Aplicar descuentos por cantidad automáticos
- ✅ Validar cantidad mínima requerida

#### C. Versiones Disponibles
1. **Carrito Original (cart.html)**
   - Diseño básico
   - Funcionalidad completa
   - Compatible con checkout original

2. **Carrito Mejorado (cart-mejorado.html)**
   - Diseño actualizado en dos columnas
   - Sidebar con resumen de compra
   - Better UX en dispositivos móviles
   - Compatible con checkout pasos

---

### 3.3 Sistema de Cupones

#### A. Validación de Cupones
- **Archivos**: `data/cupones.json` + `js/cupones.js`
- **Estructura**:
  ```json
  {
    "codigo": "NAVIDAD30",
    "descuento": 30,
    "inicio": "2025-12-01",
    "fin": "2025-12-31"
  }
  ```

#### B. Lógica de Validación
1. Verificar que el código exista
2. Validar que está dentro de las fechas límite
3. Aplicar descuento porcentual al total

#### C. Cupones Disponibles (Feb 2026)
- **INAUGURACION30**: 30% (01/10 - 23/10)
- **HALLOWEEN25**: 25% (10/10 - 31/10)
- **NAVIDAD30**: 30% (01/12 - 31/12)

---

### 3.4 Sistema de Descuentos por Cantidad

#### A. Funcionamiento
- **Aplicación Automática**: Sin necesidad de cupones
- **Escalonado**: Se aplica el mayor descuento aplicable
- **Dinámico**: Se recalcula al cambiar cantidad

#### B. Configuración por Producto
```json
{
  "id": "P002",
  "nombre": "Charm Personalizado",
  "descuentosPorCantidad": [
    { "cantidad": 5, "descuento": 25 },   // 25% desde 5 unidades
    { "cantidad": 10, "descuento": 35 },  // 35% desde 10 unidades
    { "cantidad": 30, "descuento": 45 }   // 45% desde 30 unidades
  ]
}
```

#### C. Ejemplo de Cálculo
- Producto: Charm (precio base $2500)
- Cantidad: 15 unidades
- Descuento aplicable: 35% (cantidad >= 10)
- Precio unitario con descuento: $2500 × 0.65 = $1625
- Subtotal: 15 × $1625 = $24,375

---

### 3.5 Sistema de Cantidad Mínima

#### A. Enfoque
Específicamente implementado para **Stickers Personalizados (P007)**

#### B. Configuración
| Tamaño | Cantidad Mínima |
|--------|-----------------|
| 4 CM   | 35 unidades     |
| 5 CM   | 40 unidades     |
| 6 CM   | 48 unidades     |
| 7 CM   | 40 unidades     |

#### C. Comportamiento
1. **En product.html**
   - Al seleccionar variación, se muestra cantidad mínima
   - Input de cantidad tiene `max` y `min` automáticos
   - Aviso visual: "⚠️ Cantidad mínima: 35 unidades"

2. **Al Agregar al Carrito**
   - Valida que cantidad >= cantidadMinima
   - Si no cumple: Muestra alerta y no agrega el item
   - Si cumple: Agrega normalmente

3. **En carrito.js**
   - Extrae `cantidadMinima` de la variación
   - Almacena en el item del carrito
   - Se puede usar para validaciones posteriores

---

### 3.6 Sistema de Checkout

#### A. Versión Original (checkout.html)
- Formulario único con todos los campos
- Agrupación básica por secciones
- Método de envío y pago en la misma pantalla

#### B. Versión Mejorada (checkout-pasos.html)
Divide el proceso en 4 pasos progresivos:

**Paso 1: Método de Entrega**
- ☑️ Punto de retiro
  - Campo condicional: "¿Quién recibe?" (visible)
  - Selector de punto: "Mukami Showroom" o "Aquelarre Showroom"
  - Sin campos de dirección
  
- ☑️ Evento
  - Campo condicional: "¿Quién recibe?" (visible)
  - Sin campos de dirección
  
- ☑️ Envío por Correo
  - Campo condicional: "¿Quién recibe?" (OCULTO)
  - Selector de empresa: Correo Argentino, Andreani, E-pick
  - Campos de dirección: provincia, localidad, código postal, calle, número, piso, depto

**Paso 2: Datos del Cliente**
- Nombre (required)
- Email (required, validación de formato)
- Celular (required)
- DNI (opcional, required si envío por correo)
- Autorización de publicación (checkbox)
- Opción de factura (checkbox)

**Paso 3: Método de Pago**
- Opción 1: Mercado Pago (integración segura)
- Opción 2: Transferencia Bancaria
  - Datos bancarios mostrados
  - Upload de comprobante (drag & drop)
  - Validación de archivo

**Paso 4: Confirmación**
- Resumen visual de toda la orden
- Listado de productos
- Total a pagar
- Datos del cliente
- Información de envío
- Botón "Confirmar Pedido"

---

### 3.7 Sistema de Envío de Emails

#### A. Backend (Netlify Functions)
- **Función**: `netlify/functions/sendMail.js`
- **Trigger**: POST a `/.netlify/functions/sendMail`
- **Payload**: Objeto pedido con todos los datos

#### B. Información Enviada
**Al cliente:**
- Resumen del pedido
- Listado de productos
- Total
- Información de envío
- Confirmación de pago

**Al administrador:**
- Datos completos del pedido
- Contacto del cliente
- Método de envío seleccionado
- Comprobante (si es transferencia)

#### C. Template
- **Archivo**: `emails/pedido.html`
- HTML responsivo para lectura en cualquier dispositivo

#### D. Condición Especial
- Después de enviar pedido: Se oculta "Tipo de envío: No especificado"
- Se muestra solo el método seleccionado

---

## 4. Estructura de Datos

### 4.1 Productos (data/productos.json)

#### Estructura Base
```json
{
  "id": "P002",
  "nombre": "Charm Personalizado",
  "categoria": "Acrilicos",
  "precio": 2500,
  "stock": 200,
  "imagen": "img/charm_personalizado.png",
  "imagenes": ["img/charms.jpeg"],
  "descripcion": "Texto descriptivo completo...",
  "descuentosPorCantidad": [
    { "cantidad": 5, "descuento": 25 },
    { "cantidad": 10, "descuento": 35 },
    { "cantidad": 30, "descuento": 45 }
  ],
  "variaciones": [
    {
      "id": "2 CM",
      "nombre": "2 CM",
      "imagen": "img/charm_personalizado.png",
      "stock": 50,
      "precio": 2500
    },
    {
      "id": "3 CM",
      "nombre": "3 CM",
      "imagen": "img/charm_personalizado.png",
      "stock": 50,
      "precio": 3400
    }
  ]
}
```

#### Campos Especiales
- **descuentosPorCantidad**: Array opcional para descuentos escalonados
- **variaciones**: Array de opciones con precio y stock individuales
- **cantidadMinima** (en variaciones): Requerimiento mínimo de compra

---

### 4.2 Cupones (data/cupones.json)

```json
[
  {
    "codigo": "NAVIDAD30",
    "descuento": 30,
    "inicio": "2025-12-01",
    "fin": "2025-12-31"
  }
]
```

**Campos:**
- `codigo`: Código que ingresa el usuario
- `descuento`: Porcentaje de descuento (0-100)
- `inicio`: Fecha inicio en formato YYYY-MM-DD
- `fin`: Fecha fin en formato YYYY-MM-DD

---

### 4.3 Carrito en LocalStorage

```json
[
  {
    "id": "P002",
    "nombre": "Charm Personalizado",
    "precio": 2500,
    "cantidad": 5,
    "variacion": "3 CM",
    "subtotal": 12500,
    "imagen": "img/charm_personalizado.png",
    "cantidadMinima": 1
  }
]
```

---

### 4.4 Datos del Cliente en LocalStorage

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "celular": "1123456789",
  "dni": "12345678",
  "metodoEnvio": "envio-correo",
  "empresa": "Correo Argentino",
  "provincia": "Buenos Aires",
  "localidad": "La Plata",
  "codigoPostal": "1900",
  "calle": "Calle Principal",
  "numero": "123",
  "piso": "4",
  "depto": "A",
  "metodosPago": "mercadopago",
  "autorizacion": true,
  "factura": false
}
```

---

## 5. Flujos de Usuario

### 5.1 Flujo: "Compra Simple en Carrito Original"

```
1. Usuario accede a index.html
   ↓
2. Visualiza lista de productos
   ↓
3. Hace clic en "Ver más" → product.html
   ↓
4. Selecciona variación (tamaño)
   ↓
5. Ingresa cantidad deseada
   ↓
6. Ve descuento por cantidad aplicable
   ↓
7. Hace clic "Agregar al Carrito"
   ↓
8. Carrito se actualiza (LocalStorage)
   ↓
9. Accede a cart.html
   ↓
10. Revisa productos, cantidades, subtotales
    ↓
11. Ingresa cupón (opcional)
    ↓
12. Hace clic "Checkout"
    ↓
13. checkout.html - Completa formulario completo
    ↓
14. Selecciona método envío y pago
    ↓
15. Confirma compra
    ↓
16. Email enviado a cliente y admin
    ↓
17. Página de confirmación (Gracias por tu compra)
```

### 5.2 Flujo: "Compra Mejorada con Pasos"

```
1. Usuario en product.html selecciona producto
   ↓
2. Añade al carrito
   ↓
3. Accede a cart-mejorado.html (carrito mejorado)
   ↓
4. Revisa en sidebar derecho el resumen
   ↓
5. Ingresa cupón o revisa descuentos
   ↓
6. Hace clic "Proceder al Pago" → checkout-pasos.html
   ↓
7. PASO 1: Selecciona método de entrega
   - Punto de retiro / Evento / Envío correo
   - Se muestran/ocultan campos dinámicamente
   - Valida y continúa
   ↓
8. PASO 2: Ingresa datos personales
   - Nombre, email, celular, DNI
   - Autorización y factura
   - Valida y continúa
   ↓
9. PASO 3: Elige método de pago
   - Mercado Pago o Transferencia
   - Si transferencia: carga comprobante
   - Valida y continúa
   ↓
10. PASO 4: Revisa confirmación
    - Resumen completo
    - Botón final "Confirmar Pedido"
    ↓
11. Email enviado
    ↓
12. Redirección a página de confirmación
```

### 5.3 Flujo: "Compra de Stickers con Cantidad Mínima"

```
1. Usuario accede a product.html
   ↓
2. Selecciona producto "Stickers Personalizado" (P007)
   ↓
3. Abre selector de variación
   ↓
4. Selecciona "4 CM"
   - Se muestra: "⚠️ Cantidad mínima: 35 unidades"
   - Input tiene min="35"
   ↓
5. Intenta agregar cantidad 20
   ↓
6. Sistema valida: 20 < 35
   - Alerta: "Cantidad mínima: 35 unidades. Ingresaste 20."
   - NO se agrega al carrito
   ↓
7. Usuario corrige a 50 unidades
   ↓
8. Agrega al carrito exitosamente
   ↓
9. En carrito.js se almacena: cantidadMinima: 35
   ↓
10. Continúa el checkout normalmente
```

---

## 6. Guía de Pruebas

### 6.1 Pruebas Unitarias (Frontend)

#### A. Pruebas de Carrito

**Test 1.1: Agregar producto al carrito**
```
Precondición: Carrito vacío
Acción: agregarAlCarrito("P002", 5, "3 CM")
Resultado Esperado:
  ✓ Carrito contiene 1 item
  ✓ Item tiene id="P002"
  ✓ Item tiene cantidad=5
  ✓ Item tiene variacion="3 CM"
  ✓ Item tiene precio correcto según variación
  ✓ LocalStorage se actualiza
```

**Test 1.2: Aumentar cantidad de item existente**
```
Precondición: Carrito contiene P002, cantidad=5, variación="3 CM"
Acción: agregarAlCarrito("P002", 3, "3 CM")
Resultado Esperado:
  ✓ Carrito contiene cantidad=8 (5+3)
  ✓ Subtotal se recalcula correctamente
  ✓ No se duplica el item, se suma a cantidad existente
```

**Test 1.3: Validar cantidad mínima en carrito**
```
Precondición: Producto P007 (Stickers 4CM) con cantidadMinima=35
Acción: agregarAlCarrito("P007", 20, "4 CM")
Resultado Esperado:
  ✓ NO se agrega el item
  ✓ Se muestra alerta: "Cantidad mínima: 35 unidades"
  ✓ Carrito no se modifica
```

**Test 1.4: Eliminar item del carrito**
```
Precondición: Carrito con 2 items
Acción: removerDelCarrito(0)
Resultado Esperado:
  ✓ Carrito contiene 1 item
  ✓ Índices se reordenan correctly
  ✓ Total se recalcula
```

#### B. Pruebas de Descuentos

**Test 2.1: Aplicar descuento por cantidad**
```
Precondición: Producto P002 con descuentosPorCantidad: [{cantidad:5, desc:25}]
Acción: Agregar 5 unidades a precio base $2500
Resultado Esperado:
  ✓ Precio unitario = $2500 × 0.75 = $1875
  ✓ Subtotal = 5 × $1875 = $9,375
  ✓ Se muestra "Descuento: 25%"
```

**Test 2.2: Descuento escalonado - aplicar mayor descuento**
```
Precondición: Producto P002 con descuentos: 25% (5+), 35% (10+), 45% (30+)
Acción: Agregar 15 unidades
Resultado Esperado:
  ✓ Se aplica descuento 35% (no 25%)
  ✓ Precio unitario = $2500 × 0.65 = $1625
  ✓ Subtotal = 15 × $1625 = $24,375
```

**Test 2.3: Cambiar cantidad - descuento se recalcula**
```
Precondición: Carrito con P002 x5 unidades, descuento 25%
Acción: Cambiar cantidad a 10
Resultado Esperado:
  ✓ Descuento cambia de 25% a 35%
  ✓ Precio unitario se actualiza
  ✓ Subtotal se recalcula
  ✓ Total se recalcula
```

#### C. Pruebas de Cupones

**Test 3.1: Aplicar cupón válido en rango de fechas**
```
Precondición: 
  - Cupón "NAVIDAD30": 30% válido del 01/12 al 31/12
  - Hoy es 25/12 (dentro del rango)
  - Total carrito: $10,000
Acción: validarCupon("NAVIDAD30")
Resultado Esperado:
  ✓ Cupón se valida correctamente
  ✓ Descuento aplicado = $3,000 (30% de $10,000)
  ✓ Total final = $7,000
  ✓ Se muestra "Cupón aplicado: -$3,000"
```

**Test 3.2: Rechazar cupón fuera de rango de fechas**
```
Precondición:
  - Cupón "NAVIDAD30" válido 01/12-31/12
  - Hoy es 15/11 (antes del rango)
Acción: validarCupon("NAVIDAD30")
Resultado Esperado:
  ✓ Cupón se rechaza
  ✓ Mensaje: "Este cupón no está disponible aún"
  ✓ Descuento NO se aplica
```

**Test 3.3: Rechazar cupón inexistente**
```
Acción: validarCupon("CODIGOFALSO")
Resultado Esperado:
  ✓ Mensaje: "Cupón inválido"
  ✓ Descuento NO se aplica
```

#### D. Pruebas de Variaciones

**Test 4.1: Cambiar variación actualiza precio**
```
Precondición: Producto P002 con variaciones:
  - "2 CM": $2500
  - "3 CM": $3400
Acción: Seleccionar variación "3 CM"
Resultado Esperado:
  ✓ Precio mostrado cambia a $3400
  ✓ El input de cantidad se reinicia
  ✓ Descuentos se recalculan para nuevo precio
```

---

### 6.2 Pruebas de Integración

#### A. Flujo Completo de Compra

**Test 5.1: Compra simple 1 producto**
```
Pasos:
1. Desde index.html → hacer clic en "Charm Personalizado"
2. En product.html: seleccionar "3 CM", cantidad 5
3. Hacer clic "Agregar al Carrito"
4. Ir a cart.html
5. Verificar item y total
6. Hacer clic "Checkout"
7. En checkout.html: completar formulario
8. Seleccionar método envío: "Envío por correo"
9. Seleccionar método pago: "Mercado Pago"
10. Confirmar compra

Validaciones:
  ✓ Item aparece en carrito
  ✓ Precio es correcto (con descuento si aplica)
  ✓ Total es correcto
  ✓ Formulario requiere campos obligatorios
  ✓ Email se envía correctamente
  ✓ Se redirige a página de confirmación
```

**Test 5.2: Compra con múltiples productos y descuentos**
```
Pasos:
1. Agregar P002 (Charm) x10 unidades (variación 3 CM)
2. Agregar P003 (Llavero) x5 unidades (variación 4 CM)
3. Ir a carrito

Validaciones:
  ✓ Charm tiene 35% descuento (cantidad 10+)
  ✓ Llavero tiene 25% descuento (cantidad 5+)
  ✓ Total es suma correcta de subtotales
  ✓ Ambos items se pueden modificar en carrito
```

**Test 5.3: Compra con cupón aplicado**
```
Pasos:
1. Agregar producto
2. En carrito, ingresar cupón "NAVIDAD30"
3. Hacer clic "Aplicar cupón"

Validaciones:
  ✓ Cupón se valida (si estamos entre 01/12-31/12)
  ✓ Descuento adicional 30% se aplica
  ✓ Total se recalcula
  ✓ Descuentos se acumulan correctamente
```

#### B. Flujo Checkout Pasos

**Test 5.4: Navegación entre pasos**
```
Procedimiento:
1. Acceder a checkout-pasos.html
2. Paso 1: Seleccionar "Punto de retiro"
   - Verificar que aparece "¿Quién recibe?"
   - Verificar que NO aparecen campos dirección
3. Hacer clic "Siguiente"
4. Paso 2: Completar datos (nombre, email, celular)
5. Hacer clic "Siguiente"
6. Paso 3: Seleccionar "Mercado Pago"
7. Hacer clic "Siguiente"
8. Paso 4: Revisar datos
9. Hacer clic "Confirmar"

Validaciones:
  ✓ Cada paso valida sus campos antes de continuar
  ✓ Los datos se mantienen al navegar entre pasos
  ✓ Los campos dinámicos aparecen/desaparecen según selecciones
```

**Test 5.5: Campos dinámicos en checkout**
```
Paso 1 - Punto de Retiro:
  - Seleccionar "Punto de retiro"
  - Validar: "¿Quién recibe?" APARECE
  - Validar: Campos dirección DESAPARECEN

Paso 1 - Envío por Correo:
  - Seleccionar "Envío por correo"
  - Validar: "¿Quién recibe?" DESAPARECE
  - Validar: Campos dirección APARECEN
  - Validar: Empresa selector aparece

Validaciones:
  ✓ Los campos se muestran/ocultan correctamente
  ✓ Los valores se limpian cuando se oculta un campo
  ✓ Validaciones se aplican según visibilidad
```

---

### 6.3 Pruebas E2E (End-to-End)

#### Test 6.1: Flujo Usuario Móvil de Charms

```
Dispositivo: iPhone 12 (390x844)

1. Acceder a index.html (responsive)
   ✓ Layout se adapta a móvil
   ✓ Productos se ven en columna única
   ✓ Botones son clickeables

2. Seleccionar "Charm Personalizado"
   ✓ product.html se carga correctamente
   ✓ Selector de tamaños es funcional
   ✓ Cantidad mínima se ve claramente

3. Agregar 5 unidades (3 CM)
   ✓ Se ve aviso de descuento 25%
   ✓ Se agrega al carrito

4. Ir al carrito
   ✓ cart-mejorado.html se ve bien
   ✓ Sidebar resumen se adapta
   ✓ Botones "Pago" son accesibles

5. Ir a checkout
   ✓ Pasos se ven como acordeón o vertical
   ✓ Selecciones se hacen fácilmente
   ✓ Campos se muestran sin scroll excesivo

6. Completar compra
   ✓ Formulario es usable en móvil
   ✓ Confirmación se ve correctamente
```

#### Test 6.2: Flujo Usuario Stickers Gran Cantidad

```
Escenario: Emprendedor quiere comprar 150 stickers

1. product.html → P007 - Stickers
   ✓ Ve opciones: 4CM, 5CM, 6CM, 7CM

2. Selecciona 4 CM
   ✓ Ve "Cantidad mínima: 35 unidades"

3. Ingresa 150 unidades
   ✓ El input acepta valores >= 35
   ✓ Se muestra descuento escalonado si aplica
   ✓ Precio total = 150 × precio_con_descuento

4. Agrega al carrito
   ✓ Se agrega sin problemas

5. En carrito ve:
   ✓ 150 stickers x variación "4 CM"
   ✓ Descuento por cantidad aplicado
   ✓ Subtotal correcto

6. Checkout:
   ✓ Completa datos
   ✓ Negocia envío por correo
   ✓ Elige método pago (transferencia)
   ✓ Sube comprobante

7. Confirmación:
   ✓ Email recibe info de los 150 stickers
   ✓ Admin recibe comprobante de pago
```

#### Test 6.3: Caso Fallo y Recuperación

```
Escenario: Usuario abandona checkout y regresa

1. En checkout-pasos.html completa Paso 1 y 2
2. Cierra navegador sin terminar
3. Regresa a cart-mejorado.html

Validaciones:
  ✓ Carrito aún tiene los productos (LocalStorage)
  ✓ Los datos de cliente aún existen (si se guardaron)
  ✓ Usuario puede continuar desde donde paró

4. Va a checkout-pasos.html nuevamente
   ✓ Los datos se recuperan del localStorage
   ✓ Puede continuar hasta paso anterior
```

---

### 6.4 Pruebas de Carga / Performance

**Test 7.1: Carga de index.html**
```
Métrica: Tiempo de carga con 100+ productos
  - DOMContentLoaded: < 1.5 segundos
  - Fully Loaded: < 3 segundos
  - Rendering: Fluido (60 FPS)
  
Validación:
  ✓ Lista se carga completa
  ✓ Imágenes cargan correctamente
  ✓ No hay bloqueos de UI
```

**Test 7.2: Agregar 50 items al carrito**
```
Acción: Agregar el mismo producto 50 veces sucesivamente

Validaciones:
  ✓ LocalStorage maneja correctamente
  ✓ Actualizaciones de UI son rápidas
  ✓ No hay memory leaks detectables
```

---

## 7. Casos de Uso y Resultados Esperados

### 7.1 Caso de Uso 1: Cliente Compra Charms para Merchandising

**Usuario**: María, emprendedora de ropa

**Objetivo**: Compra 50 charms de 3 CM para ofrecer en su tienda online

**Pasos**:
1. Accede a index.html
2. Busca "Charm Personalizado"
3. Hace clic en el producto
4. Ve que hay descuento: 45% (desde 30 unidades)
5. Selecciona variación "3 CM" (precio: $3400)
6. Ingresa cantidad: 50
7. Ve precio unitario con descuento: $1870
8. Subtotal: 50 × $1870 = $93,500
9. Agrega al carrito
10. En carrito, agrega cupón "INAUGURACION30" (30%)
11. Nuevo total: $65,450
12. Procede a checkout
13. Selecciona "Envío por correo" → Correo Argentino
14. Completa datos personales
15. Elige "Transferencia bancaria"
16. Sube comprobante
17. Confirma compra

**Resultados Esperados**:
- ✅ No hay cantidad mínima para charms
- ✅ Descuento 45% se aplica automáticamente
- ✅ Cupón se valida y se aplica
- ✅ Descuentos se acumulan correctamente
- ✅ Total final es $65,450
- ✅ Email de confirmación incluye comprobante
- ✅ María ve página "Gracias por tu compra"

---

### 7.2 Caso de Uso 2: Distribuidor Compra 200 Stickers

**Usuario**: Carlos, distribuidor mayorista

**Objetivo**: Compra 200 stickers 4CM con cantidad mínima

**Pasos**:
1. En product.html, selecciona P007 - Stickers
2. Dropdown de variación, selecciona "4 CM"
3. Ve aviso: "⚠️ Cantidad mínima: 35 unidades"
4. Intenta ingresar 20 (accidental)
5. Sistema rechaza (alerta: "Cantidad mínima 35")
6. Corrige a 200
7. Ve descuento 45% si aplica
8. Agrega al carrito
9. En carrito ve:
   - 200 x Stickers 4 CM
   - Precio base: $80 c/u
   - Con descuento: $44 c/u
   - Subtotal: $8,800

**Resultados Esperados**:
- ✅ Sistema valida cantidad mínima (35)
- ✅ Rechaza cantidad insuficiente
- ✅ Acepta 200 unidades
- ✅ Descuento se aplica correctamente
- ✅ Carrito almacena cantidadMinima para referencia
- ✅ Email incluye nota de cantidad grande

---

### 7.3 Caso de Uso 3: Cliente Completa Compra Usando Pasos

**Usuario**: Julia, cliente regular

**Objetivo**: Compra llaveros para regalo, usa nuevo checkout de pasos

**Pasos en Paso 1 (Entrega)**:
- Selecciona "Punto de retiro"
- Campo "¿Quién recibe?" aparece → ingresa "Mi hermana"
- Campos dirección desaparecen
- Hace clic "Siguiente"

**Pasos en Paso 2 (Datos)**:
- Nombre: "Julia García"
- Email: "julia@example.com"
- Celular: "1198765432"
- DNI: "35123456" (no requerido porque es retiro)
- Check "Autorización de publicación"
- No quiere factura
- Hace clic "Siguiente"

**Pasos en Paso 3 (Pago)**:
- Elige "Mercado Pago"
- Se muestra botón para ir a Mercado Pago (en producción)
- Hace clic "Siguiente"

**Pasos en Paso 4 (Confirmación)**:
- Ve resumen completo
  - 5 Llaveros 4 CM
  - Descuento 25% aplicado
  - Total: $22,500
  - Retiro en: Mukami Showroom
  - A nombre de: Mi hermana
- Hace clic "Confirmar Pedido"

**Resultados Esperados**:
- ✅ Paso 1: "¿Quién recibe?" aparece al seleccionar retiro
- ✅ Paso 1: Campos dirección desaparecen
- ✅ Paso 2: DNI no es obligatorio (porque es retiro)
- ✅ Paso 3: Método pago permite "Mercado Pago"
- ✅ Paso 4: Resumen es claro y correcto
- ✅ Email incluye: retiro, nombre hermana, total
- ✅ Sin mensaje "Tipo de envío: No especificado"

---

### 7.4 Caso de Uso 4: Cliente Corrige Datos y Regresa

**Usuario**: Pedro, usuario casual

**Objetivo**: Compra pero abandona a mitad del checkout

**Pasos**:
1. Agrega 2 Charms al carrito
2. Va a checkout-pasos.html
3. En Paso 1 selecciona "Envío por correo"
4. En Paso 2 completa datos personales
5. Hace clic "Siguiente" para ir a Paso 3
6. **Cierra la página del navegador**

**24 horas después**:
7. Regresa al sitio y accede a cart-mejorado.html
8. Ve que su carrito aún contiene los 2 Charms

**Resultados Esperados**:
- ✅ LocalStorage preserva carrito
- ✅ LocalStorage preserva datos cliente (si se guardaron)
- ✅ Pedro puede ver exactamente qué había en carrito
- ✅ Puede continuar checkout sin perder info
- ✅ Datos de cliente se recuperan (si localStorage los tiene)

---

## 8. Problemas Conocidos y Soluciones

### 8.1 Problemas Identificados y Solucionados

#### ✅ Problema 1: No se podía aumentar cantidad desde el carrito
**Estado**: SOLUCIONADO

**Descripción**: En versiones anteriores, no era posible aumentar la cantidad de un producto desde la página del carrito.

**Solución Implementada**: Agregado botón "+" y "-" en page-cart.js con validación de cantidad mínima.

**Validación**:
```javascript
// Aumentar cantidad
document.querySelectorAll('.btn-aumentar').forEach(btn => {
  btn.addEventListener('click', () => {
    const cantidad = parseInt(input.value) + 1;
    if (cantidad >= item.cantidadMinima) {
      // Actualizar y guardar
    }
  });
});
```

#### ✅ Problema 2: Mensaje "Tipo de envío: No especificado" innecesario
**Estado**: SOLUCIONADO

**Descripción**: Al seleccionar "Evento" como método de envío, el email incluía "Tipo de envío: No especificado".

**Solución Implementada**: El template de email ahora filtra el método seleccionado y solo muestra el elegido.

---

### 8.2 Limitaciones Actuales

#### Limitación 1: Validación de Mercado Pago en desarrollo
**Descripción**: En localhost, los pagos con Mercado Pago no procesan realmente.

**Recomendación**: Deploy en Netlify activa integración real de Mercado Pago.

#### Limitación 2: Sin autenticación de usuarios
**Descripción**: No hay sistema de login. Los datos se guardan en localStorage.

**Implicación**: Cada navegador tiene su carrito independiente.

**Recomendación Futura**: Implementar autenticación si se requiere cuentas de usuario.

---

### 8.3 Recomendaciones y Mejoras Futuras

#### Mejora 1: Sistema de Stock Dinámico
**Prioridad**: Media

**Descripción**: Actualmente el stock está hardcodeado en productos.json.

**Solución Propuesta**:
- Base de datos (MongoDB, Firebase)
- API endpoint para actualizar stock
- Validación en tiempo real al agregar al carrito

#### Mejora 2: Historial de Pedidos del Cliente
**Prioridad**: Media

**Descripción**: Los clientes no pueden ver sus pedidos anteriores.

**Solución Propuesta**:
- Sistema de cuentas con email/contraseña
- Tabla "orders" con historial
- Página "Mi perfil" con pedidos pasados

#### Mejora 3: Búsqueda y Filtros Avanzados
**Prioridad**: Baja

**Descripción**: Index.html no tiene búsqueda ni filtros por categoría.

**Solución Propuesta**:
- Barra de búsqueda en navbar
- Filtros por: Categoría, rango de precio, ordenamiento
- Página de resultados dinámicos

#### Mejora 4: Integración Mercado Pago Completa
**Prioridad**: Alta

**Descripción**: Está parcialmente integrada.

**Solución Propuesta**:
- Configurar public key de Mercado Pago en Netlify
- Implementar checkout embebido
- Webhook para confirmación de pago

#### Mejora 5: Panel de Administración
**Prioridad**: Alta

**Descripción**: Sin panel para gestionar productos, cupones, pedidos.

**Solución Propuesta**:
- Página admin (protegida por contraseña)
- Gestión CRUD de productos
- Ver pedidos recibidos
- Generar reportes de ventas

---

## 9. Guía de Instalación y Ejecución

### 9.1 Requisitos Previos

**Software Necesario**:
- Node.js v14+ (para servidor desarrollo)
- Git
- Editor de código (VS Code recomendado)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

**Cuentas Requeridas (Producción)**:
- Cuenta de Netlify (para deploy)
- Cuenta de Mercado Pago (para pagos)
- Proveedor de email (para envío de mails)

### 9.2 Instalación Local

**Paso 1: Clonar el repositorio**
```bash
git clone <URL_REPOSITORIO>
cd altf4craft
```

**Paso 2: Instalar dependencias**
```bash
npm install
```

**Paso 3: Ejecutar servidor desarrollo**
```bash
node server.js
```

**Resultado esperado**:
```
🚀 Servidor ejecutándose en http://localhost:3000
📁 Sirviendo archivos desde: C:\Users\...\altf4craft
⚠️  En modo DESARROLLO: Los pedidos se mostrarán en la consola
```

**Paso 4: Acceder al sitio**
- Abrir navegador en: `http://localhost:3000`
- Página de inicio carga en `http://localhost:3000/index.html`

### 9.3 Estructura de Archivos Post-Instalación

```
altf4craft/
├── node_modules/          # Dependencias (npm install)
├── .git/                  # Repositorio Git
├── /datos/
│   ├── productos.json     # Catálogo editable
│   └── cupones.json       # Cupones editables
├── index.html             # Página de inicio
└── server.js              # Servidor local
```

### 9.4 Desarrollo y Testing

**Para ejecutar pruebas unitarias** (manual en navegador):
1. Abrir `http://localhost:3000/index.html`
2. Abrir Developer Tools (F12)
3. En consola, ejecutar:

```javascript
// Test: Agregar producto
agregarAlCarrito("P002", 5, "3 CM");
console.log(carrito);
// Debe mostrar array con 1 item

// Test: Validar cantidad mínima
agregarAlCarrito("P007", 20, "4 CM");
// Debe mostrar alerta "Cantidad mínima: 35 unidades"
```

### 9.5 Deployment en Netlify

**Paso 1: Crear cuenta y conectar repositorio**
- Ir a https://www.netlify.com
- Hacer clic "New site from Git"
- Conectar repositorio GitHub

**Paso 2: Configuración Netlify**
```toml
# En netlify.toml
[build]
  publish = "."
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
```

**Paso 3: Variables de entorno**
```
En Netlify Dashboard → Site settings → Build & deploy → Environment

MERCADO_PAGO_PUBLIC_KEY = <tu_public_key>
MERCADO_PAGO_ACCESS_TOKEN = <tu_access_token>
SENDGRID_API_KEY = <tu_api_key> (si usas SendGrid)
ADMIN_EMAIL = admin@altf4craft.com
```

**Paso 4: Deploy**
```bash
git push origin main
# Netlify detecta cambios y deploya automáticamente
```

**Resultado**: Sitio disponible en `https://altf4craft.netlify.app`

---

## 10. Configuración de Mercado Pago

### 10.1 Obtener Credenciales

**Para cuentas de Mercado Pago (Argentina)**:

1. Ir a https://www.mercadopago.com.ar
2. Iniciar sesión o crear cuenta
3. Dashboard → Configuración → Credenciales
4. Copiar:
   - **Public Key**: `APP_USR-...`
   - **Access Token**: `APP_USR-...`

### 10.2 Setup en Proyecto

**En netlify/functions/sendMail.js** (pseudo-código):
```javascript
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY;
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

// Crear preference de Mercado Pago
const preference = {
  items: pedido.productos.map(p => ({
    title: p.nombre,
    quantity: p.cantidad,
    unit_price: p.precio
  })),
  back_urls: {
    success: "https://altf4craft.netlify.app/checkout.html",
    failure: "https://altf4craft.netlify.app/cart.html",
    pending: "https://altf4craft.netlify.app/cart.html"
  }
};

// Usar SDK de Mercado Pago para crear preference
// Y retornar URL de pago
```

---

## 11. Checklist de Funcionalidades

### 11.1 Frontend

- [x] Página de inicio con lista de productos
- [x] Página de detalle de producto con variaciones
- [x] Sistema de carrito con LocalStorage
- [x] Carrito mejorado (versión 2)
- [x] Sistema de descuentos por cantidad (automático)
- [x] Sistema de cantidad mínima (Stickers)
- [x] Validación de couponescódigos
- [x] Checkout original
- [x] Checkout con pasos (4 pasos)
- [x] Campos dinámicos según método envío
- [x] Responsive design (móvil, tablet, desktop)

### 11.2 Backend

- [x] Servidor Node.js desarrollo
- [x] Netlify Functions configuradas
- [x] Envío de emails con template
- [x] CORS habilitado
- [x] Manejo de POST requests

### 11.3 Datos

- [x] productos.json con estructura completa
- [x] cupones.json con cupones válidos
- [x] Campos de variaciones con precios
- [x] Campos de cantidad mínima
- [x] Descuentos por cantidad configurables

### 11.4 Documentación

- [x] README.md
- [x] GUIA_NUEVAS_MEJORAS.md
- [x] MEJORAS_IMPLEMENTADAS.md
- [x] CANTIDAD_MINIMA_STICKERS.md
- [x] DESCUENTOS_POR_CANTIDAD.md
- [x] DOCUMENTO_FUNCIONAL_COMPLETO.md (este archivo)

---

## 12. Resumen Ejecutivo

**Alt F4 Craft** es una plataforma e-commerce funcional y completa para la venta de productos personalizados. 

**Puntos Fuertes**:
✅ Sistema de descuentos flexible y automático  
✅ Checkout multi-paso intuitivo  
✅ Manejo correcto de cantidad mínima  
✅ Validación de cupones con fechas  
✅ Design responsivo  
✅ Bien documentada  

**Áreas de Mejora**:
🔄 Integración Mercado Pago (parcial) - requiere setup en Netlify  
🔄 Sin panel de administración (requiere desarrollo)  
🔄 Sin base de datos dinámica (JSON estático)  
🔄 Sin historial de órdenes de usuarios  

**Para Producción**:
1. Deploy en Netlify (push a main branch)
2. Configurar variables de entorno (Mercado Pago, emails)
3. Validar emails llegan correctamente
4. Testing E2E con transacciones reales
5. Setup de análitica (Google Analytics)

---

**Documento Preparado Por**: Sistema de Documentación Técnica  
**Última Actualización**: Febrero 2026  
**Versión**: 2.0
