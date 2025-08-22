import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event, context) {
  try {
    // Petición simple a la IA (solo texto corto)
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente útil." },
        { role: "user", content: "Respóndeme con la palabra: PRUEBA OK" }
      ]
    });

    const respuesta = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ resultado: respuesta })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
