import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";

export const dynamic = "force-dynamic";

const MATCHES_COLLECTION = "mundial_matches";
const MAX_SCORE = 30;

function parseScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return null;
  return score;
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, homeFinalScore, awayFinalScore, forceClosed, actualWinner } = body;

    if (!matchId || typeof matchId !== "string") {
      return NextResponse.json({ error: "matchId requerido." }, { status: 400 });
    }

    const db = await getDb();
    const $set: Record<string, unknown> = { updatedAt: new Date() };

    if ("homeFinalScore" in body) {
      const parsed = body.homeFinalScore === null ? null : parseScore(homeFinalScore);
      if (body.homeFinalScore !== null && parsed === null) {
        return NextResponse.json({ error: "homeFinalScore invalido (0-30)." }, { status: 400 });
      }
      $set.homeFinalScore = parsed;
    }

    if ("awayFinalScore" in body) {
      const parsed = body.awayFinalScore === null ? null : parseScore(awayFinalScore);
      if (body.awayFinalScore !== null && parsed === null) {
        return NextResponse.json({ error: "awayFinalScore invalido (0-30)." }, { status: 400 });
      }
      $set.awayFinalScore = parsed;
    }

    if ("forceClosed" in body) {
      $set.forceClosed = Boolean(forceClosed);
    }

    if ("actualWinner" in body) {
      $set.actualWinner = actualWinner === "home" || actualWinner === "away" ? actualWinner : null;
    }

    const result = await db
      .collection(MATCHES_COLLECTION)
      .updateOne({ id: matchId }, { $set });

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update match", error);
    return NextResponse.json({ error: "No se pudo actualizar el partido." }, { status: 500 });
  }
}
