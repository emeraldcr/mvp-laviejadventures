import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findAdminByUsername } from "@/lib/models/admin";
import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const admin = await findAdminByUsername(username);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = signAdminToken({
      id: admin._id!.toString(),
      username: admin.username,
    });

    const response = NextResponse.json({
      message: "Login successful.",
      admin: { username: admin.username },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
