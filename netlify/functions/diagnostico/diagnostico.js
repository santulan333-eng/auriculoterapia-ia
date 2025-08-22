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

    // Petición a OpenAI con fallback
    let guia = "";
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en auriculoterapia. Analiza imágenes de orejas y ofrece una guía apreciativa reflexológica. Sugiere posibles desequilibrios observables y recomienda puntos de la oreja que podrían estimularse. Al final aclara: '⚠️ Esto no es un diagnóstico médico, solo una guía general. Se recomienda visitar a un profesional de la salud.'",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Por favor analiza esta oreja:" },
              { type: "image_url", image_url: body.imagen },
            ],
          },
        ],
      });

      guia = completion.choices[0].message.content;
    } catch (err) {
      console.error("Error en la llamada a OpenAI:", err);
      // Fallback manual si OpenAI falla
      guia = `Guía general de auriculoterapia (modo seguro):
- Observa la oreja en sus zonas principales: lóbulo (cabeza y órganos sensoriales), concha (órganos internos), anti-hélix (columna y sistema nervioso).
- Posibles desequilibrios: tensión, inflamación o cambios de coloración.
- Puntos a estimular comúnmente: Shen Men (calma y equilibrio), Riñón (energía vital), Hígado (detoxificación y manejo de estrés), Estómago (digestión).
⚠️ Esto no es un diagnóstico médico, solo una guía general. Consulta siempre con un profesional.`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ guia }),
    };
  } catch (error) {
    console.error("Error inesperado en diagnostico.js:", error);
    return {
      statusCode: 200, // 👈 devolvemos 200 igual para que no rompa el frontend
      body: JSON.stringify({
        guia: `⚠️ No se pudo procesar la imagen, pero aquí tienes una guía general:
- Puntos útiles: Shen Men, Hígado, Riñón, Estómago.
- Recuerda que esto no sustituye la valoración médica.`,
      }),
    };
  }
};
