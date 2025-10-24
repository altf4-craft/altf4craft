async function enviarPedido(pedido) {
  try {
    const response = await fetch("/.netlify/functions/sendMail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WEBHOOK-SECRET": window.WEBHOOK_SECRET || "" // ver nota abajo
      },
      body: JSON.stringify(pedido),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Pedido enviado correctamente. ¡Gracias por tu compra!");
      localStorage.removeItem("carrito");
      localStorage.removeItem("cliente");
      return true;
    } else {
      alert("Error al enviar el pedido: " + (result.message || "Error desconocido"));
      return false;
    }
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al procesar el pedido.");
    return false;
  }
}
