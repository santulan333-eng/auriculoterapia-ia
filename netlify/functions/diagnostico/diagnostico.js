const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    console.log("Evento recibido:", event.body); // 👈 log para ver la imagen que llega
    const body = JSON.parse(event.body || "{}");
    if (!body.imagen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió imagen" }),
      };
    }

    console.log("Llamando a OpenAI con imagen:", body.imagen);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 👈 modelo con visión
      messages: [
        {
          role: "system",
          content: "Eres un experto en auriculoterapia. Analiza imágenes de orejas y da un diagnóstico breve.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analiza esta oreja y dame un diagnóstico de auriculoterapia." },
            {
  type: "image_url",
  image_url: {
    url: body.imagen, // 👈 si ya incluye el "data:image/png;base64,"
  },
},
,
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
    console.error("Error en diagnostico.js:", error); // 👈 esto sale en los logs de Netlify
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener diagnóstico" }),
    };
  }
};
