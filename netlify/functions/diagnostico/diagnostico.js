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
      model: "gpt-4o-mini", // Modelo con visión
      messages: [
        {
          role: "system",
          content: `Eres un asistente especializado en auriculoterapia. 
          Observa cuidadosamente la imagen de la oreja y describe posibles señales, zonas de tensión o desequilibrio 
          según la práctica de auriculoterapia. 
          Ofrece tu análisis solo con fines educativos y de bienestar general, 
          nunca como diagnóstico médico. 
          Sé claro y breve en tus respuestas.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analiza esta oreja y describe lo que observas según la auriculoterapia." },
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
