import { NextRequest, NextResponse } from "next/server";
import { createLogger, maskEmail } from "@/lib/logger";

const logger = createLogger("auth0.recover-password");

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      logger.warn("Missing or invalid email in request body");
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const connection = process.env.AUTH0_DB_CONNECTION ?? "Username-Password-Authentication";

    if (!domain || !clientId) {
      logger.error("Auth0 password recovery configuration missing", {
        hasDomain: Boolean(domain),
        hasClientId: Boolean(clientId),
      });
      return NextResponse.json(
        { error: "Auth0 password recovery is not configured." },
        { status: 500 }
      );
    }

    const auth0Response = await fetch(`https://${domain}/dbconnections/change_password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        email,
        connection,
      }),
    });

    if (!auth0Response.ok) {
      const details = await auth0Response.text();
      logger.error("Auth0 password recovery API error", {
        status: auth0Response.status,
        email: maskEmail(email),
        details,
      });
      return NextResponse.json(
        { error: "Could not trigger password recovery email." },
        { status: auth0Response.status }
      );
    }

    logger.info("Password recovery email dispatched", { email: maskEmail(email) });

    return NextResponse.json({ message: "Password recovery email sent." });
  } catch (error) {
    logger.error("Unexpected recover-password error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Unexpected error while requesting password recovery." },
      { status: 500 }
    );
  }
}
