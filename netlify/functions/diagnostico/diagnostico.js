import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // tu API key en variables de Netlify
});

export async function handler(event, context) {
  try {
    // Verifica si se envió archivo (imagen en base64)
    const body = JSON.parse(event.body || "{}");
    const imagen = body.imagen;

    if (!imagen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió imagen" }),
      };
    }

    // Llamada a OpenAI Vision
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // modelo multimodal (texto + imagen)
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en auriculoterapia. Da un diagnóstico inicial y breve basado en la foto del pabellón auricular.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analiza esta imagen del oído:" },
            { type: "image_url", image_url: imagen },
          ],
        },
      ],
    });

    const diagnostico = response.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ resultado: diagnostico }),
    };
  } catch (error) {
    console.error("Error en función:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener diagnóstico" }),
    };
  }
}
