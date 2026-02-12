# Mejoras Implementadas - Formulario de Pedidos

## Sistema de Visibilidad Dinámica de Campos

Se han implementado mejoras en el formulario de checkout del carrito (cart.html) para mostrar/ocultar campos dinámicamente según el método de envío seleccionado.

---

## 1. Campo "¿Quién recibe?" - Mostrar/Ocultar Dinámico

### ✅ Implementado

**Comportamiento:**
- El campo "¿Quién recibe?" se muestra SOLO cuando se selecciona:
  - "Punto de retiro" O
  - "Evento"
- Cuando se selecciona "Envío por correo", el campo se oculta y se limpia
- El campo es **obligatorio** cuando está visible

**Cambios realizados:**

1. **HTML (cart.html):**
   - Se agregó `id="campoQuienRecibe"` al contenedor del campo
   - Se agregó `style="display: none"` para ocultarlo por defecto
   - Se removió el atributo `required` del input (ahora se controla dinámicamente con JavaScript)

2. **JavaScript (js/form-helpers.js):**
   - Se optimizó la función `toggleCampoRecibe()` para:
     - Buscar el div con id `campoQuienRecibe`
     - Controlar la visibilidad basándose en el método de envío
     - Establecer/remover el atributo `required` dinámicamente
     - Limpiar el valor cuando se oculta

---

## 2. Datos de Envío - Mostrar/Ocultar Dinámico

### ✅ Implementado

**Comportamiento:**
- Los campos de envío se muestran SOLO cuando se selecciona "Envío por correo"
- El usuario puede seleccionar una empresa de envío:
  - Correo Argentino
  - Correo Andreani
  - E-pick

**Campos que aparecen según la empresa:**

| Empresa | Tipo de Envío | Campos Dirección |
|---------|---------------|-----------------|
| **Correo Argentino** | A sucursal / A domicilio | Condicional |
| **Correo Andreani** | A sucursal / A domicilio | Condicional |
| **E-pick** | N/A | Sí (siempre) |

**Campos que siempre son obligatorios cuando se selecciona "Envío por correo":**
- Provincia
- Localidad
- Código Postal

**Campos que son obligatorios solo para domicilio:**
- Calle
- Número

**Campos opcionales:**
- Piso
- Departamento
- Entre calles
- Comentarios

---

## Flujo de Validación

```
┌─────────────────────────────────┐
│ Usuario selecciona método envío │
└────────────┬────────────────────┘
             │
      ┌──────┴──────┬──────────────┬──────────────┐
      │             │              │              │
      ▼             ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Punto retiro │ │  Evento  │ │ Envío correo │
└──────┬───────┘ └────┬─────┘ └──────┬───────┘
       │              │              │
  Mostrar campo   Mostrar campo   Mostrar datos
  "¿Quién recibe?" "¿Quién recibe?" de envío
       │              │              │
  Ocultar datos   Ocultar datos    Campo obligatorio
  de envío        de envío         "¿Quién recibe?"
                                   (oculto)
```

---

## Archivos Modificados

1. **cart.html**
   - Línea ~202-208: Se actualizó el campo "¿Quién recibe?"

2. **js/form-helpers.js**
   - Función `toggleCampoRecibe()`: Optimizada para usar el nuevo ID

---

## Cómo Funciona

El archivo `js/form-helpers.js` contiene un IIFE (Immediately Invoked Function Expression) que:

1. **Al cargar la página (DOMContentLoaded):**
   - Inicializa el estado de todos los campos
   - Ejecuta las funciones de toggle correspondientes

2. **Al cambiar el método de envío:**
   - Se ejecuta `actualizarOpcionesPago()` - agregar/remover opción "Efectivo"
   - Se ejecuta `toggleCampoRecibe()` - mostrar/ocultar "¿Quién recibe?"
   - Se ejecuta `toggleDatosEnvio()` - mostrar/ocultar datos de envío
   - Se ejecuta `toggleCampoDNI()` - mostrar/ocultar DNI

3. **Al cambiar empresa o tipo de envío:**
   - Se ejecuta `toggleDatosEnvio()` nuevamente para ajustar campos obligatorios

---

## Testing

Para verificar que las mejoras funcionan correctamente:

1. Abre `cart.html` en el navegador
2. Agrega productos al carrito (si es necesario)
3. Ve al formulario de checkout
4. Prueba cada opción de método de envío:
   - Selecciona "Punto de retiro" → El campo "¿Quién recibe?" debe ser visible y obligatorio
   - Selecciona "Evento" → El campo "¿Quién recibe?" debe ser visible y obligatorio
   - Selecciona "Envío por correo" → El campo "¿Quién recibe?" se oculta, aparecen datos de envío

---

## Notas Técnicas

- La lógica utiliza `display: none` para ocultar campos, no los elimina del DOM
- El atributo `required` se controla dinámicamente con JavaScript
- Los valores se limpian cuando se ocultan los campos
- Compatible con navegadores modernos (ES6+)
- El código es modular y fácil de extender

