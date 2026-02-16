// checkout-pasos.js - Lógica del checkout con pasos

let pasoActual = 1;
const totalPasos = 4;

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});

function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Eventos para navegación entre pasos
  document.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextStep = parseInt(btn.getAttribute('data-next-step'));
      if (validarPaso(pasoActual)) {
        irAlPaso(nextStep);
      }
    });
  });

  document.querySelectorAll('[data-previous-step]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prevStep = parseInt(btn.getAttribute('data-previous-step'));
      irAlPaso(prevStep);
    });
  });

  // Evento de submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await procesarPedido();
  });

  // Eventos para mostrar/ocultar secciones opcionales
  const envioSelect = document.querySelector('input[name="envio"]');
  if (envioSelect) {
    document.querySelectorAll('input[name="envio"]').forEach(radio => {
      radio.addEventListener('change', actualizarSeccionesEnvio);
    });
    actualizarSeccionesEnvio();
  }

  const pagoSelect = document.querySelectorAll('input[name="pago"]');
  if (pagoSelect) {
    pagoSelect.forEach(radio => {
      radio.addEventListener('change', actualizarSeccionesPago);
    });
  }

  const tipoEnvio = document.getElementById('tipo-envio');
  if (tipoEnvio) {
    tipoEnvio.addEventListener('change', actualizarSeccionesEnvio);
  }

  // Upload de comprobante
  const uploadContainer = document.querySelector('.upload-container');
  if (uploadContainer) {
    uploadContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadContainer.style.borderColor = '#667eea';
    });
    uploadContainer.addEventListener('dragleave', () => {
      uploadContainer.style.borderColor = '#ddd';
    });
    uploadContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        document.getElementById('file-comprobante').files = e.dataTransfer.files;
        mostrarArchivoSeleccionado(file);
      }
    });
  }

  const fileInput = document.getElementById('file-comprobante');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        mostrarArchivoSeleccionado(e.target.files[0]);
      }
    });
  }

  // Cargar resumen inicial
  actualizarResumen();
}

