import OpenAI from "openai";

// Cliente OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { orejaIzquierda, orejaDerecha } = body;

    if (!orejaIzquierda || !orejaDerecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan imágenes de las orejas" }),
      };
    }

    // 🔹 Prompt más detallado
    const prompt = `
Analiza cuidadosamente las imágenes de la oreja izquierda y derecha según la Medicina Tradicional China (MTC).
Instrucciones:
1. Describe cada punto auricular visible.
2. Analiza textura, color, marcas y cambios de tono.
3. Diferencia entre disfunciones pasadas (cicatrices, hundimientos, manchas antiguas) y actuales (inflamaciones, rojeces, cambios recientes).
4. Indica qué órganos o sistemas se ven más afectados y por qué.
5. Da recomendaciones de estilo de vida y cuidados relacionados.

Formato esperado:
{
  "Oreja Izquierda": { "observaciones": "...", "disfunciones_pasadas": "...", "disfunciones_actuales": "...", "recomendaciones": "..." },
  "Oreja Derecha": { "observaciones": "...", "disfunciones_pasadas": "...", "disfunciones_actuales": "...", "recomendaciones": "..." },
  "Resumen General": "..."
}
    `;

    // 🔹 Llamada a OpenAI con imágenes
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // ✅ gratis en la cuenta free
      messages: [
        {
          role: "system",
          content: "Eres un experto en auriculoterapia y diagnóstico energético.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: orejaIzquierda } },
            { type: "image_url", image_url: { url: orejaDerecha } },
          ],
        },
      ],
      max_tokens: 800,
    });

    const analisisTexto = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ analisis: analisisTexto }),
    };
  } catch (error) {
    console.error("❌ Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al procesar el análisis",
        detalle: error.message,
      }),
    };
  }
}
