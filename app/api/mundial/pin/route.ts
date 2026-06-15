import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getDb } from "@/lib/helpers/mongodb";
import { recordMundialAnalyticsEvent } from "@/lib/mundial/analytics";

export const dynamic = "force-dynamic";

const PINS_COLLECTION = "mundial_pins";
const PEPPER = "quiniela-mundial-2026";

function normalizeName(v: unknown) {
  return String(v ?? "").trim().replace(/\s+/g, " ");
}

function normalizeKey(v: string) {
  return v.trim().toUpperCase();
}

function hashPin(pin: string, key: string) {
  return createHash("sha256").update(`${key}|${pin}|${PEPPER}`).digest("hex");
}

export async function GET(req: NextRequest) {
  const playerName = normalizeName(req.nextUrl.searchParams.get("playerName"));
  if (!playerName) return NextResponse.json({ error: "Nombre requerido." }, { status: 400 });
  try {
    const db = await getDb();
    const doc = await db.collection(PINS_COLLECTION).findOne({ normalizedName: normalizeKey(playerName) });
    return NextResponse.json({ hasPinSet: Boolean(doc?.pinHash) });
  } catch (err) {
    console.error("PIN GET", err);
    return NextResponse.json({ error: "Error al verificar PIN." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const playerName = normalizeName(body.playerName);
    const pin = String(body.pin ?? "").trim();
    const action = String(body.action ?? "");

    if (!playerName) return NextResponse.json({ error: "Nombre requerido." }, { status: 400 });
    if (!/^\d{4}$/.test(pin)) return NextResponse.json({ error: "PIN inválido." }, { status: 400 });
    if (action !== "set" && action !== "verify") return NextResponse.json({ error: "Acción inválida." }, { status: 400 });

    const normalizedName = normalizeKey(playerName);
    const db = await getDb();
    const col = db.collection(PINS_COLLECTION);

    if (action === "set") {
      const existing = await col.findOne({ normalizedName });
      if (existing?.pinHash) return NextResponse.json({ error: "Ya tenés un PIN configurado.", hasPinSet: true }, { status: 409 });
      const now = new Date();
      await col.updateOne(
        { normalizedName },
        {
          $set: { normalizedName, playerName, pinHash: hashPin(pin, normalizedName), updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
      await recordMundialAnalyticsEvent(db, req, {
        event: "login",
        playerName,
        normalizedName,
        happenedAt: now,
        metadata: { loginMethod: "pin_created" },
      });
      return NextResponse.json({ ok: true });
    }

    const doc = await col.findOne({ normalizedName });
    if (!doc?.pinHash) return NextResponse.json({ valid: false, hasPinSet: false });
    const valid = doc.pinHash === hashPin(pin, normalizedName);
    if (valid) {
      await recordMundialAnalyticsEvent(db, req, {
        event: "login",
        playerName,
        normalizedName,
        metadata: { loginMethod: "pin_verified" },
      });
    }
    return NextResponse.json({ valid, hasPinSet: true });
  } catch (err) {
    console.error("PIN POST", err);
    return NextResponse.json({ error: "Error al procesar PIN." }, { status: 500 });
  }
}