function irAlPaso(paso) {
  if (paso < 1 || paso > totalPasos) return;

  // Ocultar paso actual
  document.querySelectorAll('.step-content').forEach(el => {
    el.classList.remove('active');
  });

  // Mostrar nuevo paso
  document.querySelector(`.step-content[data-step="${paso}"]`).classList.add('active');

  // Actualizar indicadores
  document.querySelectorAll('.step').forEach(step => {
    const stepNum = parseInt(step.getAttribute('data-step'));
    step.classList.remove('active', 'completed');

    if (stepNum < paso) {
      step.classList.add('completed');
    } else if (stepNum === paso) {
      step.classList.add('active');
    }
  });

  pasoActual = paso;

  // Actualizar resumen de cada paso
  actualizarResumen();

  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validarPaso(paso) {
  const form = document.getElementById('checkout-form');
  const campos = form.querySelectorAll(`.step-content[data-step="${paso}"] input[required], .step-content[data-step="${paso}"] select[required]`);

  let valido = true;
  campos.forEach(campo => {
    if (!campo.value.trim()) {
      campo.style.borderColor = '#ff4757';
      valido = false;
      setTimeout(() => {
        campo.style.borderColor = '#ddd';
      }, 2000);
    }
  });

  // Validaciones específicas
  if (paso === 1) {
    const envio = document.querySelector('input[name="envio"]:checked');
    if (!envio) {
      mostrarAlerta('Selecciona un método de envío', 'error');
      return false;
    }

    if (envio.value === 'Punto de retiro') {
      const puntoRetiro = document.getElementById('punto-retiro').value;
      if (!puntoRetiro) {
        mostrarAlerta('Selecciona un punto de retiro', 'error');
        return false;
      }
    }

    if (envio.value === 'Envío por correo') {
      const tipoEnvio = document.getElementById('tipo-envio').value;
      const empresa = document.getElementById('empresa-envio').value;
      if (!tipoEnvio || !empresa) {
        mostrarAlerta('Completa los datos de envío', 'error');
        return false;
      }
    }
  }

  if (paso === 2) {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const celular = document.getElementById('celular').value;

    if (!nombre || !email || !celular) {
      mostrarAlerta('Completa todos los datos requeridos', 'error');
      return false;
    }
  }

  if (paso === 3) {
    const pago = document.querySelector('input[name="pago"]:checked');
    if (!pago) {
      mostrarAlerta('Selecciona un método de pago', 'error');
      return false;
    }

    if (pago.value === 'Transferencia') {
      const comprobante = document.getElementById('file-comprobante').files[0];
      if (!comprobante) {
        mostrarAlerta('Sube el comprobante de tu transferencia', 'error');
        return false;
      }
    }
  }

  return valido;
}

function actualizarSeccionesEnvio() {
  const envio = document.querySelector('input[name="envio"]:checked');
  if (!envio) return;

  const valor = envio.value;

  // Punto de retiro
  const campoPuntoRetiro = document.getElementById('campo-punto-retiro');
  if (campoPuntoRetiro) {
    if (valor === 'Punto de retiro') {
      campoPuntoRetiro.classList.add('visible');
    } else {
      campoPuntoRetiro.classList.remove('visible');
      document.getElementById('punto-retiro').value = '';
    }
  }

  // Envío por correo
  const campoEnvioCorreo = document.getElementById('campo-envio-correo');
  if (campoEnvioCorreo) {
    if (valor === 'Envío por correo') {
      campoEnvioCorreo.classList.add('visible');
    } else {
      campoEnvioCorreo.classList.remove('visible');
      document.getElementById('tipo-envio').value = '';
      document.getElementById('empresa-envio').value = '';
      document.getElementById('campos-direccion').classList.remove('visible');
    }
  }

  // ¿Quién recibe?
  const campoRecibe = document.getElementById('campo-recibe');
  if (campoRecibe) {
    if (valor === 'Punto de retiro' || valor === 'Evento') {
      campoRecibe.classList.add('visible');
    } else {
      campoRecibe.classList.remove('visible');
      document.getElementById('quien-recibe').value = '';
    }
  }

  // DNI obligatorio para correo y factura
  const campoDNI = document.getElementById('campo-dni');
  if (campoDNI && valor === 'Envío por correo') {
    campoDNI.querySelector('input').required = true;
  }

  // Campos de dirección
  const tipoEnvio = document.getElementById('tipo-envio').value;
  const camposDireccion = document.getElementById('campos-direccion');
  if (camposDireccion && valor === 'Envío por correo' && (tipoEnvio === 'A domicilio' || tipoEnvio === 'A sucursal')) {
    camposDireccion.classList.add('visible');
  } else if (camposDireccion) {
    camposDireccion.classList.remove('visible');
  }
}

function actualizarSeccionesPago() {
  const pago = document.querySelector('input[name="pago"]:checked');
  if (!pago) return;

  const seccionTransferencia = document.getElementById('seccion-transferencia');
  const seccionMercadoPago = document.getElementById('seccion-mercado-pago');

  if (pago.value === 'Transferencia') {
    if (seccionTransferencia) seccionTransferencia.classList.add('visible');
    if (seccionMercadoPago) seccionMercadoPago.classList.remove('visible');
  } else {
    if (seccionTransferencia) seccionTransferencia.classList.remove('visible');
    if (seccionMercadoPago) seccionMercadoPago.classList.add('visible');
  }
}

function mostrarArchivoSeleccionado(file) {
  const preview = document.getElementById('archivo-preview');
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (file.size > maxSize) {
    preview.innerHTML = '<span style="color: #ff4757;">El archivo es demasiado grande. Máximo 5MB.</span>';
    document.getElementById('file-comprobante').value = '';
    return;
  }

  preview.innerHTML = `<span style="color: #27ae60;"><i class="fas fa-check"></i> ${file.name}</span>`;
}

function seleccionarPago(tipo) {
  if (tipo === 'mercado-pago') {
    document.getElementById('pago-mp').checked = true;
  } else {
    document.getElementById('pago-transf').checked = true;
  }
  actualizarSeccionesPago();
}

function actualizarResumen() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  let total = carrito.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  // Aplicar descuento por cupón si existe
  const porcentajeDescuento = window.porcentajeDescuento || 0;
  if (porcentajeDescuento > 0) {
    const descuento = (total * porcentajeDescuento) / 100;
    total -= descuento;
  }

  // Actualizar todos los resúmenes de los pasos
  for (let step = 1; step <= totalPasos; step++) {
    const resumenItems = document.getElementById(`resumen-items${step > 1 ? '-' + step : ''}`);
    const resumenTotal = document.getElementById(`resumen-total${step > 1 ? '-' + step : ''}`);

    if (resumenItems) {
      resumenItems.innerHTML = carrito.map(item => `
        <li class="orden-item">
          <span class="orden-item-nombre">${escapeHtml(item.nombre)}${item.variacion ? ` (${escapeHtml(item.variacion)})` : ''}</span>
          <span class="orden-item-precio">
            $${(item.subtotal || 0).toFixed(2)}
          </span>
        </li>
      `).join('');
    }

    if (resumenTotal) {
      resumenTotal.textContent = `$${total.toFixed(2)}`;
    }
  }

  // En el paso 4, mostrar resumen completo
  if (pasoActual === 4) {
    const resumenEntrega = document.getElementById('resumen-entrega');
    const resumenPersonales = document.getElementById('resumen-personales');
    const resumenPago = document.getElementById('resumen-pago');

    if (resumenEntrega) {
      let html = '';
      const envio = document.querySelector('input[name="envio"]:checked');
      if (envio) {
        html += `<p><strong>Método:</strong> ${escapeHtml(envio.value)}</p>`;

        if (envio.value === 'Punto de retiro') {
          const punto = document.getElementById('punto-retiro').value;
          html += `<p><strong>Punto de retiro:</strong> ${escapeHtml(punto)}</p>`;
        } else if (envio.value === 'Envío por correo') {
          const direccion = document.getElementById('calle').value;
          html += `<p><strong>Tipo de envío:</strong> ${escapeHtml(document.getElementById('tipo-envio').value)}</p>`;
          if (direccion) {
            html += `<p><strong>Dirección:</strong> ${escapeHtml(direccion)} ${escapeHtml(document.getElementById('numero').value || '')}</p>`;
          }
        } else if (envio.value === 'Evento') {
          html += `<p><strong>Cantidad de recepción:</strong> ${escapeHtml(document.getElementById('quien-recibe').value || '')}</p>`;
        }
      }
      resumenEntrega.innerHTML = html || '<p>No especificado</p>';
    }

    if (resumenPersonales) {
      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const celular = document.getElementById('celular').value;
      resumenPersonales.innerHTML = `
        <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Celular:</strong> ${escapeHtml(celular)}</p>
      `;
    }

    if (resumenPago) {
      const pago = document.querySelector('input[name="pago"]:checked');
      resumenPago.innerHTML = `<p><strong>Método:</strong> ${escapeHtml(pago ? pago.value : 'No seleccionado')}</p>`;
    }
  }
}

