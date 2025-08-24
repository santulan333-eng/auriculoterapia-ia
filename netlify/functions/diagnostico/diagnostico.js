import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  // Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { orejaIzquierda, orejaDerecha } = body;

    if (!orejaIzquierda || !orejaDerecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Faltan imágenes de las orejas" }),
      };
    }

    // Prompt para el análisis detallado
    const prompt = `
Analiza ambas orejas según Medicina Tradicional China. 
Debes:
- Describir cada punto auricular visible.
- Analizar textura, color, marcas y cambios de tono.
- Diferenciar entre disfunciones pasadas (marcas, cicatrices, hundimientos) y actuales (inflamaciones, rojeces).
- Resaltar órganos o sistemas afectados con explicación breve.
- Dar recomendaciones de estilo de vida o cuidados.
El resultado debe ser claro y ordenado para un informe clínico.
    `;

    // Llamada a OpenAI Vision
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // modelo gratuito
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
