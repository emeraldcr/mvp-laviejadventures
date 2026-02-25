import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findOperatorByEmail } from "@/lib/models/operator";
import { signToken, COOKIE_NAME } from "@/lib/b2b-auth";
import { createLogger, maskEmail } from "@/lib/logger";

const logger = createLogger("b2b.auth.login");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      logger.warn("Missing credentials in login request");
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase();
    const operator = await findOperatorByEmail(normalizedEmail);
    if (!operator) {
      logger.warn("Login rejected: operator not found", { email: maskEmail(normalizedEmail) });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, operator.password);
    if (!valid) {
      logger.warn("Login rejected: invalid password", {
        operatorId: operator._id?.toString(),
        email: maskEmail(normalizedEmail),
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signToken({
      id: operator._id!.toString(),
      email: operator.email,
      name: operator.name,
      company: operator.company,
      commissionRate: operator.commissionRate,
      status: operator.status,
    });

    const res = NextResponse.json({
      message: "Login successful.",
      operator: {
        id: operator._id!.toString(),
        name: operator.name,
        company: operator.company,
        email: operator.email,
        status: operator.status,
        commissionRate: operator.commissionRate,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    logger.info("Operator login successful", {
      operatorId: operator._id!.toString(),
      email: maskEmail(operator.email),
      status: operator.status,
    });

    return res;
  } catch (err) {
    logger.error("B2B login error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
