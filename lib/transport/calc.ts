import { getDb as getDbHelper } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import referencePoints from "@/lib/transport/reference-points.json";

export type PointRef =
  | { type: "coords"; lat: number; lng: number }
  | { type: "ref"; id: string };

export async function resolvePoint(ref: PointRef) {
  if (ref.type === "coords") return { lat: Number(ref.lat), lng: Number(ref.lng), source: "coords" };

  // lookup by id in a `reference_points` collection (user will seed later)
  try {
    // quick name / ID -> coords map for common labels used in the UI
    const DEFAULT_REFERENCE_COORDS: Record<string, { lat: number; lng: number; name: string }> =
      Object.fromEntries(
        referencePoints.flatMap((point) => [
          [point.id, { lat: point.lat, lng: point.lng, name: point.name }],
          [point.name, { lat: point.lat, lng: point.lng, name: point.name }],
        ]),
      );

    if (ref.id && typeof ref.id === "string") {
      const normalized = ref.id.trim();
      if (DEFAULT_REFERENCE_COORDS[normalized]) {
        const c = DEFAULT_REFERENCE_COORDS[normalized];
        return { lat: c.lat, lng: c.lng, source: "defaults", raw: { id: ref.id, name: c.name } };
      }
    }
    const db = await getDbHelper();
    const coll = db.collection(COLLECTIONS.TOURS); // fallback if custom collection missing

    // try a dedicated collection first
    const refCollNames = ["reference_points", "ReferencePoints", "points", "locations"];
    for (const name of refCollNames) {
      // existence check
      const exists = await db.listCollections({ name }).hasNext();
      if (!exists) continue;
      const doc = await db.collection(name).findOne({
        $or: [
          { id: ref.id },
          { name: ref.id },
        ],
      });
      if (doc && typeof doc.lat === "number" && typeof doc.lng === "number") {
        return { lat: doc.lat, lng: doc.lng, source: name, raw: doc };
      }
    }

    // if not found, try to search in tours collection (some data might live there)
    const maybe = await coll.findOne({ id: ref.id }) || await coll.findOne({ slug: ref.id });
    if (maybe && maybe.locationLat && maybe.locationLng) {
      return { lat: Number(maybe.locationLat), lng: Number(maybe.locationLng), source: COLLECTIONS.TOURS, raw: maybe };
    }

    return null;
  } catch (err) {
    console.error("resolvePoint error:", err);
    return null;
  }
}

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function priceForDistanceUSD(distanceKm: number, opts?: { ratePerKm?: number; minimum?: number }) {
  const rate = opts?.ratePerKm ?? 0.67; // default USD per km, tweakable
  const minimum = opts?.minimum ?? 15; // minimum charge
  const raw = Math.max(minimum, distanceKm * rate);
  return Math.round(raw);
}

export function calculateTransportCost(params: {
  pickupCoords: { lat: number; lng: number } | null;
  dropoffCoords: { lat: number; lng: number } | null;
  transportType: "private" | "shared";
  pax?: number;
}) {
  const { pickupCoords, dropoffCoords, transportType, pax = 1 } = params;

  // Decide which two points to measure between. If both provided, use distance between them.
  // If only pickup provided, treat dropoff as destination (caller should provide destination coords if needed).
  if (!pickupCoords && !dropoffCoords) throw new Error("No coordinates provided");

  const a = pickupCoords ?? dropoffCoords!;
  const b = dropoffCoords ?? pickupCoords!;

  const distanceKm = haversineDistanceKm(a.lat, a.lng, b.lat, b.lng);
  const base = priceForDistanceUSD(distanceKm);

  // Price components: treat pickup and dropoff as separate legs if both provided
  const legs = (pickupCoords && dropoffCoords) ? 1 : 1; // current model: single leg between points

  const total = base * legs;

  if (transportType === "private") {
    return {
      distanceKm: Number(distanceKm.toFixed(2)),
      basePrice: base,
      legs,
      total,
      perPerson: Math.round(total / Math.max(1, pax)),
      type: "private",
    };
  }

  // shared
  const perPersonShared = Math.round(total / Math.max(1, pax));
  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    basePrice: base,
    legs,
    total,
    perPerson: perPersonShared,
    type: "shared",
  };
}

const transportCalc = {};

export default transportCalc;
