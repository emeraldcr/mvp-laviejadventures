/**
 * /api/tiempo/mensaje
 * Returns a unique, AI-generated funny weather comment every time it's called.
 * Response is never cached so the message changes on every reload.
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt, type WeatherSnapshot } from "@/lib/weatherMessageHelpers";
import {
  WEATHER_MESSAGE_CACHE_HEADERS,
  WEATHER_MESSAGE_DEFAULT_TEXT,
  WEATHER_MESSAGE_ERROR_FALLBACK,
  WEATHER_MESSAGE_FALLBACK_CACHE_HEADERS,
  WEATHER_MESSAGE_MAX_TOKENS,
  WEATHER_MESSAGE_MODEL,
  WEATHER_MESSAGE_TEMPERATURE,
} from "@/lib/weatherMessageConstants";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY from env

export async function POST(req: NextRequest) {
  try {
    const snap: WeatherSnapshot = await req.json();

    const message = await client.messages.create({
      model: WEATHER_MESSAGE_MODEL,
      max_tokens: WEATHER_MESSAGE_MAX_TOKENS,
      temperature: WEATHER_MESSAGE_TEMPERATURE, // max variety
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(snap) }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : WEATHER_MESSAGE_DEFAULT_TEXT;

    return NextResponse.json(
      { message: text },
      {
        headers: {
          ...WEATHER_MESSAGE_CACHE_HEADERS,
        },
      }
    );
  } catch (err) {
    console.error("[tiempo/mensaje]", err);
    // Fallback so the page never breaks if Anthropic is unreachable
    return NextResponse.json(
      { message: WEATHER_MESSAGE_ERROR_FALLBACK },
      { status: 200, headers: WEATHER_MESSAGE_FALLBACK_CACHE_HEADERS }
    );
  }
}
