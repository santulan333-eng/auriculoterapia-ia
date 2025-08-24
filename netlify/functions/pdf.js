// netlify/functions/pdf.js
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// Función para envolver texto (ajuste de línea)
function drawWrappedText(page, text, x, y, font, size, maxWidth, lineHeight) {
  if (!text) return y;
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && i > 0) {
      page.drawText(line, { x, y: cursorY, size, font });
      line = words[i] + " ";
      cursorY -= lineHeight;
      if (cursorY < 60) {
        // Agrega página si no hay espacio
        const { width } = page.getSize();
        const pdfDoc = page.doc; // referencia implícita no soportada en pdf-lib; manejaremos fuera
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cursorY, size, font });
    cursorY -= lineHeight;
  }
  return cursorY;
}

// Dibuja una sección (título + imagen + texto) y hace salto de página si falta espacio
async function addEarSection(pdfDoc, page, font, titulo, base64Img, texto, yStart) {
  let y = yStart;
  const marginX = 50;
  const contentWidth = 500;

  if (!base64Img || !texto) return y;

  // Título
  page.drawText(titulo, { x: marginX, y, size: 16, font, color: rgb(0, 0, 0) });
  y -= 20;

  // Decodificar imagen y detectar tipo
  const match = base64Img.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    // Si no coincide el formato dataURL, seguimos con el texto solamente
  } else {
    const mime = match[1];
    const bytes = Buffer.from(match[2], "base64");

    let embedded;
    try {
      if (mime === "image/png") {
        embedded = await pdfDoc.embedPng(bytes);
      } else {
        // Por defecto intentamos como JPG/JPEG
        embedded = await pdfDoc.embedJpg(bytes);
      }
      const imgDims = embedded.scale(0.25);

      // Si la imagen no cabe, nueva página
      if (y - imgDims.height < 60) {
        page = pdfDoc.addPage([600, 800]);
        const { height } = page.getSize();
        y = height - 60;
      }

      page.drawImage(embedded, {
        x: marginX,
        y: y - imgDims.height,
        width: imgDims.width,
        height: imgDims.height,
      });

      y -= imgDims.height + 20;
    } catch (e) {
      // Si falla la incrustación de imagen, continuamos con el texto
      y -= 10;
    }
  }

  // Texto envuelto
  const { height } = page.getSize();
  const lineHeight = 14;
  const textBlocks = texto.split(/\n{2,}/); // dividir por párrafos dobles

  for (const block of textBlocks) {
    // Si queda poco espacio, nueva página
    if (y < 80) {
      page = pdfDoc.addPage([600, 800]);
      y = height - 60;
    }
    y = drawWrappedText(page, block, marginX, y, font, 12, contentWidth, lineHeight);
    y -= 6;
  }

  // Espacio extra al final de la sección
  y -= 10;
  return y;
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { orejaIzquierda, orejaDerecha, guia } = body;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Página inicial
    let page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();
    let y = height - 50;

    // Título
    page.drawText("Guía de Auriculoterapia", {
      x: 50,
      y,
      size: 20,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 30;

    // Nota introductoria
    y = drawWrappedText(
      page,
      "Este informe es una guía apreciativa basada en modelos reflexológicos de auriculoterapia. No sustituye una valoración médica profesional.",
      50,
      y,
      font,
      10,
      500,
      12
    );
    y -= 10;

    // Sección Oreja Izquierda
    if (orejaIzquierda && guia?.izquierda) {
      y = await addEarSection(pdfDoc, page, font, "👂 Oreja Izquierda", orejaIzquierda, guia.izquierda, y);
      if (y < 80) {
        page = pdfDoc.addPage([600, 800]);
        y = height - 60;
      }
    }

    // Sección Oreja Derecha
    if (orejaDerecha && guia?.derecha) {
      y = await addEarSection(pdfDoc, page, font, "👂 Oreja Derecha", orejaDerecha, guia.derecha, y);
    }

    // Nota final
    if (y < 100) {
      page = pdfDoc.addPage([600, 800]);
      y = height - 50;
    }
    page.drawText("⚠️ Nota: Esta guía es orientativa y educativa. No reemplaza un diagnóstico médico profesional.", {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=guia-auriculoterapia.pdf",
      },
      body: Buffer.from(pdfBytes).toString("base64"),
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
