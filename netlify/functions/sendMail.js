// netlify/functions/sendMail.js
const nodemailer = require("nodemailer");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async function(event) {
  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Allowed" }),
    };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Validar variables de entorno
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.ADMIN_EMAIL) {
      throw new Error("Faltan configuraciones de email (GMAIL_USER / GMAIL_APP_PASSWORD / ADMIN_EMAIL)");
    }

    // Configuración de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    const productosHtml = (data.productos || [])
      .map(p => {
        const variante = p.variacion ? ` (${p.variacion})` : '';
        return `<li>${p.nombre}${variante} - Cant: ${p.cantidad} - Subtotal: $${p.subtotal}</li>`;
      }).join("");

    // Construir sección de envío según tipo
    let datosEnvioSeccion = '';
    if (data.envio === 'Punto de retiro') {
      datosEnvioSeccion = `<p><strong>Punto de retiro:</strong> ${data.puntoRetiro || 'No especificado'}</p>`;
    } else if (data.envio === 'Evento') {
      datosEnvioSeccion = `<p><strong>Tipo de envío:</strong> ${data.tipoEnvio || 'No especificado'}</p>`;
    } else if (data.envio === 'Envío por correo') {
      datosEnvioSeccion = `
        <p><strong>Tipo de envío:</strong> ${data.tipoEnvio || 'No especificado'}</p>
        <p><strong>Envío por:</strong> ${data.envioPor || 'No especificado'}</p>
        ${data.calle ? `<p><strong>Dirección:</strong> ${data.calle} ${data.numero || ''}${data.piso ? ` Piso ${data.piso}` : ''}${data.departamento ? ` Depto ${data.departamento}` : ''}</p>` : ''}
        ${data.entreCalles ? `<p><strong>Entre calles:</strong> ${data.entreCalles}</p>` : ''}
        ${data.provincia ? `<p><strong>Provincia:</strong> ${data.provincia}</p>` : ''}
        ${data.localidad ? `<p><strong>Localidad:</strong> ${data.localidad}</p>` : ''}
        ${data.codigoPostal ? `<p><strong>Código Postal:</strong> ${data.codigoPostal}</p>` : ''}
        ${data.comentarios ? `<p><strong>Comentarios:</strong> ${data.comentarios}</p>` : ''}
      `;
    }

    const html = `
      <h2>Nuevo pedido</h2>
      <h3>Datos del cliente</h3>
      <p><strong>Nombre:</strong> ${data.nombre}</p>
      ${data.dni ? `<p><strong>DNI:</strong> ${data.dni}</p>` : ''}
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.telefono}</p>
      
      <h3>Envío</h3>
      <p><strong>Método:</strong> ${data.envio}</p>
      ${datosEnvioSeccion}
      ${data.recibe ? `<p><strong>¿Quién recibe?:</strong> ${data.recibe}</p>` : ''}
      
      <h3>Pago y preferencias</h3>
      <p><strong>Método de pago:</strong> ${data.pago}</p>
      <p><strong>Autoriza publicación:</strong> ${data.publicidad}</p>
      <p><strong>Factura C:</strong> ${data.factura}</p>
      
      <h3>Productos (${data.productos.length})</h3>
      <ul>${productosHtml}</ul>
      
      <h3>Total: $${data.total}</h3>
    `;

    // Mail al admin (con replyTo al cliente)
    const adminMail = {
      from: `"AltF4 Craft - Papelería y acrílicos" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Nuevo pedido de ${data.nombre}`,
      html,
      replyTo: data.email || undefined
    };

    await transporter.sendMail(adminMail);

    // Enviar confirmación al cliente sólo si el email del formulario no es el mismo que el GMAIL_USER
    if (data.email && data.email !== process.env.GMAIL_USER) {
      const clienteHtml = `
        <h2>Confirmación de pedido</h2>
        <p>Hola ${data.nombre},</p>
        <p>¡Gracias por tu compra! Recibimos tu pedido por <strong>$${data.total}</strong>. Te contactaremos pronto para confirmar y coordinar la entrega.</p>
        
        <h3>Resumen de tu pedido</h3>
        <ul>${productosHtml}</ul>
        
        <h3>Datos de entrega</h3>
        <p><strong>Método:</strong> ${data.envio}</p>
        ${datosEnvioSeccion}
        ${data.recibe ? `<p><strong>¿Quién recibe?:</strong> ${data.recibe}</p>` : ''}
        
        <h3>Detalles de pago</h3>
        <p><strong>Método de pago:</strong> ${data.pago}</p>
        <p><strong>Autoriza publicación:</strong> ${data.publicidad}</p>
        <p><strong>Factura C:</strong> ${data.factura}</p>
        
        <hr>
        <p>Si tienes preguntas, contáctanos a <strong>${process.env.ADMIN_EMAIL || 'contacto'}</strong></p>
        <p>¡Gracias por confiar en Alt F4 Craft!</p>
      `;
      const clienteMail = {
        from: `"AltF4 Craft - Papelería y acrílicos" <${process.env.GMAIL_USER}>`,
        to: data.email,
        subject: `Confirmación de pedido - Alt F4 Craft`,
        html: clienteHtml
      };
      await transporter.sendMail(clienteMail);
    } else {
      // Si el email del cliente coincide con la cuenta remitente, evitamos enviar la confirmación duplicada
      console.log("No se envió confirmación al cliente porque coincide con GMAIL_USER");
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Pedido enviado correctamente" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Error al enviar el correo: " + error.message }),
    };
  }
};
