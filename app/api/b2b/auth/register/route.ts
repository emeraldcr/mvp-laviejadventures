import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findOperatorByEmail, createOperator, setVerificationToken } from "@/lib/models/operator";
import { sendVerificationEmail } from "@/lib/email/b2b-emails";

export async function POST(req: NextRequest) {
  try {
    const { name, company, email, password } = await req.json();

    if (!name || !company || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await findOperatorByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const result = await createOperator({
      name,
      company,
      email: email.toLowerCase(),
      password: hashedPassword,
      status: "pending",
      commissionRate: 10,
      createdAt: new Date(),
      emailVerified: false,
      verificationToken,
      verificationExpiry,
    });

    await setVerificationToken(result.insertedId.toString(), verificationToken, verificationExpiry);

    // Fire-and-forget — don't block the response
    sendVerificationEmail(email.toLowerCase(), name, verificationToken).catch(console.error);

    return NextResponse.json(
      { message: "Account created. Please check your email to verify your account.", status: "pending" },
      { status: 201 }
    );
  } catch (err) {
    console.error("B2B register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
