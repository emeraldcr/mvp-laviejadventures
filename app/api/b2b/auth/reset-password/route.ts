import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findOperatorByResetToken, updateOperator, clearResetToken } from "@/lib/models/operator";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const operator = await findOperatorByResetToken(token);
    if (!operator) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const id = operator._id!.toString();

    await updateOperator(id, { password: hashed });
    await clearResetToken(id);

    return NextResponse.json({ message: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("B2B reset-password error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
