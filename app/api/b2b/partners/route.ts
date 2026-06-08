import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getOperatorsCollection } from "@/lib/models/operator";
import {
  getB2BPartnerTypeLabel,
  isAccommodationPartnerType,
  normalizeB2BPartnerType,
} from "@/lib/b2b-partners";

export async function GET() {
  try {
    const col = await getOperatorsCollection();
    const partners = await col
      .find(
        { status: { $in: ["approved", "active"] } },
        {
          projection: {
            password: 0,
            email: 0,
            verificationToken: 0,
            verificationExpiry: 0,
            resetToken: 0,
            resetExpiry: 0,
            notificationPreferences: 0,
          },
        },
      )
      .sort({ company: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      partners: partners.map((partner) => {
        const partnerType = normalizeB2BPartnerType(partner.partnerType);

        return {
          id: partner._id instanceof ObjectId ? partner._id.toString() : String(partner._id ?? ""),
          name: partner.name,
          company: partner.company,
          partnerType,
          partnerTypeLabelEs: getB2BPartnerTypeLabel(partnerType, "es"),
          partnerTypeLabelEn: getB2BPartnerTypeLabel(partnerType, "en"),
          category: isAccommodationPartnerType(partnerType) ? "accommodation" : partnerType,
        };
      }),
    });
  } catch (error) {
    console.error("B2B public partners error:", error);
    return NextResponse.json({ partners: [] }, { status: 500 });
  }
}
