/**
 * /api/tiempo/mensaje
 * Returns a unique, AI-generated funny weather comment every time it's called.
 * Response is never cached so the message changes on every reload.
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt, type WeatherSnapshot } from "@/app/lib/weatherMessageHelpers";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY from env

export async function POST(req: NextRequest) {
  try {
    const snap: WeatherSnapshot = await req.json();

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 120,
      temperature: 1,           // max variety
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(snap) }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "Pura vida, mae.";

    return NextResponse.json(
      { message: text },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("[tiempo/mensaje]", err);
    // Fallback so the page never breaks if Anthropic is unreachable
    return NextResponse.json(
      { message: "El clima aquí tiene más personalidad que la mayoría de la gente." },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
