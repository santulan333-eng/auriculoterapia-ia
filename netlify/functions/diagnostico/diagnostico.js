const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    console.log("Evento recibido:", event.body);

    const body = JSON.parse(event.body || "{}");
    const { orejaIzquierda, orejaDerecha } = body;

    if (!orejaIzquierda && !orejaDerecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió ninguna imagen" }),
      };
    }

    // Construimos el contenido del mensaje dinámicamente
    const contenidoUsuario = [
      { type: "text", text: "Analiza las orejas proporcionadas y genera una guía reflexológica de auriculoterapia." }
    ];

    if (orejaIzquierda) {
      contenidoUsuario.push({ type: "text", text: "📷 Esta es la oreja izquierda." });
      contenidoUsuario.push({ type: "image_url", image_url: orejaIzquierda });
    }

    if (orejaDerecha) {
      contenidoUsuario.push({ type: "text", text: "📷 Esta es la oreja derecha." });
      contenidoUsuario.push({ type: "image_url", image_url: orejaDerecha });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en auriculoterapia. Observa las imágenes de orejas y genera una guía apreciativa reflexológica. " +
            "Incluye posibles áreas de desequilibrio, puntos reflexológicos sugeridos a estimular para restaurar el equilibrio, " +
            "y recomendaciones generales de autocuidado. Finaliza aclarando que no es un diagnóstico médico y que se debe " +
            "consultar con un profesional de salud.",
        },
        {
          role: "user",
          content: contenidoUsuario,
        },
      ],
    });

    console.log("Respuesta OpenAI:", JSON.stringify(completion, null, 2));

    const guia = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ guia }),
    };
  } catch (error) {
    console.error("Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener guía" }),
    };
  }
};
