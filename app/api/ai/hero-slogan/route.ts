import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createHeroSloganLog } from "@/lib/models/hero-slogan-log";
import { isMongoConfigured } from "@/lib/mongodb";
import { SLOGAN_MODEL } from "@/lib/constants/ai";

const client = new Anthropic();
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

type HeroSloganPayload = {
  es: string;
  en: string;
};

const FALLBACKS: HeroSloganPayload[] = [
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

function getFallbackSlogan(): HeroSloganPayload {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

function extractJsonPayload(rawText: string): HeroSloganPayload {
  const trimmed = rawText.trim();

  const candidate = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  const parsed = JSON.parse(candidate) as Partial<HeroSloganPayload>;
  if (!parsed.es || !parsed.en) {
    throw new Error("Invalid slogan payload");
  }

  return {
    es: parsed.es,
    en: parsed.en,
  };
}

async function persistSlogan(
  slogan: HeroSloganPayload,
  options: { model: string; prompt: string; rawResponse: string }
) {
  if (!isMongoConfigured) return;

  try {
    await createHeroSloganLog({
      es: slogan.es,
      en: slogan.en,
      model: options.model,
      prompt: options.prompt,
      rawResponse: options.rawResponse,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to save hero slogan log:", error);
  }
}

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

    const contentText = message.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n")
      .trim();

    const parsed = extractJsonPayload(contentText);

    await persistSlogan(parsed, {
      model: SLOGAN_MODEL,
      prompt: USER_PROMPT,
      rawResponse: contentText,
    });

    return NextResponse.json(parsed);
  } catch {
    const fallback = getFallbackSlogan();

    await persistSlogan(fallback, {
      model: "fallback",
      prompt: USER_PROMPT,
      rawResponse: "fallback",
    });

    return NextResponse.json(fallback);
  }
}
