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
      throw new Error("Faltan configuraciones de email");
    }

    // Configuración de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Contenido del mail con escape HTML básico
    const mensaje = `
      <h2>Nuevo pedido</h2>
      <p><strong>Cliente:</strong> ${data.nombre}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.telefono}</p>
      <p><strong>Envío:</strong> ${data.envio}</p>
      <p><strong>Recibe:</strong> ${data.recibe}</p>
      <p><strong>Método de pago:</strong> ${data.pago}</p>
      <p><strong>Total:</strong> $${data.total}</p>
      <h3>Productos:</h3>
      <ul>
        ${data.productos
          .map(
            (p) =>
              `<li>${p.nombre} - Cant: ${p.cantidad} - Subtotal: $${p.subtotal}</li>`
          )
          .join("")}
      </ul>
    `;

    // Enviar email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Nuevo pedido de ${data.nombre}`,
      html: mensaje,
    });

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
