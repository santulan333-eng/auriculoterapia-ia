// netlify/functions/diagnostico.js
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

    const analizar = async (base64, lado) => {
      if (!base64) return null;
      const promptSistema = `Eres un experto en auriculoterapia y reflexología auricular.
Devuelve un informe claro y estructurado en 4 secciones:
1) OBSERVACIONES VISUALES: coloraciones, textura, venas, puntos rojos/blancos, inflamaciones, hundimientos, marcas, piel seca/grasa, simetría del pabellón.
2) DISFUNCIONES ANTIGUAS (HUELLAS): signos que sugieren desequilibrios pasados.
3) DISFUNCIONES ACTUALES: signos predominantes que sugieren desequilibrios activos.
4) PUNTOS A ESTIMULAR: lista de puntos auriculares concretos (ej.: Shen Men, Simpático, Hígado, Riñón, Estómago, Columna, Cadera, Tórax, Ansiedad/Insomnio, etc.), justificando cada sugerencia en 1 línea.
Al final añade: "Esta guía es orientativa. No reemplaza diagnóstico médico."`;

      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: promptSistema },
          {
            role: "user",
            content: [
              { type: "text", text: `Analiza detalladamente la oreja ${lado}.` },
              { type: "image_url", image_url: { url: base64 } },
            ],
          },
        ],
      });
      return res.choices?.[0]?.message?.content || null;
    };

    const guia = {
      izquierda: await analizar(orejaIzquierda, "izquierda"),
      derecha: await analizar(orejaDerecha, "derecha"),
    };

    return { statusCode: 200, body: JSON.stringify({ guia }) };
  } catch (err) {
    console.error("❌ Error en diagnostico.js:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "No se pudo obtener la guía" }) };
  }
};
