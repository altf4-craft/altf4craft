// Replicate legacy show/hide + required logic from script2.js
(function () {
  function qs(sel) {
    return document.querySelector(sel);
  }

  // Añade o quita la opción "Efectivo" en el select de pago según el método de envío
  function actualizarOpcionesPago() {
    var envioSelect = qs('select[name="envio"]');
    var pagoSelect = qs('select[name="pago"]');
    if (!envioSelect || !pagoSelect) return;

    var efectivoOption = Array.from(pagoSelect.options).find(function (opt) {
      return opt.value === 'Efectivo';
    });

    if (envioSelect.value === 'Punto de retiro' || envioSelect.value === 'Evento') {
      if (!efectivoOption) {
        var option = document.createElement('option');
        option.value = 'Efectivo';
        option.textContent = 'Efectivo';
        pagoSelect.appendChild(option);
      }
    } else {
      if (efectivoOption) {
        pagoSelect.removeChild(efectivoOption);
      }
      if (pagoSelect.value === 'Efectivo') {
        pagoSelect.selectedIndex = 0;
      }
    }
  }

  // Mostrar/ocultar campo "¿Quién recibe?" según método de envío (igual que legacy)
  function toggleCampoRecibe() {
    var selectEnvio = qs('select[name="envio"]');
    if (!selectEnvio) return;
    var campoRecibe = qs('#campoQuienRecibe');
    if (!campoRecibe) return;
    var inputRecibe = campoRecibe.querySelector('input');

    var valor = selectEnvio.value;
    if (valor === 'Punto de retiro' || valor === 'Evento') {
      campoRecibe.style.display = 'block';
      if (inputRecibe) inputRecibe.required = true;
    } else {
      campoRecibe.style.display = 'none';
      if (inputRecibe) {
        inputRecibe.required = false;
        inputRecibe.value = '';
      }
    }
  }

  // Lógica para mostrar/ocultar campos de envío y controlar required (copiada del legacy)
  function toggleDatosEnvio() {
    var selectEnvio = qs('select[name="envio"]');
    var bloqueEnvio = qs('#datosEnvio');
    var selectEnvioPor = qs('#envioPor');
    var tipoEnvioBloque = qs('#tipoEnvioBloque');
    var selectTipoEnvio = qs('#tipoEnvio');
    var camposDireccionBloque = qs('#camposDireccionBloque');
    if (!selectEnvio || !bloqueEnvio) return;

    var camposObligatoriosGenerales = ['provincia', 'localidad', 'codigoPostal'];
    var camposObligatoriosADomicilio = ['calle', 'numero'];
    var camposOpcionales = ['piso', 'departamento', 'entreCalles'];
    var camposNoOcultables = ['comentarios'];

    var metodoEnvio = selectEnvio.value;
    var empresaEnvio = selectEnvioPor ? selectEnvioPor.value : '';
    var tipoEnvio = selectTipoEnvio ? selectTipoEnvio.value : '';

    var esEnvioCorreoPrincipal = metodoEnvio === 'Envío por correo';
    var empresaSeleccionada = empresaEnvio !== '';
    var requiereTipoEnvioSelect =
      empresaEnvio === 'Correo Argentino' || empresaEnvio === 'Correo Andreani';
    var esEpickODomicilio = empresaEnvio === 'E-pick' || tipoEnvio === 'A domicilio';

    var camposOcultables = [].concat(camposObligatoriosADomicilio, camposOpcionales);

    if (esEnvioCorreoPrincipal) {
      bloqueEnvio.style.display = 'flex';
      if (selectEnvioPor) selectEnvioPor.required = true;
    } else {
      bloqueEnvio.style.display = 'none';
      if (selectEnvioPor) selectEnvioPor.required = false;
      if (selectEnvioPor) selectEnvioPor.value = '';
      if (selectTipoEnvio) selectTipoEnvio.value = '';
    }

    if (esEnvioCorreoPrincipal && empresaSeleccionada && requiereTipoEnvioSelect) {
      if (tipoEnvioBloque) tipoEnvioBloque.style.display = 'block';
      if (selectTipoEnvio) selectTipoEnvio.required = true;
    } else {
      if (tipoEnvioBloque) tipoEnvioBloque.style.display = 'none';
      if (selectTipoEnvio) selectTipoEnvio.required = false;
      if (selectTipoEnvio) selectTipoEnvio.value = '';
    }

    var mostrarCamposDireccionBloque =
      empresaEnvio === 'E-pick' || (requiereTipoEnvioSelect && tipoEnvio !== '');

    if (esEnvioCorreoPrincipal && empresaSeleccionada && mostrarCamposDireccionBloque) {
      if (camposDireccionBloque) camposDireccionBloque.style.display = 'flex';

      if (esEpickODomicilio) {
        // Mostrar todos los campos y hacer obligatorios Calle/Numero + generales
        camposOcultables.forEach(function (id) {
          var campo = document.getElementById(id);
          if (campo) campo.closest('div').style.display = 'block';
        });

        camposObligatoriosGenerales.concat(camposObligatoriosADomicilio).forEach(function (id) {
          var campo = document.getElementById(id);
          if (campo) campo.required = true;
        });

        camposOpcionales.forEach(function (id) {
          var campo = document.getElementById(id);
          if (campo) campo.required = false;
        });
      } else if (tipoEnvio === 'A sucursal') {
        camposOcultables.forEach(function (id) {
          var campo = document.getElementById(id);
          if (campo) {
            campo.closest('div').style.display = 'none';
            campo.required = false;
            campo.value = '';
          }
        });

        camposObligatoriosGenerales.forEach(function (id) {
          var campo = document.getElementById(id);
          if (campo) campo.required = true;
        });
      }
    } else {
      if (camposDireccionBloque) camposDireccionBloque.style.display = 'none';

      [].concat(camposObligatoriosGenerales, camposObligatoriosADomicilio, camposOpcionales, camposNoOcultables).forEach(function (id) {
        var campo = document.getElementById(id);
        if (campo) {
          campo.required = false;
          campo.value = '';
        }
      });

      camposOcultables.forEach(function (id) {
        var campo = document.getElementById(id);
        if (campo && campo.closest('div')) campo.closest('div').style.display = 'block';
      });
    }
  }

  // Mostrar/ocultar campo DNI según factura o envio correo (igual que legacy)
  function toggleCampoDNI() {
    var selectFactura = qs('select[name="factura"]');
    var campoDNI = qs('#campoDNI');
    if (!campoDNI) return;
    var inputDNI = campoDNI.querySelector('input');
    var selectEnvio = qs('select[name="envio"]');

    var facturaSi = selectFactura && selectFactura.value === 'Sí';
    var envioCorreo = selectEnvio && selectEnvio.value === 'Envío por correo';

    if (facturaSi || envioCorreo) {
      campoDNI.style.display = 'block';
      if (inputDNI) inputDNI.required = true;
    } else {
      campoDNI.style.display = 'none';
      if (inputDNI) {
        inputDNI.required = false;
        inputDNI.value = '';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var envioSelect = qs('select[name="envio"]');
    var envioPor = qs('#envioPor');
    var tipoEnvio = qs('#tipoEnvio');
    var factura = qs('select[name="factura"]');

    // Inicializa estados
    actualizarOpcionesPago();
    toggleCampoRecibe();
    toggleDatosEnvio();
    toggleCampoDNI();

    if (envioSelect) envioSelect.addEventListener('change', function () {
      actualizarOpcionesPago();
      toggleCampoRecibe();
      toggleDatosEnvio();
      toggleCampoDNI();
    });
    if (envioPor) envioPor.addEventListener('change', toggleDatosEnvio);
    if (tipoEnvio) tipoEnvio.addEventListener('change', toggleDatosEnvio);
    if (factura) factura.addEventListener('change', toggleCampoDNI);
  });
})();
