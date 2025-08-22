const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    console.log("Evento recibido:", event.body);

    const body = JSON.parse(event.body || "{}");
    if (!body.imagen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió imagen" }),
      };
    }

    console.log("Llamando a OpenAI con imagen...");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // modelo con visión
      messages: [
        {
          role: "system",
          content: "Eres un experto en auriculoterapia. Analiza imágenes de orejas y da un diagnóstico breve.",
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

    console.log("Respuesta completa de OpenAI:", JSON.stringify(completion, null, 2));

    const diagnostico = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ diagnostico }),
    };
  } catch (error) {
    console.error("Error en diagnostico.js:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Fallo en OpenAI",
        detalle: error.message || error.toString(),
      }),
    };
  }
};
