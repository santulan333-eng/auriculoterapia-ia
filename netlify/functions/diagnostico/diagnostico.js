// netlify/functions/diagnostico/diagnostico.js
import OpenAI from "openai";

export async function handler(event, context) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ resultado: "PRUEBA OK" }),
  };
}
