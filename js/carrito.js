async function enviarPedido(pedido) {
  try {
    const response = await fetch("/.netlify/functions/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Pedido enviado correctamente. ¡Gracias por tu compra!");
      localStorage.removeItem("carrito");
      localStorage.removeItem("cliente");
    } else {
      alert("Error al enviar el pedido: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al procesar el pedido.");
  }
}
