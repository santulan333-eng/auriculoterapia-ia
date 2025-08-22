import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event) {
  try {
    const { orejaIzquierda, orejaDerecha } = JSON.parse(event.body || "{}");

    if (!orejaIzquierda && !orejaDerecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan imágenes de las orejas" })
      };
    }

    // Construir prompt
    const prompt = `
Eres un experto en auriculoterapia.
Analiza las siguientes imágenes de orejas y da una guía clara, detallada y específica de diagnóstico y posibles recomendaciones.

- Oreja izquierda: ${orejaIzquierda ? "Incluida" : "No incluida"}
- Oreja derecha: ${orejaDerecha ? "Incluida" : "No incluida"}

Responde en JSON con esta estructura:
{
  "izquierda": "análisis detallado de la oreja izquierda",
  "derecha": "análisis detallado de la oreja derecha"
}
    `;

    // Llamada al modelo
    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    // Extraer texto de la respuesta
    const raw = completion.output_text || "{}";
    let guia = {};
    try {
      guia = JSON.parse(raw);
    } catch (e) {
      guia = { izquierda: raw, derecha: raw };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ guia })
    };

  } catch (error) {
    console.error("❌ Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
