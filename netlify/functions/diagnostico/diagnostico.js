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

    // Llamada a OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",   // modelo económico con visión
      messages: [
        {
          role: "system",
          content: "Eres un experto en auriculoterapia. Analiza imágenes de orejas y da un diagnóstico en texto breve.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analiza esta oreja y dame un diagnóstico de auriculoterapia." },
            { type: "image_url", image_url: body.imagen },
          ],
        },
      ],
    });

    const diagnostico = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ diagnostico }),
    };
  } catch (error) {
    console.error("Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener diagnóstico" }),
    };
  }
};
