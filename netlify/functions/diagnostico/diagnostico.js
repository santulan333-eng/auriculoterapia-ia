// netlify/functions/diagnostico/diagnostico.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 Función auxiliar: analiza una sola oreja
async function analizarOreja(imagenBase64, lado) {
  const prompt = `
Eres un experto en auriculoterapia.
Analiza la imagen de la oreja (${lado}).
Da SOLO un resumen breve y claro en máximo 5 frases.
Incluye:
- puntos auriculares relevantes,
- cambios de color/forma visibles,
- posibles disfunciones principales.
Evita textos largos.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // modelo económico
    messages: [
      { role: "system", content: "Eres un asistente experto en auriculoterapia." },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: imagenBase64,
            },
          },
        ],
      },
    ],
    max_tokens: 400, // 👈 evita respuestas largas que agotan el límite
  });

  return completion.choices[0].message.content.trim();
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { orejaIzquierda, orejaDerecha } = body;

    let guia = { izquierda: "", derecha: "" };

    // ⚡ Analiza solo si hay imagen
    if (orejaIzquierda) {
      guia.izquierda = await analizarOreja(orejaIzquierda, "izquierda");
    }

    if (orejaDerecha) {
      guia.derecha = await analizarOreja(orejaDerecha, "derecha");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ guia }),
    };
  } catch (error) {
    console.error("❌ Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo generar el diagnóstico" }),
    };
  }
};
