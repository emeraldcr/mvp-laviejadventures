import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findOperatorByEmail, createOperator } from "@/lib/models/operator";
import { signToken, COOKIE_NAME } from "@/lib/b2b-auth";

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

    const result = await createOperator({
      name,
      company,
      email: email.toLowerCase(),
      password: hashedPassword,
      status: "pending",
      commissionRate: 10,
      createdAt: new Date(),
    });

    const token = signToken({
      id: result.insertedId.toString(),
      email: email.toLowerCase(),
      name,
      company,
      commissionRate: 10,
      status: "pending",
    });

    const res = NextResponse.json(
      { message: "Account created. Awaiting admin approval.", status: "pending" },
      { status: 201 }
    );
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("B2B register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
