// POST  → admin opens a new betting round for the current live match
// DELETE → admin force-resolves the current round
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import { ensureState, forceResolve, getState, openRound } from "@/lib/mundial/scorer";
import { notifyScorerChanged } from "@/lib/mundial/scorer-events";

export const dynamic = "force-dynamic";

const MATCHES_COLLECTION = "mundial_matches";

type RosterPlayer = {
  name?: string;
  pos?: string;
  position?: string;
  squadNumber?: number | null;
};

type MatchDoc = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeRoster?: RosterPlayer[];
  awayRoster?: RosterPlayer[];
};

export async function POST(_req: NextRequest) {
  try {
    const db = await getDb();
    await ensureState(db);

    const match = await db.collection<MatchDoc>(MATCHES_COLLECTION).findOne(
      { liveStatus: { $in: ["live", "halftime"] } },
      {
        projection: {
          _id: 0,
          id: 1,
          homeTeam: 1,
          awayTeam: 1,
          homeRoster: 1,
          awayRoster: 1,
        },
      }
    );

    if (!match) {
      return NextResponse.json({ error: "No hay partido en vivo" }, { status: 404 });
    }

    const mapPlayers = (
      roster: RosterPlayer[] | undefined,
      team: "home" | "away"
    ) =>
      (roster ?? [])
        .filter((p) => p.name?.trim())
        .slice(0, 11)
        .map((p) => ({
          name: (p.name ?? "").trim(),
          team,
          position: p.pos ?? p.position ?? "",
          squadNumber: typeof p.squadNumber === "number" ? p.squadNumber : null,
        }));

    const players = [
      ...mapPlayers(match.homeRoster, "home"),
      ...mapPlayers(match.awayRoster, "away"),
    ];

    if (players.length === 0) {
      return NextResponse.json(
        { error: "El partido no tiene jugadores en el roster. Agrégalos primero desde el admin." },
        { status: 422 }
      );
    }

    const state = await getState(db);
    const roundNumber = (state?.totalRounds ?? 0) + 1;

    await openRound(db, match.id, match.homeTeam, match.awayTeam, players, roundNumber);
    notifyScorerChanged();

    return NextResponse.json({ ok: true, roundNumber, playerCount: players.length });
  } catch (err) {
    console.error("[scorer/round] POST error", err);
    return NextResponse.json({ error: "Error abriendo ronda" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const actualScorer =
      typeof body.actualScorer === "string" && body.actualScorer.trim().length > 0
        ? body.actualScorer.trim()
        : "nadie";

    const db = await getDb();
    const result = await forceResolve(db, actualScorer);

    if (result === "no_round") {
      return NextResponse.json({ error: "No hay ronda activa" }, { status: 404 });
    }

    notifyScorerChanged();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[scorer/round] DELETE error", err);
    return NextResponse.json({ error: "Error resolviendo ronda" }, { status: 500 });
  }
}
