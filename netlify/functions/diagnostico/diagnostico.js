const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    console.log("📩 Evento recibido en diagnostico.js");
    console.log("Headers:", event.headers);
    console.log("Body recibido:", event.body);

    const body = JSON.parse(event.body || "{}");
    const { orejaIzquierda, orejaDerecha } = body;

    if (!orejaIzquierda && !orejaDerecha) {
      console.error("❌ No se recibieron imágenes");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió ninguna imagen" }),
      };
    }

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

    console.log("✅ Enviando a OpenAI:", JSON.stringify(contenidoUsuario, null, 2));

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en auriculoterapia. Observa las imágenes de orejas y genera una guía apreciativa reflexológica. " +
            "Incluye posibles áreas de desequilibrio, puntos reflexológicos sugeridos a estimular, " +
            "y recomendaciones generales. Finaliza aclarando que no es un diagnóstico médico.",
        },
        {
          role: "user",
          content: contenidoUsuario,
        },
      ],
    });

    console.log("✅ Respuesta OpenAI:", JSON.stringify(completion, null, 2));

    const guia = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ guia }),
    };
  } catch (error) {
    console.error("🔥 Error en diagnostico.js:", error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fallo en la función: " + error.message }),
    };
  }
};
