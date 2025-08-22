// Función simple para probar que Netlify la detecta
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: "La función está funcionando 🎉" })
  };
}
