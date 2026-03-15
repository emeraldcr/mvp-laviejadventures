import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createHeroSloganLog } from "@/lib/models/hero-slogan-log";

const client = new Anthropic();

const SLOGAN_MODEL = "claude-haiku-4-5-20251001";
const USER_PROMPT = "Genera un slogan fresco y único para hoy.";

const SYSTEM_PROMPT = `Eres el copywriter creativo de La Vieja Adventures, un tour de cañón en Ciudad Esmeralda sobre el Río La Vieja en San Carlos, Costa Rica. El lugar está dentro de la cuenca del Parque Nacional del Agua Juan Castro Blanco: bosque tropical exuberante, cañones de agua cristalina, cascadas, biodiversidad espectacular y una experiencia de aventura pura e irrepetible.

Tu misión: generar UN slogan héroe único, poético y emocionalmente poderoso para el sitio web.

Reglas:
- Una sola oración por idioma (máximo 12 palabras)
- Evocador, visual, que haga SENTIR la magia del lugar
- Menciona el cañón, el río, la naturaleza o la aventura
- Tono de marca de aventura premium
- Completamente diferente en cada generación — varía metáforas, verbos, imágenes
- Sin clichés como "únicos recuerdos" o "experiencia inolvidable"

Devuelve ÚNICAMENTE un objeto JSON con esta forma exacta:
{"es": "<slogan en español>", "en": "<slogan en inglés>"}
Sin texto adicional.`;

export async function GET() {
  try {
    const message = await client.messages.create({
      model: SLOGAN_MODEL,
      max_tokens: 120,
      temperature: 1,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: USER_PROMPT,
        },
      ],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();

    // Parse and validate
    const parsed = JSON.parse(raw) as { es?: string; en?: string };
    if (!parsed.es || !parsed.en) throw new Error("Invalid shape");

    try {
      await createHeroSloganLog({
        es: parsed.es,
        en: parsed.en,
        model: SLOGAN_MODEL,
        prompt: USER_PROMPT,
        rawResponse: raw,
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error("Failed to save hero slogan log:", dbError);
    }

    return NextResponse.json({ es: parsed.es, en: parsed.en });
  } catch {
    // Fallback slogans — never show an error to the visitor
    const FALLBACKS = [
      {
        es: "Donde el cañón guarda secretos que solo el agua conoce.",
        en: "Where the canyon keeps secrets only the river knows.",
      },
      {
        es: "El río La Vieja te llama — ¿te atreves a responder?",
        en: "The La Vieja river calls — do you dare to answer?",
      },
      {
        es: "Un cañón vivo, un río salvaje, una aventura que te cambia.",
        en: "A living canyon, a wild river, an adventure that changes you.",
      },
    ];
    const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    return NextResponse.json(fallback);
  }
}
