import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import { recordMundialAnalyticsEvent } from "@/lib/mundial/analytics";
import { MUNDIAL_MATCHES } from "@/lib/mundial/fixtures";

export const dynamic = "force-dynamic";

const STAT_QUESTIONS_COLLECTION = "mundial_stat_questions";
const STAT_BETS_COLLECTION = "mundial_stat_bets";

type StatBetOption = {
  id: string;
  text?: string;
  label?: string;
};

function normalizeName(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}
function normalizeKey(value: string) {
  return value.trim().toUpperCase();
}

function kickoffTime(kickoffAt: string) {
  const t = new Date(kickoffAt).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

export async function GET(req: NextRequest) {
  try {
    const matchId = req.nextUrl.searchParams.get("matchId") ?? "";
    const playerName = normalizeName(req.nextUrl.searchParams.get("playerName"));

    if (!matchId) {
      return NextResponse.json({ error: "matchId requerido." }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();

    const [questions, myBets, allMatchBets] = await Promise.all([
      db.collection(STAT_QUESTIONS_COLLECTION).find({ matchId }).sort({ createdAt: 1 }).toArray(),
      playerName
        ? db.collection(STAT_BETS_COLLECTION).find({ matchId, normalizedName: normalizeKey(playerName) }).toArray()
        : Promise.resolve([]),
      db.collection(STAT_BETS_COLLECTION).find({ matchId }).toArray(),
    ]);

    // Build per-player leaderboard for this match
    const playerMap = new Map<string, { playerName: string; earned: number; total: number }>();
    for (const bet of allMatchBets) {
      const key = String(bet.normalizedName ?? "");
      if (!key) continue;
      if (!playerMap.has(key)) {
        playerMap.set(key, { playerName: String(bet.playerName ?? key), earned: 0, total: 0 });
      }
      const entry = playerMap.get(key)!;
      entry.total++;
      const q = questions.find((q) => q.id === bet.questionId);
      if (q?.correctOptionId && bet.optionId === q.correctOptionId) {
        entry.earned += Number(q.pointValue ?? 1);
      }
    }
    const leaderboard = [...playerMap.values()].sort(
      (a, b) => b.earned - a.earned || b.total - a.total || a.playerName.localeCompare(b.playerName)
    );

    const matchKickoff = kickoffTime(MUNDIAL_MATCHES.find((m) => m.id === matchId)?.kickoffAt ?? "");
    const isClosed = matchKickoff <= now.getTime();

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctOptionId: q.correctOptionId ?? null,
        resolved: Boolean(q.correctOptionId),
        pointValue: q.pointValue ?? 1,
        closed: isClosed,
      })),
      myBets: myBets.map((b) => ({
        questionId: b.questionId,
        optionId: b.optionId,
      })),
      leaderboard,
    });
  } catch (error) {
    console.error("Failed to load stat bets", error);
    return NextResponse.json({ error: "No se pudo cargar las apuestas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, matchId, playerName: rawName, optionId } = body;

    const playerName = normalizeName(rawName);
    const normalizedName = normalizeKey(playerName);

    if (!questionId || !matchId || !playerName || !optionId) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    const match = MUNDIAL_MATCHES.find((m) => m.id === matchId);
    if (!match) {
      return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
    }

    if (kickoffTime(match.kickoffAt) <= Date.now()) {
      return NextResponse.json({ error: "El partido ya cerro. No se pueden cambiar apuestas." }, { status: 423 });
    }

    const db = await getDb();
    const question = await db.collection(STAT_QUESTIONS_COLLECTION).findOne({ id: questionId, matchId });

    if (!question) {
      return NextResponse.json({ error: "Pregunta no encontrada para este partido." }, { status: 404 });
    }
    if (question.correctOptionId) {
      return NextResponse.json({ error: "Esta pregunta ya fue resuelta." }, { status: 423 });
    }

    const validOption = (question.options as StatBetOption[] | undefined)?.find((o) => o.id === optionId);
    if (!validOption) {
      return NextResponse.json({ error: "Opcion invalida." }, { status: 400 });
    }

    const now = new Date();
    await db.collection(STAT_BETS_COLLECTION).updateOne(
      { questionId, normalizedName },
      {
        $set: { questionId, matchId, playerName, normalizedName, optionId, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    await recordMundialAnalyticsEvent(db, req, {
      event: "stat_bet_saved",
      playerName,
      normalizedName,
      happenedAt: now,
      metadata: {
        matchId,
        matchNumber: match.number,
        matchLabel: `${match.homeTeam} vs ${match.awayTeam}`,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        questionId,
        questionText: question.text ?? null,
        optionId,
        optionText: validOption.text ?? validOption.label ?? null,
        savedAt: now.toISOString(),
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save stat bet", error);
    return NextResponse.json({ error: "No se pudo guardar la apuesta." }, { status: 500 });
  }
}
