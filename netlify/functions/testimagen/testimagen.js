export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body || "{}");
    const imagen = body.imagen;

    if (!imagen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió imagen" }),
      };
    }

    // Elimina el encabezado "data:image/jpeg;base64," o similar
    const base64Data = imagen.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    return {
      statusCode: 200,
      body: JSON.stringify({
        mensaje: "Imagen recibida correctamente ✅",
        bytes: buffer.length,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al procesar la imagen" }),
    };
  }
}
