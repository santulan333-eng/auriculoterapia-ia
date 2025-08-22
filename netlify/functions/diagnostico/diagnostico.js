const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    console.log("Evento recibido:", event.body);
    const body = JSON.parse(event.body || "{}");

    if (!body.imagen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió imagen" }),
      };
    }

    // 🔹 limpiar encabezado base64 si viene como data:image/png;base64,...
    const imagenLimpia = body.imagen.replace(/^data:image\/\w+;base64,/, "");

    console.log("Llamando a OpenAI con imagen BASE64...");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // modelo con visión
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en auriculoterapia. Analiza imágenes de orejas y da un diagnóstico breve.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analiza esta oreja y dame un diagnóstico de auricul
