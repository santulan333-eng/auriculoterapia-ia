const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.imagen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió imagen" }),
      };
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en auriculoterapia y reflexología. 
          Observa imágenes de orejas y ofrece una guía apreciativa basada en modelos reflexológicos.
          La guía debe incluir:
          1. Observaciones generales de la oreja.
          2. Posibles desequilibrios reflejados.
          3. Sugerencias de puntos auriculares a estimular para promover el equilibrio.
          4. Una advertencia clara al final: "⚠️ Esta guía es orientativa y no reemplaza la valoración médica profesional".`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analiza esta oreja y genera la guía reflexológica solicitada." },
            { type: "image_url", image_url: body.imagen },
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
      body: JSON.stringify({ error: "No se pudo obtener guia" }),
    };
  }
};
