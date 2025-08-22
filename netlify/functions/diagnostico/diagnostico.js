import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body || "{}");
    const imagen = body.imagen;

    if (!imagen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió imagen" }),
      };
    }

    // Llamada a OpenAI con GPT-4o-mini (acepta imagen + texto)
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en auriculoterapia. Analiza imágenes de orejas y devuelve un diagnóstico orientativo basado en esta técnica.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Por favor, analiza esta imagen y dame un diagnóstico breve." },
            { type: "image_url", image_url: imagen }, // Aquí va la foto en base64
          ],
        },
      ],
    });

    const diagnostico = response.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ diagnostico }),
    };
  } catch (error) {
    console.error("Error en la función diagnostico:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener diagnóstico" }),
    };
  }
}
