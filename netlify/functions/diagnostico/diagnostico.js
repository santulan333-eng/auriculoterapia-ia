const OpenAI = require("openai");
const PDFDocument = require("pdfkit");
const getStream = require("get-stream");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function agregarImagenBase64(doc, base64, x, y, maxWidth = 250) {
  try {
    const data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(data, "base64");
    doc.image(buffer, x, y, { fit: [maxWidth, 300], align: "center" });
    doc.moveDown();
  } catch (err) {
    console.error("⚠️ Error al agregar imagen al PDF:", err.message);
  }
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { izquierda, derecha } = body;

    if (!izquierda && !derecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió ninguna imagen" }),
      };
    }

    const results = {};

    // Analizar oreja izquierda
    if (izquierda) {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en auriculoterapia. Analiza la imagen de la oreja izquierda, da una guía apreciativa basada en los modelos reflexológicos. Sugiere puntos a estimular y finaliza aclarando que esto no es un diagnóstico médico, solo una guía.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Guíame con la oreja izquierda:" },
              { type: "image_url", image_url: { url: izquierda } },
            ],
          },
        ],
      });

      results.izquierda = completion.choices[0].message.content;
    }

    // Analizar oreja derecha
    if (derecha) {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en auriculoterapia. Analiza la imagen de la oreja derecha, da una guía apreciativa basada en los modelos reflexológicos. Sugiere puntos a estimular y finaliza aclarando que esto no es un diagnóstico médico, solo una guía.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Guíame con la oreja derecha:" },
              { type: "image_url", image_url: { url: derecha } },
            ],
          },
        ],
      });

      results.derecha = completion.choices[0].message.content;
    }

    // Generar PDF con ambas orejas e imágenes
    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});

    doc.fontSize(20).text("Guía de Auriculoterapia", { align: "center" });
    doc.moveDown();

    if (results.izquierda) {
      doc.fontSize(16).text("Oreja Izquierda", { underline: true });
      doc.moveDown();
      if (izquierda) {
        agregarImagenBase64(doc, izquierda, 100, doc.y);
        doc.moveDown(2);
      }
      doc.fontSize(12).text(results.izquierda, { align: "left" });
      doc.addPage();
    }

    if (results.derecha) {
      doc.fontSize(16).text("Oreja Derecha", { underline: true });
      doc.moveDown();
      if (derecha) {
        agregarImagenBase64(doc, derecha, 100, doc.y);
        doc.moveDown(2);
      }
      doc.fontSize(12).text(results.derecha, { align: "left" });
    }

    doc.end();
    const pdfBuffer = await getStream.buffer(doc);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=guia-auriculoterapia.pdf",
      },
      body: pdfBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("❌ Error en diagnostico.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener guía" }),
    };
  }
};
