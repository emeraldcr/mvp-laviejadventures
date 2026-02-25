import { NextRequest, NextResponse } from "next/server";
import { listOperators } from "@/lib/models/operator";
import { createLogger } from "@/lib/logger";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-secret-change-in-production";
const logger = createLogger("b2b.admin.operators");

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    logger.warn("Unauthorized operator list request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const operators = await listOperators();
    logger.info("Operator list fetched", { count: operators.length });
    return NextResponse.json({ operators });
  } catch (err) {
    logger.error("Admin list operators error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to fetch operators." }, { status: 500 });
  }
}
