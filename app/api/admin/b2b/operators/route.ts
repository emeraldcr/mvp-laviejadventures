import { NextRequest, NextResponse } from "next/server";
import { listOperators } from "@/lib/models/operator";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-secret-change-in-production";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const operators = await listOperators();
    return NextResponse.json({ operators });
  } catch (err) {
    console.error("Admin list operators error:", err);
    return NextResponse.json({ error: "Failed to fetch operators." }, { status: 500 });
  }
}
