import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { findUserByEmail, setUserResetToken } from "@/lib/auth/users/user";
import { sendUserPasswordResetEmail } from "@/lib/email/user-emails";

import { validEmail } from "@/lib/security/validation";
import { allowRequest } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!validEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const permitted = await allowRequest(`recovery:${normalizedEmail}`, 3, 3_600_000);
    const user = permitted ? await findUserByEmail(normalizedEmail) : null;

    if (user?._id && user.passwordHash) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 1000 * 60 * 60);

      await setUserResetToken(user._id.toString(), token, expiry);
      await sendUserPasswordResetEmail(normalizedEmail, user.name, token).catch(() => {
        console.error("Password recovery delivery failed");
      });
    }

    return NextResponse.json({
      message: "If an account exists for that email, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Recover password endpoint error:", error);
    return NextResponse.json(
      { error: "Unexpected error while requesting password recovery." },
      { status: 500 }
    );
  }
}
