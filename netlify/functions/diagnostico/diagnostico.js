import OpenAI from "openai";

// Cliente de OpenAI
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // 🔹 Prompt detallado para análisis
    const prompt = `
    Analiza las imágenes de ambas orejas según la Medicina Tradicional China.
    Debes:
    - Describir cada punto auricular visible.
    - Analizar textura, color, marcas y cambios de tono.
    - Diferenciar entre disfunciones pasadas (marcas, cicatrices, hundimientos) 
      y actuales (cambios recientes, inflamaciones, rojeces).
    - Resaltar órganos o sistemas afectados con explicación breve y clara.
    - Dar recomendaciones generales de estilo de vida o cuidados.
    Formato esperado: texto claro en español.
    `;

    // 🔹 Llamada a OpenAI Vision
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // ✅ gratis con tu cuenta free
      messages: [
        { role: "system", content: "Eres un experto en auriculoterapia y diagnóstico energético." },
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
