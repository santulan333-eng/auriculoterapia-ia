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

    // Llamada a OpenAI con visión
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // modelo con visión
      messages: [
        {
          role: "system",
          content: "Eres un experto en auriculoterapia y reflexología de la oreja. Tu rol es ofrecer una guía educativa, apreciativa y basada en los modelos reflexológicos. Nunca des un diagnóstico médico. Explica observaciones posibles, zonas que podrían estar reflejadas en la oreja y su relación con la salud de manera informativa y comprensible.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Por favor analiza esta imagen de la oreja y dame una guía apreciativa y educativa basada en los modelos reflexológicos de auriculoterapia." },
            { type: "image_url", image_url: body.imagen }
