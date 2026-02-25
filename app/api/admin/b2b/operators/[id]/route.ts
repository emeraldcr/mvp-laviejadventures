import { NextRequest, NextResponse } from "next/server";
import { updateOperator, findOperatorById } from "@/lib/models/operator";
import { createLogger } from "@/lib/logger";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-secret-change-in-production";
const logger = createLogger("b2b.admin.operators.update");

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === ADMIN_SECRET;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    logger.warn("Unauthorized operator update request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await findOperatorById(id);
    if (!existing) {
      logger.warn("Operator update failed: operator not found", { operatorId: id });
      return NextResponse.json({ error: "Operator not found." }, { status: 404 });
    }

    const body = await req.json();
    const allowed = ["status", "commissionRate", "name", "company"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    await updateOperator(id, update);

    logger.info("Operator updated successfully", {
      operatorId: id,
      fields: Object.keys(update),
    });

    return NextResponse.json({ message: "Operator updated successfully." });
  } catch (err) {
    logger.error("Admin update operator error", {
      operatorId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to update operator." }, { status: 500 });
  }
}
