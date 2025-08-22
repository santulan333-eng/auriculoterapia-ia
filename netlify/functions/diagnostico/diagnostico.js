const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { orejaIzquierda, orejaDerecha } = body;

    if (!orejaIzquierda && !orejaDerecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió ninguna imagen" }),
      };
    }

    const analizarOreja = async (imagen, lado) => {
      if (!imagen) return null;

      console.log(`📷 Procesando oreja ${lado}...`);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres un experto en auriculoterapia y reflexología auricular. 
            Tu tarea es analizar con máximo detalle la imagen de una oreja y entregar una guía clara.
            Debes:
            - Evaluar coloraciones, textura, cambios visibles, inflamaciones o marcas.
            - Relacionar cada área con los puntos reflejos del mapa auricular.
            - Diferenciar posibles disfunciones **antiguas** de las **actuales**.
            - Sugerir qué puntos estimular para mejorar el equilibrio.
            - Indicar posibles relaciones emocionales si corresponde.
            - Al final, incluir una nota: 
              "⚠️ Esta guía no constituye un diagnóstico médico. 
              Consulta siempre con un profesional de la salud para una valoración completa."`
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analiza detalladamente la oreja ${lado}.` },
              { type: "image_url", image_url: { url: imagen } },
            ],
          },
        ],
      });

      return response.choices[0].message.content;
    };

    const guia = {
      izquierda: await analizarOreja(orejaIzquierda, "izquierda"),
      derecha: await analizarOreja(orejaDerecha, "derecha"),
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ guia }),
    };
  } catch (error) {
    console.error("❌ Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener la guía" }),
    };
  }
};
