import { createHash, randomBytes } from "node:crypto";
import type { Db } from "mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import type { OrderDetails } from "@/lib/types/index";

const DRAFT_TTL_DAYS = 7;

export type ReservationDraft = Omit<OrderDetails, "resumeToken"> & {
  resumeToken?: string;
};

type StoredReservationDraft = {
  tokenHash: string;
  bookingAttemptId: string;
  orderDetails: Omit<ReservationDraft, "resumeToken">;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  status: "open" | "completed";
};

export function createResumeToken() {
  return randomBytes(32).toString("base64url");
}

function hashResumeToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function saveReservationDraft(
  db: Db,
  orderDetails: ReservationDraft,
  token?: string,
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000);
  const suppliedToken = token?.trim();
  const resumeToken = suppliedToken && /^[A-Za-z0-9_-]{40,64}$/.test(suppliedToken)
    ? suppliedToken
    : createResumeToken();
  const tokenHash = hashResumeToken(resumeToken);
  const storedOrderDetails = { ...orderDetails };
  delete storedOrderDetails.resumeToken;

  await db.collection<StoredReservationDraft>(COLLECTIONS.RESERVATION_DRAFTS).updateOne(
    { tokenHash },
    {
      $set: {
        bookingAttemptId: storedOrderDetails.bookingAttemptId,
        orderDetails: storedOrderDetails,
        updatedAt: now,
        expiresAt,
        status: "open",
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  return { resumeToken, expiresAt };
}

export async function findReservationDraft(db: Db, token: string) {
  const normalizedToken = token.trim();
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(normalizedToken)) return null;

  const draft = await db.collection<StoredReservationDraft>(COLLECTIONS.RESERVATION_DRAFTS).findOne({
    tokenHash: hashResumeToken(normalizedToken),
    status: "open",
    expiresAt: { $gt: new Date() },
  });

  return draft ? { ...draft.orderDetails, resumeToken: normalizedToken } : null;
}
