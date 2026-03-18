import { NextRequest, NextResponse } from "next/server";
import { listOperators, serializeGuideProfile } from "@/lib/models/operator";
import { getAdminFromRequest } from "@/lib/admin-auth";

function isAuthorized(req: NextRequest): boolean {
  return Boolean(getAdminFromRequest(req));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const operators = await listOperators();
    return NextResponse.json({
      operators: operators.map((operator) => ({
        ...operator,
        accountType: operator.accountType || "operator",
        guideProfile: serializeGuideProfile(operator.guideProfile),
      })),
    });
  } catch (err) {
    console.error("Admin list operators error:", err);
    return NextResponse.json({ error: "Failed to fetch operators." }, { status: 500 });
  }
}
