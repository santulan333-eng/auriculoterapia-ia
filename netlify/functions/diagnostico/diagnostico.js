const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.imagen || !body.oreja) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió ninguna imagen o no se indicó la oreja" }),
      };
    }

    console.log(`📷 Procesando oreja ${body.oreja}...`);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en auriculoterapia y reflexología auricular. 
          Analiza imágenes de orejas y genera una GUÍA APRECIATIVA, no un diagnóstico médico. 
          Tu respuesta debe estar en español y estructurada en:

          1. Observaciones generales sobre la oreja ${body.oreja}.
          2. Posibles desequilibrios reflejados según los modelos reflexológicos.
          3. Puntos auriculares recomendados para estimular y favorecer el equilibrio.
          4. Nota final aclarando que no es un diagnóstico médico y que se recomienda 
             acudir a un profesional de la salud para una valoración formal.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Analiza la oreja ${body.oreja} y genera la guía reflexológica.` },
            {
              type: "image_url",
              image_url: {
                url: body.imagen, // 👈 CORREGIDO: ahora es un objeto { url: ... }
              },
            },
          ],
        },
      ],
    });

    const guia = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ guia }),
    };
  } catch (error) {
    console.error("❌ Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener guía" }),
    };
  }
};
