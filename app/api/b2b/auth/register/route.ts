import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  findOperatorByEmail,
  createOperator,
  getDefaultGuideProfile,
  setVerificationToken,
  type AccountType,
} from "@/lib/models/operator";
import { sendVerificationEmail } from "@/lib/email/b2b-emails";
import {
  BCRYPT_SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  VERIFICATION_TOKEN_EXPIRY_MS,
} from "@/lib/constants/auth";
import { DEFAULT_COMMISSION_RATE } from "@/lib/constants/business";

export async function POST(req: NextRequest) {
  try {
    const { name, company, email, password, accountType } = await req.json();
    const normalizedAccountType: AccountType = accountType === "guide" ? "guide" : "operator";
    const normalizedCompany =
      normalizedAccountType === "guide"
        ? company?.trim() || "Guía independiente"
        : company?.trim();

    if (!name || !email || !password || !normalizedCompany) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await findOperatorByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);

    const result = await createOperator({
      name: name.trim(),
      company: normalizedCompany,
      email: email.toLowerCase(),
      password: hashedPassword,
      status: "pending",
      commissionRate: DEFAULT_COMMISSION_RATE,
      createdAt: new Date(),
      accountType: normalizedAccountType,
      guideProfile: normalizedAccountType === "guide" ? getDefaultGuideProfile(name.trim()) : undefined,
      emailVerified: false,
      verificationToken,
      verificationExpiry,
      notificationPreferences: {
        bookingCreated: true,
        bookingReminder24h: true,
        bookingStatusChanges: true,
        weeklyPerformanceDigest: true,
        partnerNetworkUpdates: true,
      },
    });

    await setVerificationToken(result.insertedId.toString(), verificationToken, verificationExpiry);

    sendVerificationEmail(email.toLowerCase(), name, verificationToken).catch(console.error);

    return NextResponse.json(
      {
        message: "Account created. Please check your email to verify your account.",
        status: "pending",
        accountType: normalizedAccountType,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("B2B register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