async function procesarPedido() {
  if (!validarPaso(4)) {
    mostrarAlerta('Completa todos los campos requeridos', 'error');
    return;
  }

  const form = document.getElementById('checkout-form');
  const formData = new FormData(form);

  // Preparar objeto del pedido
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const pedido = {
    nombre: formData.get('nombre'),
    dni: formData.get('dni'),
    email: formData.get('email'),
    telefono: formData.get('celular'),
    envio: formData.get('envio'),
    puntoRetiro: formData.get('puntoRetiro') || null,
    tipoEnvio: formData.get('tipoEnvio') || null,
    envioPor: formData.get('envioPor') || null,
    calle: formData.get('calle') || null,
    numero: formData.get('numero') || null,
    piso: formData.get('piso') || null,
    departamento: formData.get('departamento') || null,
    entreCalles: formData.get('entreCalles') || null,
    provincia: formData.get('provincia') || null,
    localidad: formData.get('localidad') || null,
    codigoPostal: formData.get('codigoPostal') || null,
    comentarios: formData.get('comentarios') || null,
    recibe: formData.get('recibe') || null,
    pago: formData.get('pago'),
    publicidad: formData.get('publicidad'),
    factura: formData.get('factura'),
    productos: carrito.map(p => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio: p.precio,
      subtotal: p.subtotal,
      variacion: p.variacion || null
    })),
    total: carrito.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  };

  // Si es transferencia, adjuntar comprobante
  if (pedido.pago === 'Transferencia') {
    const comprobante = document.getElementById('file-comprobante').files[0];
    if (comprobante) {
      // Convertir archivo a Base64 para enviar en JSON
      const reader = new FileReader();
      reader.onload = async () => {
        pedido.comprobante = {
          nombre: comprobante.name,
          tipo: comprobante.type,
          datos: reader.result
        };
        await enviarPedido(pedido);
      };
      reader.readAsDataURL(comprobante);
      return;
    }
  } else if (pedido.pago === 'Mercado Pago') {
    // Redirigir a Mercado Pago
    redirectToMercadoPago(pedido);
    return;
  }

  await enviarPedido(pedido);
}

async function enviarPedido(pedido) {
  try {
    mostrarAlerta('Procesando tu pedido...', 'info');

    const response = await fetch('/.netlify/functions/sendMail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedido)
    });

    const result = await response.json();

    if (response.ok) {
      mostrarAlerta('¡Pedido enviado correctamente!', 'success');
      localStorage.removeItem('carrito');
      localStorage.removeItem('cliente');
      setTimeout(() => {
        window.location.href = 'checkout.html';
      }, 1500);
    } else {
      mostrarAlerta('Error: ' + (result.message || 'Error desconocido'), 'error');
    }
  } catch (err) {
    console.error('Error al enviar pedido:', err);
    mostrarAlerta('Error al procesar el pedido', 'error');
  }
}

function redirectToMercadoPago(pedido) {
  // TODO: Implementar integración con Mercado Pago
  // Esto requiere un endpoint específico que genere la preferencia en Mercado Pago
  console.log('Redirigiendo a Mercado Pago...', pedido);
  mostrarAlerta('La integración con Mercado Pago se habilitará próximamente', 'info');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Función para mostrar alertas (debe estar disponible globalmente)
function mostrarAlerta(mensaje = '', tipo = 'info') {
  const alerta = document.getElementById('alerta');
  if (!alerta) return;

  alerta.textContent = mensaje;
  alerta.className = `alerta alerta-${tipo}`;
  alerta.style.display = 'block';

  if (tipo !== 'info') {
    setTimeout(() => {
      alerta.style.display = 'none';
    }, 4000);
  }
}
