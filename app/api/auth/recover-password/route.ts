import { NextRequest, NextResponse } from "next/server";
import { getAuth0PasswordResetUrl } from "@/lib/auth0-config";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const passwordResetUrl = getAuth0PasswordResetUrl();
    const clientId = process.env.AUTH0_CLIENT_ID;
    const connection = process.env.AUTH0_DB_CONNECTION ?? "Username-Password-Authentication";

    if (!passwordResetUrl || !clientId) {
      return NextResponse.json(
        { error: "Auth0 password recovery is not configured." },
        { status: 500 }
      );
    }

    const auth0Response = await fetch(passwordResetUrl, {
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
      console.error("Auth0 password recovery error:", details);
      return NextResponse.json(
        { error: "Could not trigger password recovery email." },
        { status: auth0Response.status }
      );
    }

    return NextResponse.json({ message: "Password recovery email sent." });
  } catch (error) {
    console.error("Recover password endpoint error:", error);
    return NextResponse.json(
      { error: "Unexpected error while requesting password recovery." },
      { status: 500 }
    );
  }
}
