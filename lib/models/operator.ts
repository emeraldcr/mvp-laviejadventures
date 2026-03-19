import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";

export type AccountType = "operator" | "guide";

export interface GuideCertification {
  id: string;
  title: string;
  issuer: string;
  status: "vigente" | "por_vencer" | "vencida" | "en_progreso";
  completedAt: Date;
  expiresAt?: Date | null;
  required: boolean;
}

export interface GuideTrainingRecord {
  id: string;
  type: "capacitacion" | "simulacro" | "taller";
  title: string;
  completedAt: Date;
  notes: string;
  issuer?: string;
}

export interface OperatorAccount {
  _id?: ObjectId;
  name: string;
  company: string;
  email: string;
  password: string;
  status: "pending" | "approved" | "active";
  commissionRate: number;
  createdAt: Date;
  accountType?: AccountType;
  guideProfile?: {
    bio?: string;
    certifications: GuideCertification[];
    trainingRecords: GuideTrainingRecord[];
  };
  // Email verification
  emailVerified: boolean;
  verificationToken?: string | null;
  verificationExpiry?: Date | null;
  // Password reset
  resetToken?: string | null;
  resetExpiry?: Date | null;
  notificationPreferences?: {
    bookingCreated: boolean;
    bookingReminder24h: boolean;
    bookingStatusChanges: boolean;
    weeklyPerformanceDigest: boolean;
    partnerNetworkUpdates: boolean;
  };
}

export type SerializedGuideCertification = Omit<GuideCertification, "completedAt" | "expiresAt"> & {
  completedAt: string;
  expiresAt?: string | null;
};

export type SerializedGuideTrainingRecord = Omit<GuideTrainingRecord, "completedAt"> & {
  completedAt: string;
};

export function getDefaultGuideProfile(name: string) {
  const today = new Date();
  const plusMonths = (months: number) => new Date(today.getFullYear(), today.getMonth() + months, today.getDate());

  return {
    bio: `Guía registrado en La Vieja Adventures: ${name}.`,
    certifications: [
      {
        id: "first-aid",
        title: "Primeros Auxilios Básico",
        issuer: "Cruz Roja Costarricense",
        status: "vigente" as const,
        completedAt: new Date(today.getFullYear(), today.getMonth() - 2, 15),
        expiresAt: plusMonths(22),
        required: true,
      },
      {
        id: "cpr-aed",
        title: "RCP y DEA",
        issuer: "American Heart Association",
        status: "vigente" as const,
        completedAt: new Date(today.getFullYear(), today.getMonth() - 1, 10),
        expiresAt: plusMonths(23),
        required: true,
      },
      {
        id: "ict-guide",
        title: "Guía de Turismo de Aventura",
        issuer: "ICT — Instituto Costarricense de Turismo",
        status: "por_vencer" as const,
        completedAt: new Date(today.getFullYear() - 1, today.getMonth(), 20),
        expiresAt: plusMonths(3),
        required: true,
      },
    ],
    trainingRecords: [
      {
        id: "training-log",
        type: "capacitacion" as const,
        title: "Registro de Capacitaciones",
        completedAt: new Date(today.getFullYear(), today.getMonth() - 1, 5),
        issuer: "La Vieja Adventures",
        notes:
          "Cada capacitación, simulacro y taller queda documentado en el expediente individual de cada guía. Este registro está disponible para auditorías del ICT y es requerido para renovaciones de licencia.",
      },
      {
        id: "canyon-drill",
        type: "simulacro" as const,
        title: "Simulacro de rescate en cañón",
        completedAt: new Date(today.getFullYear(), today.getMonth() - 2, 8),
        issuer: "Operaciones LVA",
        notes: "Práctica trimestral de rescate vertical, evacuación y comunicación de incidentes.",
      },
      {
        id: "customer-workshop",
        type: "taller" as const,
        title: "Taller de atención al cliente",
        completedAt: new Date(today.getFullYear(), today.getMonth() - 3, 12),
        issuer: "Experiencia LVA",
        notes: "Refuerzo de manejo de grupos, servicio bilingüe y protocolos de hospitalidad.",
      },
    ],
  };
}

export function serializeGuideProfile(profile?: OperatorAccount["guideProfile"]) {
  if (!profile) return null;

  return {
    bio: profile.bio || "",
    certifications: (profile.certifications || []).map((cert) => ({
      ...cert,
      completedAt: cert.completedAt.toISOString(),
      expiresAt: cert.expiresAt ? cert.expiresAt.toISOString() : null,
    })),
    trainingRecords: (profile.trainingRecords || []).map((record) => ({
      ...record,
      completedAt: record.completedAt.toISOString(),
    })),
  };
}

export async function getOperatorsCollection() {
  const db = await getDb();
  return db.collection<OperatorAccount>(COLLECTIONS.OPERATORS);
}

export async function findOperatorByEmail(email: string) {
  const col = await getOperatorsCollection();
  return col.findOne({ email: email.toLowerCase() });
}

export async function findOperatorById(id: string) {
  const col = await getOperatorsCollection();
  return col.findOne({ _id: new ObjectId(id) });
}

export async function findOperatorByVerificationToken(token: string) {
  const col = await getOperatorsCollection();
  return col.findOne({ verificationToken: token, verificationExpiry: { $gt: new Date() } });
}

export async function findOperatorByResetToken(token: string) {
  const col = await getOperatorsCollection();
  return col.findOne({ resetToken: token, resetExpiry: { $gt: new Date() } });
}

export async function createOperator(data: Omit<OperatorAccount, "_id">) {
  const col = await getOperatorsCollection();
  const result = await col.insertOne(data);
  return result;
}

export async function updateOperator(id: string, update: Partial<OperatorAccount>) {
  const col = await getOperatorsCollection();
  return col.updateOne({ _id: new ObjectId(id) }, { $set: update });
}

export async function verifyOperatorEmail(id: string) {
  const col = await getOperatorsCollection();
  return col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { emailVerified: true, verificationToken: null, verificationExpiry: null } }
  );
}

export async function setVerificationToken(id: string, token: string, expiry: Date) {
  const col = await getOperatorsCollection();
  return col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { verificationToken: token, verificationExpiry: expiry } }
  );
}

export async function setResetToken(id: string, token: string, expiry: Date) {
  const col = await getOperatorsCollection();
  return col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { resetToken: token, resetExpiry: expiry } }
  );
}

export async function clearResetToken(id: string) {
  const col = await getOperatorsCollection();
  return col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { resetToken: null, resetExpiry: null } }
  );
}

export async function listOperators() {
  const col = await getOperatorsCollection();
  return col.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
}
