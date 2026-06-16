import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import { serializeBettingFavorite } from "@/lib/mundial/betting";

export const dynamic = "force-dynamic";

const MATCHES_COLLECTION = "mundial_matches";
const MAX_SCORE = 30;
const MAX_LIVE_MINUTE = 130;

type LiveMatchStatus = "scheduled" | "live" | "halftime" | "fulltime";
type LiveEventType = "goal" | "penalty" | "yellow" | "red" | "var" | "substitution" | "note";
type LiveEventTeam = "home" | "away" | null;
type MatchTeams = { homeTeam?: string; awayTeam?: string };

const LIVE_STATUSES = new Set<LiveMatchStatus>(["scheduled", "live", "halftime", "fulltime"]);
const LIVE_EVENT_TYPES = new Set<LiveEventType>([
  "goal",
  "penalty",
  "yellow",
  "red",
  "var",
  "substitution",
  "note",
]);

function parseScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return null;
  return score;
}

function parseLiveMinute(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const minute = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(minute) || minute < 0 || minute > MAX_LIVE_MINUTE) return null;
  return minute;
}

function parseLiveStatus(value: unknown): LiveMatchStatus | null {
  return typeof value === "string" && LIVE_STATUSES.has(value as LiveMatchStatus)
    ? (value as LiveMatchStatus)
    : null;
}

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function parseLiveEvents(value: unknown) {
  if (!Array.isArray(value) || value.length > 40) return null;
  const now = new Date().toISOString();

  return value.map((raw, index) => {
    const event = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    const type = typeof event.type === "string" && LIVE_EVENT_TYPES.has(event.type as LiveEventType)
      ? event.type as LiveEventType
      : "note";
    const team: LiveEventTeam = event.team === "home" || event.team === "away" ? event.team : null;
    const minute = parseLiveMinute(event.minute);
    const id = cleanText(event.id, 80) || `${Date.now()}-${index}`;
    const createdAt = cleanText(event.createdAt, 40) || now;

    return {
      id,
      type,
      team,
      minute,
      player: cleanText(event.player, 80),
      note: cleanText(event.note, 160),
      createdAt,
    };
  });
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
    let matchTeams: MatchTeams | null = null;

    async function readMatchTeams() {
      if (!matchTeams) {
        matchTeams = await db
          .collection<MatchTeams>(MATCHES_COLLECTION)
          .findOne({ id: matchId }, { projection: { homeTeam: 1, awayTeam: 1 } });
      }
      return matchTeams;
    }

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

    if ("liveStatus" in body) {
      const parsed = parseLiveStatus(body.liveStatus);
      if (!parsed) {
        return NextResponse.json({ error: "liveStatus invalido." }, { status: 400 });
      }
      $set.liveStatus = parsed;
      $set.liveUpdatedAt = new Date();
    }

    if ("liveMinute" in body) {
      const parsed = parseLiveMinute(body.liveMinute);
      if (body.liveMinute !== null && body.liveMinute !== "" && parsed === null) {
        return NextResponse.json({ error: "liveMinute invalido (0-130)." }, { status: 400 });
      }
      $set.liveMinute = parsed;
      $set.liveUpdatedAt = new Date();
    }

    if ("homeLiveScore" in body) {
      const parsed = body.homeLiveScore === null || body.homeLiveScore === "" ? null : parseScore(body.homeLiveScore);
      if (body.homeLiveScore !== null && body.homeLiveScore !== "" && parsed === null) {
        return NextResponse.json({ error: "homeLiveScore invalido (0-30)." }, { status: 400 });
      }
      $set.homeLiveScore = parsed;
      $set.liveUpdatedAt = new Date();
    }

    if ("awayLiveScore" in body) {
      const parsed = body.awayLiveScore === null || body.awayLiveScore === "" ? null : parseScore(body.awayLiveScore);
      if (body.awayLiveScore !== null && body.awayLiveScore !== "" && parsed === null) {
        return NextResponse.json({ error: "awayLiveScore invalido (0-30)." }, { status: 400 });
      }
      $set.awayLiveScore = parsed;
      $set.liveUpdatedAt = new Date();
    }

    if ("liveNote" in body) {
      $set.liveNote = cleanText(body.liveNote, 220);
      $set.liveUpdatedAt = new Date();
    }

    if ("liveEvents" in body) {
      const parsed = parseLiveEvents(body.liveEvents);
      if (parsed === null) {
        return NextResponse.json({ error: "liveEvents invalido (max 40 eventos)." }, { status: 400 });
      }
      $set.liveEvents = parsed;
      $set.liveUpdatedAt = new Date();
    }

    if ("bettingFavorite" in body) {
      if (body.bettingFavorite === null) {
        $set.bettingFavorite = null;
      } else {
        const teams = await readMatchTeams();
        if (!teams?.homeTeam || !teams.awayTeam) {
          return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
        }

        $set.bettingFavorite = serializeBettingFavorite(
          { ...body.bettingFavorite, updatedAt: new Date() },
          { homeTeam: teams.homeTeam, awayTeam: teams.awayTeam }
        );
      }
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
