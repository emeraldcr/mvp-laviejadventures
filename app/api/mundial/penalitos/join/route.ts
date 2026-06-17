// app/api/mundial/penalitos/join/route.ts
// POST { visitorId, name, role } — join the queue or take an open spot directly.
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import {
  ensureState,
  startGame,
  PENALITOS_COLLECTION,
  PENALITOS_STATE_ID,
  MAX_QUEUE,
  type PenalitosRoleKey,
  type PenalitosPlayerDoc,
} from "@/lib/mundial/penalitos";

export const dynamic = "force-dynamic";

const MAX_NAME = 30;
const CHOOSE_TIMEOUT_MS = 10_000;

function newGameId() {
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, name, role } = body as {
      visitorId?: unknown;
      name?: unknown;
      role?: unknown;
    };

    if (typeof visitorId !== "string" || visitorId.length < 4 || visitorId.length > 64) {
      return NextResponse.json({ error: "visitorId inválido" }, { status: 400 });
    }
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "nombre requerido" }, { status: 400 });
    }
    if (role !== "goalkeeper" && role !== "shooter") {
      return NextResponse.json({ error: "role inválido" }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, MAX_NAME);
    const db = await getDb();
    const state = await ensureState(db);
    const now = new Date();

    const alreadyInGame =
      state.game?.goalkeeper?.visitorId === visitorId ||
      state.game?.shooter?.visitorId === visitorId;
    const alreadyInQueue = state.queue.some((e) => e.visitorId === visitorId);

    if (alreadyInGame || alreadyInQueue) {
      return NextResponse.json({ ok: true, status: "already_joined" });
    }

    const me: PenalitosPlayerDoc = { visitorId, name: cleanName };
    const game = state.game;

    // Case 1: No game yet — create one with this player in their slot
    if (!game) {
      const newGame = {
        id: newGameId(),
        status: "waiting" as const,
        goalkeeper: role === "goalkeeper" ? me : null,
        shooter: role === "shooter" ? me : null,
        goalkeeperChoice: null,
        shooterChoice: null,
        winner: null,
        outcome: null,
        chooseDeadline: null,
        resolvedAt: null,
        finishedUntil: null,
        roundNumber: 1,
        startedAt: now,
      };

      await db.collection(PENALITOS_COLLECTION).updateOne(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _id: PENALITOS_STATE_ID, game: null } as any,
        { $set: { game: newGame, updatedAt: now } }
      );
      return NextResponse.json({ ok: true, status: "joined_game", role });
    }

    // Case 2: Game is waiting and the requested slot is open
    if (game.status === "waiting") {
      const needsGoalkeeper = !game.goalkeeper && role === "goalkeeper";
      const needsShooter = !game.shooter && role === "shooter";

      if (needsGoalkeeper || needsShooter) {
        const goalkeeper = needsGoalkeeper ? me : game.goalkeeper;
        const shooter = needsShooter ? me : game.shooter;
        const bothReady = !!goalkeeper && !!shooter;

        await db.collection(PENALITOS_COLLECTION).updateOne(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { _id: PENALITOS_STATE_ID as any, "game.status": "waiting" },
          {
            $set: {
              "game.goalkeeper": goalkeeper,
              "game.shooter": shooter,
              "game.status": bothReady ? "choosing" : "waiting",
              "game.chooseDeadline": bothReady
                ? new Date(now.getTime() + CHOOSE_TIMEOUT_MS)
                : null,
              "game.startedAt": bothReady ? now : game.startedAt,
              updatedAt: now,
            },
          }
        );
        return NextResponse.json({ ok: true, status: "joined_game", role });
      }
    }

    // Case 3: Enqueue
    if (state.queue.length >= MAX_QUEUE) {
      return NextResponse.json(
        { error: "Cola llena, intenta más tarde" },
        { status: 429 }
      );
    }

    await db.collection(PENALITOS_COLLECTION).updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: PENALITOS_STATE_ID } as any,
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $push: {
          queue: {
            visitorId,
            name: cleanName,
            preferredRole: role as PenalitosRoleKey,
            joinedAt: now,
          },
        } as any,
        $set: { updatedAt: now },
      }
    );

    const queuePos = (await db.collection(PENALITOS_COLLECTION)
      .findOne({ _id: PENALITOS_STATE_ID } as any))
      ?.queue?.findIndex((e: { visitorId: string }) => e.visitorId === visitorId) ?? -1;

    return NextResponse.json({ ok: true, status: "queued", position: queuePos + 1 });
  } catch (err) {
    console.error("penalitos/join error", err);
    return NextResponse.json({ error: "Error al unirse" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { visitorId } = await req.json() as { visitorId?: string };
    if (!visitorId) return NextResponse.json({ error: "visitorId requerido" }, { status: 400 });

    const db = await getDb();
    const now = new Date();

    await db.collection(PENALITOS_COLLECTION).updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: PENALITOS_STATE_ID } as any,
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $pull: { queue: { visitorId } } as any,
        $set: { updatedAt: now },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("penalitos/join DELETE error", err);
    return NextResponse.json({ error: "Error al salir de la cola" }, { status: 500 });
  }
}
