// netlify/functions/pdf.js
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { guia, orejaIzquierda, orejaDerecha } = body;

    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage([595, 842]); // tamaño A4
    const { height } = page.getSize();
    const fontSize = 12;

    let y = height - 50;

    // 🔹 Título principal
    page.drawText("Informe de Auriculoterapia", {
      x: 50,
      y,
      size: 18,
      font: timesRomanFont,
      color: rgb(0, 0.2, 0.6),
    });
    y -= 40;

    // Función auxiliar para cada oreja
    const agregarOreja = async (titulo, imagenBase64, texto) => {
      // Subtítulo
      page.drawText(titulo, {
        x: 50,
        y,
        size: 14,
        font: timesRomanFont,
        color: rgb(0.8, 0, 0),
      });
      y -= 20;

      // Imagen
      if (imagenBase64) {
        try {
          const imageBytes = Buffer.from(imagenBase64.split(",")[1], "base64");
          const image = await pdfDoc.embedJpg(imageBytes);
          const scaled = image.scale(0.25);
          page.drawImage(image, {
            x: 50,
            y: y - scaled.height,
            width: scaled.width,
            height: scaled.height,
          });
          y -= scaled.height + 20;
        } catch (e) {
          console.error("⚠️ No se pudo incrustar la imagen:", e);
          page.drawText("Imagen no disponible", { x: 50, y, size: fontSize });
          y -= 20;
        }
      }

      // Texto del análisis
      const wrapped = wrapText(texto || "Sin observaciones", 80);
      wrapped.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        y -= 16;
      });

      y -= 30; // espacio extra
    };

    // 🔹 Oreja izquierda
    await agregarOreja("Oreja Izquierda", orejaIzquierda, guia.izquierda);

    // 🔹 Oreja derecha
    await agregarOreja("Oreja Derecha", orejaDerecha, guia.derecha);

    // Generar PDF final
    const pdfBytes = await pdfDoc.save();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=auriculoterapia.pdf",
      },
      body: pdfBytes.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("❌ Error en pdf.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo generar el PDF" }),
    };
  }
};

// 🔹 Función para cortar texto largo en varias líneas
function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine);
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });

  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  return lines;
}
