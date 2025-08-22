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

    console.log("Analizando imagen con OpenAI...");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // modelo con visión
      messages: [
        {
          role: "system",
          content: `Eres un experto en auriculoterapia y reflexología auricular. 
          Analizas imágenes de orejas y das una guía apreciativa de la salud de la persona. 
          Además, sugieres qué puntos auriculares podrían estimularse (por ejemplo: Shen Men, Riñón, Hígado, Estómago, Pulmón, etc.) 
          para ayudar a recuperar el equilibrio energético. 
          No des diagnósticos médicos, solo una guía orientativa. 
          Finaliza siempre con una advertencia clara de que esta información es educativa y que se recomienda acudir a un médico para una valoración profesional.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analiza esta oreja y dame una guía apreciativa de auriculoterapia con sugerencias de puntos a estimular." },
            { type: "image_url", image_url: body.imagen },
          ],
        },
      ],
    });

    console.log("Respuesta completa de OpenAI:", JSON.stringify(completion, null, 2));

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
