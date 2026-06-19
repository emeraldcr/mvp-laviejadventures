import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";

export const dynamic = "force-dynamic";

const PROFILES_COLLECTION = "mundial_player_profiles";

type ProfileDoc = {
  normalizedName: string;
  playerName: string;
  email: string;
  phone: string;
  avatarDataUrl: string | null;
  updatedAt: Date;
};

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const db = await getDb();
  const doc = await db
    .collection<ProfileDoc>(PROFILES_COLLECTION)
    .findOne({ normalizedName: name });

  return NextResponse.json({
    email: doc?.email ?? "",
    phone: doc?.phone ?? "",
    avatarDataUrl: doc?.avatarDataUrl ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as {
    normalizedName?: string;
    playerName?: string;
    email?: string;
    phone?: string;
    avatarDataUrl?: string | null;
  };

  const { normalizedName, playerName, email = "", phone = "" } = body;
  const avatarDataUrl = body.avatarDataUrl;

  if (!normalizedName || !playerName) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (typeof avatarDataUrl === "string" && avatarDataUrl.length > 350_000) {
    return NextResponse.json({ error: "Imagen demasiado grande" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection<ProfileDoc>(PROFILES_COLLECTION).updateOne(
    { normalizedName },
    {
      $set: {
        normalizedName,
        playerName,
        email,
        phone,
        ...(avatarDataUrl !== undefined && { avatarDataUrl }),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
