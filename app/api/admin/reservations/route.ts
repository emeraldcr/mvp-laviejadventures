import { NextResponse } from "next/server";
import { getDb } from "@/lib/data/mongodb";
import { COLLECTIONS } from "@/lib/data/collections";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    const requested = Number(new URL(request.url).searchParams.get("page") ?? "1");
    const page = Number.isSafeInteger(requested) && requested > 0 && requested <= 100000 ? requested : 1;
    const db = await getDb();
    const collection = db.collection(COLLECTIONS.RESERVATIONS);
    const [total, docs] = await Promise.all([
      collection.countDocuments(),
      collection.find({}, { projection: { name: 1, email: 1, phone: 1, date: 1, tickets: 1, amount: 1, currency: 1, status: 1, paymentStatus: 1, paymentMethod: 1, tourName: 1, tourPackage: 1, tourTime: 1, referenceCode: 1, orderId: 1, createdAt: 1, specialRequests: 1 } })
        .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    ]);
    const reservations = docs.map((doc) => ({
      id: String(doc._id), name: doc.name ?? null, email: doc.email ?? null, phone: doc.phone ?? null,
      date: doc.date ?? null, tickets: doc.tickets ?? null, amount: doc.amount ?? null, currency: doc.currency ?? null,
      status: doc.status ?? null, paymentStatus: doc.paymentStatus ?? null, paymentMethod: doc.paymentMethod ?? null,
      tourName: doc.tourName ?? null, tourPackage: doc.tourPackage ?? null, tourTime: doc.tourTime ?? null,
      referenceCode: doc.referenceCode ?? doc.orderId ?? null, specialRequests: doc.specialRequests ?? null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt ?? null,
    }));
    return NextResponse.json({ reservations, total, page, pageSize: PAGE_SIZE }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("reservations admin api error", error);
    return NextResponse.json({ error: "Unable to load reservations" }, { status: 500 });
  }
}
