const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.orejaIzquierda && !body.orejaDerecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se enviaron imágenes" }),
      };
    }

    let mensajes = [
      {
        role: "system",
        content:
          "Eres un experto en reflexología auricular. Analiza imágenes de orejas y genera una guía apreciativa basada en modelos reflexológicos de la auriculoterapia. Incluye posibles desequilibrios que pueden observarse, sugerencias de puntos a estimular en la oreja, y aclara al final que no es un diagnóstico médico sino una guía orientativa.",
      },
    ];

    if (body.orejaIzquierda) {
      mensajes.push({
        role: "user",
        content: [
          { type: "text", text: "Analiza esta imagen de la oreja izquierda y brinda una guía reflexológica breve y clara." },
          { type: "image_url", image_url: { url: body.orejaIzquierda } },
        ],
      });
    }

    if (body.orejaDerecha) {
      mensajes.push({
        role: "user",
        content: [
          { type: "text", text: "Analiza esta imagen de la oreja derecha y brinda una guía reflexológica breve y clara." },
          { type: "image_url", image_url: { url: body.orejaDerecha } },
        ],
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: mensajes,
    });

    let guia = completion.choices[0].message.content;

    // Añadir títulos claros si se enviaron ambas orejas
    let resultadoFinal = "";
    if (body.orejaIzquierda && body.orejaDerecha) {
      resultadoFinal = `🦻 **Oreja Izquierda**\n${guia}\n\n🦻 **Oreja Derecha**\n${guia}\n\n⚠️ Esta es una guía orientativa basada en reflexología auricular. No reemplaza la valoración médica.`;
    } else if (body.orejaIzquierda) {
      resultadoFinal = `🦻 **Oreja Izquierda**\n${guia}\n\n⚠️ Esta es una guía orientativa basada en reflexología auricular. No reemplaza la valoración médica.`;
    } else if (body.orejaDerecha) {
      resultadoFinal = `🦻 **Oreja Derecha**\n${guia}\n\n⚠️ Esta es una guía orientativa basada en reflexología auricular. No reemplaza la valoración médica.`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ guia: resultadoFinal }),
    };
  } catch (error) {
    console.error("Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener guía" }),
    };
  }
};
