import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByResetToken, consumeUserResetToken } from "@/lib/auth/users/user";
import { BCRYPT_SALT_ROUNDS } from "@/lib/auth/constants";

import { validPassword, validResetToken } from "@/lib/security/validation";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!validResetToken(token) || !validPassword(password)) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }


    const user = await findUserByResetToken(token);
    if (!user?._id) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    if (!await consumeUserResetToken(token, hashed)) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset password endpoint error:", err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
