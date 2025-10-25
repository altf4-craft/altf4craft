// netlify/functions/sendMail.js
import nodemailer from "nodemailer";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export async function handler(event) {
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
      .map(p => `<li>${p.nombre} - Cant: ${p.cantidad} - Subtotal: $${p.subtotal}</li>`).join("");

    const html = `
      <h2>Nuevo pedido</h2>
      <p><strong>Cliente:</strong> ${data.nombre}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.telefono}</p>
      <p><strong>Envío:</strong> ${data.envio}</p>
      <p><strong>Recibe:</strong> ${data.recibe}</p>
      <p><strong>Método de pago:</strong> ${data.pago}</p>
      <p><strong>Total:</strong> $${data.total}</p>
      <h3>Productos:</h3><ul>${productosHtml}</ul>
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
        <p>Recibimos tu pedido por $${data.total}. Te contactaremos pronto para coordinar.</p>
        <h3>Resumen</h3>
        <ul>${productosHtml}</ul>
        <p>Gracias por comprar en Alt F4 Craft.</p>
      `;
      const clienteMail = {
        from: process.env.GMAIL_USER,
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
}
