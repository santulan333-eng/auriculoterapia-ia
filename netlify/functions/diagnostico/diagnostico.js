const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.orejaIzquierda && !body.orejaDerecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió ninguna imagen" }),
      };
    }

    const images = [];
    if (body.orejaIzquierda) {
      images.push({ type: "image_url", image_url: `data:image/jpeg;base64,${body.orejaIzquierda}` });
    }
    if (body.orejaDerecha) {
      images.push({ type: "image_url", image_url: `data:image/jpeg;base64,${body.orejaDerecha}` });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en auriculoterapia y reflexología auricular.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza las imágenes proporcionadas de las orejas. 
                - Identifica posibles desequilibrios según modelos reflexológicos.
                - Sugiere puntos reflexológicos en la oreja a estimular para mejorar el equilibrio.
                - Explica diferencias si hay entre la oreja izquierda y la derecha.
                Importante: esto no es un diagnóstico médico, solo una guía apreciativa. 
                Recomienda visitar a un médico para valoración profesional.`,
            },
            ...images,
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
    console.error("Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener guía" }),
    };
  }
};
