import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { cleanJobDescription, CvInputError } from "@/lib/cv/jd";
import { buildCvSources } from "@/lib/cv/sources";
import { createGeneration, failGeneration, releaseGeneration } from "@/lib/cv/store";
import { generateCv } from "@/lib/cv/generate";
import { CvGroundingError } from "@/lib/cv/validate";

export const runtime = "nodejs";
export const maxDuration = 240;

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ error: "Sign in with your admin account to generate a CV." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!process.env.OPENAI_API_KEY?.trim()) return NextResponse.json({ error: "Configure OPENAI_API_KEY on the server to generate CVs." }, { status: 503 });
  let id: string | null = null;
  try {
    if (Number(request.headers.get("content-length")) > 170_000) throw new CvInputError("The pasted description is too large.");
    let body: unknown;
    try { body = JSON.parse(await request.text()); } catch { throw new CvInputError("Send a valid job description."); }
    const input = body && typeof body === "object" && "jobDescription" in body ? body.jobDescription : undefined;
    const jobDescription = cleanJobDescription(input);
    const sources = buildCvSources();
    const model = process.env.OPENAI_CV_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
    id = await createGeneration(admin.id, jobDescription, model, sources);
    if (!id) return NextResponse.json({ error: "A CV is already generating. Wait a moment before trying again." }, { status: 429 });
    await generateCv(id, jobDescription, sources, model);
    return NextResponse.json({ id, url: `/cv/generated/${id}` }, { status: 201 });
  } catch (error) {
    const isInput = error instanceof CvInputError;
    const message = isInput || error instanceof CvGroundingError ? error.message : "CV generation could not finish. Check the server connection and try again.";
    if (id) await failGeneration(id, message).catch(() => {});
    console.error("[cv/generate]", error instanceof Error ? error.name : "Generation failure");
    return NextResponse.json({ error: message, id }, { status: isInput ? 400 : error instanceof CvGroundingError ? 422 : 502 });
  } finally {
    if (id) await releaseGeneration(admin.id, id).catch(() => {});
  }
}
