import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function handler(event) {
  try {
    const { contenido } = JSON.parse(event.body);

    if (!contenido) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No se envió contenido para el PDF" }),
      };
    }

    // Crear documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    // Dividir texto en líneas para ajustarlo
    const fontSize = 12;
    const margin = 50;
    const maxWidth = 500;
    const textLines = wrapText(contenido, font, fontSize, maxWidth);

    let y = height - margin;

    textLines.forEach((line) => {
      if (y < margin) {
        // Crear nueva página si se acaba el espacio
        const newPage = pdfDoc.addPage([600, 800]);
        y = height - margin;
        newPage.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= fontSize + 5;
      } else {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= fontSize + 5;
      }
    });

    const pdfBytes = await pdfDoc.save();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=guia-auriculoterapia.pdf",
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
}

// 🔧 Función auxiliar para cortar texto en líneas
function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  words.forEach((word) => {
    const testLine = line + word + " ";
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line.trim());
  return lines;
}
