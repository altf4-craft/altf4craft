// netlify/functions/sendMail.js
import nodemailer from "nodemailer";

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    // Validar datos básicos
    if (!data.email || !data.nombre || !data.productos || !data.total) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Datos incompletos" }),
      };
    }

    // Configurar transporte (ejemplo con Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // tu correo Gmail
        pass: process.env.EMAIL_PASS, // tu contraseña o App Password
      },
    });

    // Contenido del mail
    const mensaje = `
      <h2>Nuevo pedido</h2>
      <p><strong>Cliente:</strong> ${data.nombre}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Total:</strong> $${data.total}</p>
      <h3>Productos:</h3>
      <ul>
        ${data.productos
          .map(
            (p) =>
              `<li>${p.nombre} (${p.variacion || "sin variación"}) - Cant: ${p.cantidad} - Subtotal: $${p.subtotal}</li>`
          )
          .join("")}
      </ul>
    `;

    // Enviar correo al dueño y copia al cliente
    await transporter.sendMail({
      from: `"Tienda" <${process.env.EMAIL_USER}>`,
      to: `${process.env.EMAIL_USER}, ${data.email}`,
      subject: `Nuevo pedido de ${data.nombre}`,
      html: mensaje,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Pedido enviado correctamente" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al enviar el correo" }),
    };
  }
}
