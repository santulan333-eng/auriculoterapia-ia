const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { orejaIzquierda, orejaDerecha, guia } = body;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Página inicial
    const page = pdfDoc.addPage([600, 800]);
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
    y -= 40;

    // Oreja izquierda
    if (orejaIzquierda && guia.izquierda) {
      page.drawText("👂 Oreja Izquierda:", { x: 50, y, size: 16, font });
      y -= 20;

      const leftBytes = Buffer.from(orejaIzquierda.split(",")[1], "base64");
      const leftImg = await pdfDoc.embedJpg(leftBytes);
      const leftDims = leftImg.scale(0.25);
      page.drawImage(leftImg, {
        x: 50,
        y: y - leftDims.height,
        width: leftDims.width,
        height: leftDims.height,
      });

      y -= leftDims.height + 20;

      page.drawText(guia.izquierda, {
        x: 50,
        y,
        size: 12,
        font,
        lineHeight: 14,
        maxWidth: 500,
      });

      y -= 100;
    }

    // Oreja derecha
    if (orejaDerecha && guia.derecha) {
      page.drawText("👂 Oreja Derecha:", { x: 50, y, size: 16, font });
      y -= 20;

      const rightBytes = Buffer.from(orejaDerecha.split(",")[1], "base64");
      const rightImg = await pdfDoc.embedJpg(rightBytes);
      const rightDims = rightImg.scale(0.25);
      page.drawImage(rightImg, {
        x: 50,
        y: y - rightDims.height,
        width: rightDims.width,
        height: rightDims.height,
      });

      y -= rightDims.height + 20;

      page.drawText(guia.derecha, {
        x: 50,
        y,
        size: 12,
        font,
        lineHeight: 14,
        maxWidth: 500,
      });
    }

    // Guardar PDF
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
};
