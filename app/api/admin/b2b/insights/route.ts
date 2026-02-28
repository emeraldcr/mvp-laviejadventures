import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { listOperators } from "@/lib/models/operator";
import { listUsers } from "@/lib/models/user";
import { listLoginLogs } from "@/lib/models/login-log";

function isAuthorized(req: NextRequest): boolean {
  return Boolean(getAdminFromRequest(req));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [operators, users, loginLogs] = await Promise.all([
      listOperators(),
      listUsers(),
      listLoginLogs(),
    ]);

    return NextResponse.json({ operators, users, loginLogs });
  } catch (error) {
    console.error("Admin insights error", error);
    return NextResponse.json({ error: "Failed to load admin insights." }, { status: 500 });
  }
}
