import OpenAI from "openai";
import type { PreferredModel } from "./types";

export interface ModelResult {
  content: string;
  tokensUsed: number;
}

async function callClaude(systemPrompt: string, userMessage: string): Promise<ModelResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured — this agent cannot think right now.");
  }
  const model = process.env.ANTHROPIC_BOTS_MODEL?.trim() || "claude-sonnet-4-5-20250929";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Claude call failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const textBlock = Array.isArray(data.content)
    ? data.content.find((block: { type: string }) => block.type === "text")
    : null;

  return {
    content: textBlock?.text ?? "",
    tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
  };
}

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<ModelResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured — this agent cannot think right now.");
  }
  const model = process.env.OPENAI_BOTS_MODEL?.trim()
    || process.env.OPENAI_ASSISTANT_MODEL?.trim()
    || process.env.OPENAI_MODEL?.trim()
    || "gpt-5.6-luna";

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create(
    {
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    },
    { signal: AbortSignal.timeout(30_000) }
  );

  return {
    content: response.output_text ?? "",
    tokensUsed: response.usage?.total_tokens ?? 0,
  };
}

export async function callModel(
  preferredModel: PreferredModel,
  systemPrompt: string,
  userMessage: string
): Promise<ModelResult> {
  return preferredModel === "claude"
    ? callClaude(systemPrompt, userMessage)
    : callOpenAI(systemPrompt, userMessage);
}
