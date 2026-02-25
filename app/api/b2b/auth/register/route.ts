import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findOperatorByEmail, createOperator } from "@/lib/models/operator";
import { signToken, COOKIE_NAME } from "@/lib/b2b-auth";
import { createLogger, maskEmail } from "@/lib/logger";

const logger = createLogger("b2b.auth.register");

export async function POST(req: NextRequest) {
  try {
    const { name, company, email, password } = await req.json();

    if (!name || !company || !email || !password) {
      logger.warn("Registration payload missing required fields");
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      logger.warn("Registration rejected: password too short", { email: maskEmail(email) });
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();
    const existing = await findOperatorByEmail(normalizedEmail);
    if (existing) {
      logger.warn("Registration rejected: email already exists", {
        email: maskEmail(normalizedEmail),
      });
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await createOperator({
      name,
      company,
      email: normalizedEmail,
      password: hashedPassword,
      status: "pending",
      commissionRate: 10,
      createdAt: new Date(),
    });

    const token = signToken({
      id: result.insertedId.toString(),
      email: normalizedEmail,
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

    logger.info("Operator account created", {
      operatorId: result.insertedId.toString(),
      email: maskEmail(normalizedEmail),
      status: "pending",
    });

    return res;
  } catch (err) {
    logger.error("B2B register error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
