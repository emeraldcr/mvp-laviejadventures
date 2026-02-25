import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type BookingState = {
  date: string | null;
  tourTime: "08:00" | "09:00" | "10:00" | null;
  tourPackage: "basic" | "full-day" | "private" | null;
  tickets: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  specialRequests: string | null;
};

type AssistantPayload = {
  messages: ChatMessage[];
  state: BookingState;
};

type AssistantResult = {
  reply: string;
  updatedState: BookingState;
  missingFields: string[];
  readyToBook: boolean;
};

const REQUIRED_FIELDS: (keyof BookingState)[] = [
  "date",
  "tourTime",
  "tourPackage",
  "tickets",
  "name",
  "email",
  "phone",
];

const DEFAULT_RESULT: AssistantResult = {
  reply:
    "¡Pura vida! Te ayudo con la reserva. Para empezar, decime fecha, hora (08:00/09:00/10:00), paquete (basic/full-day/private), cantidad de personas, nombre, correo y teléfono.",
  updatedState: {
    date: null,
    tourTime: null,
    tourPackage: null,
    tickets: null,
    name: null,
    email: null,
    phone: null,
    specialRequests: null,
  },
  missingFields: REQUIRED_FIELDS,
  readyToBook: false,
};

const DATE_PATTERN_ISO = /\b(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/;
const DATE_PATTERN_DMY = /\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})\b/;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /\+?[\d\s()\-]{8,}/;
const NAME_PATTERN = /(?:me\s+llamo|mi\s+nombre\s+es|soy)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){0,3})/i;
const TICKETS_PATTERN = /(?:somos|vamos|personas?|tickets?|boletos?|cupos?)\s*[:=]?\s*(\d{1,2})/i;

const FAQ_ENTRIES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["donde", "ubicacion", "llegar", "dirección", "direccion"],
    answer:
      "Estamos en La Vieja Adventures Canyon Tour, en Sucre de Ciudad Quesada, Costa Rica. Si querés te comparto también una guía rápida para llegar.",
  },
  {
    keywords: ["que llevar", "ropa", "zapatos", "recomend"],
    answer:
      "Te recomendamos ropa cómoda para mojar, zapatos cerrados con buen agarre, bloqueador, cambio de ropa y una toalla.",
  },
  {
    keywords: ["duracion", "cuanto dura", "horas"],
    answer: "La experiencia del canyon tour normalmente dura entre 3 y 4 horas.",
  },
  {
    keywords: ["incluye", "incluido"],
    answer:
      "Incluye entrada, guía bilingüe y equipo de seguridad. No incluye transporte ni alimentación/bebidas.",
  },
  {
    keywords: ["reembolso", "cancel", "devol"],
    answer:
      "Hay reembolso completo con al menos 48 horas de anticipación a la fecha reservada.",
  },
];

function buildSystemPrompt(state: BookingState) {
  return `Sos un asistente de reservas para La Vieja Adventures Canyon Tour en Sucre de Ciudad Quesada, Costa Rica.

Objetivo:
1) Ayudar al usuario a completar su reserva paso a paso.
2) Extraer datos aunque el usuario mande varios en un solo mensaje.
3) Responder preguntas frecuentes (ubicación, qué llevar, duración, políticas, horarios, etc.) sin perder el contexto de reserva.

Reglas de negocio:
- Horas válidas: 08:00, 09:00, 10:00.
- Paquetes válidos: basic, full-day, private.
- Campos requeridos para confirmar: date, tourTime, tourPackage, tickets, name, email, phone.
- Campo opcional: specialRequests.

Información de apoyo (FAQ):
- Ubicación: Sucre de Ciudad Quesada, Costa Rica.
- Operador: La Vieja Adventures Canyon Tour.
- Duración aproximada: 3-4 horas.
- Incluye entrada, guía bilingüe y equipo de seguridad.
- No incluye transporte ni alimentación/bebidas.
- Reembolso completo con al menos 48 horas de anticipación.

Estado actual de reserva (JSON):
${JSON.stringify(state)}

Instrucciones de respuesta:
- Respondé SIEMPRE en español.
- Tono: cálido, profesional, directo.
- Si faltan datos, pedí solo los más relevantes para el siguiente paso.
- Si el usuario pregunta algo FAQ, respondé claramente y luego guiá al siguiente dato faltante.
- Si date viene en lenguaje natural (ej: "mañana"), convertí a formato YYYY-MM-DD cuando sea posible.
- Si tickets no es número válido, pedí aclaración.

IMPORTANTE: devolvé SOLO JSON válido con esta forma exacta:
{
  "reply": "texto corto para el usuario",
  "updatedState": {
    "date": "YYYY-MM-DD o null",
    "tourTime": "08:00 | 09:00 | 10:00 | null",
    "tourPackage": "basic | full-day | private | null",
    "tickets": "number o null",
    "name": "string o null",
    "email": "string o null",
    "phone": "string o null",
    "specialRequests": "string o null"
  },
  "missingFields": ["date", "tourTime", "tourPackage", "tickets", "name", "email", "phone"],
  "readyToBook": true o false
}`;
}

function sanitizeResult(raw: Partial<AssistantResult>, fallbackState: BookingState): AssistantResult {
  const tickets = typeof raw.updatedState?.tickets === "number" ? raw.updatedState.tickets : fallbackState.tickets;

  const updatedState = normalizeState({
    date: raw.updatedState?.date ?? fallbackState.date,
    tourTime: raw.updatedState?.tourTime ?? fallbackState.tourTime,
    tourPackage: raw.updatedState?.tourPackage ?? fallbackState.tourPackage,
    tickets,
    name: raw.updatedState?.name ?? fallbackState.name,
    email: raw.updatedState?.email ?? fallbackState.email,
    phone: raw.updatedState?.phone ?? fallbackState.phone,
    specialRequests: raw.updatedState?.specialRequests ?? fallbackState.specialRequests,
  });

  const missingFields = REQUIRED_FIELDS.filter((field) => !updatedState[field]);

  return {
    reply: raw.reply?.trim() || DEFAULT_RESULT.reply,
    updatedState,
    missingFields,
    readyToBook: missingFields.length === 0,
  };
}

function parseJsonFromText(text: string): Partial<AssistantResult> | null {
  try {
    return JSON.parse(text) as Partial<AssistantResult>;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      try {
        return JSON.parse(slice) as Partial<AssistantResult>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function extractDate(raw: string): string | null {
  const text = normalizeText(raw);
  const now = new Date();

  if (text.includes("pasado manana")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return formatDate(d);
  }

  if (text.includes("manana")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return formatDate(d);
  }

  if (text.includes("hoy")) {
    return formatDate(now);
  }

  const isoMatch = raw.match(DATE_PATTERN_ISO);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
      return null;
    }

    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const dmyMatch = raw.match(DATE_PATTERN_DMY);
  if (!dmyMatch) return null;

  const day = Number(dmyMatch[1]);
  const month = Number(dmyMatch[2]);
  const yearCandidate = Number(dmyMatch[3]);
  const year = dmyMatch[3].length === 2 ? 2000 + yearCandidate : yearCandidate;
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function extractTime(raw: string): BookingState["tourTime"] {
  const text = normalizeText(raw);
  if (/\b8(:00)?\s*(am)?\b/.test(text) || /\b08:00\b/.test(text) || /\bocho\b/.test(text) || /\bprimera?\s*hora\b/.test(text)) return "08:00";
  if (/\b9(:00)?\s*(am)?\b/.test(text) || /\b09:00\b/.test(text) || /\bnueve\b/.test(text) || /\bsegunda?\s*hora\b/.test(text)) return "09:00";
  if (/\b10(:00)?\s*(am)?\b/.test(text) || /\b10:00\b/.test(text) || /\bdiez\b/.test(text) || /\btercera?\s*hora\b/.test(text)) return "10:00";
  return null;
}

function extractPackage(raw: string): BookingState["tourPackage"] {
  const text = normalizeText(raw);
  if (/(\bprivate\b|privado|vip|grupo\s+privado)/.test(text)) return "private";
  if (/(\bfull\s*-?\s*day\b|dia\s+completo|completo|todo\s+el\s+dia)/.test(text)) return "full-day";
  if (/(\bbasic\b|basico|estandar)/.test(text)) return "basic";
  return null;
}

function extractTickets(raw: string): number | null {
  const grouped = raw.match(TICKETS_PATTERN)?.[1];
  const direct = raw.match(/(?:x|para|seriamos|somos\s+de)?\s*(\d{1,2})\s*(?:adultos?|personas?|pax)?\b/i)?.[1];
  const parsed = Number(grouped ?? direct);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 20) return null;
  return parsed;
}

function extractName(raw: string): string | null {
  const fromPrefix = raw.match(NAME_PATTERN)?.[1]?.trim();
  if (fromPrefix && fromPrefix.length >= 2) {
    return fromPrefix
      .split(/\s+/)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
      .join(" ");
  }
  return null;
}

function extractEmail(raw: string): string | null {
  return raw.match(EMAIL_PATTERN)?.[0] ?? null;
}

function extractPhone(raw: string): string | null {
  const matched = raw.match(PHONE_PATTERN)?.[0]?.trim();
  if (!matched) return null;
  const digits = matched.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return matched;
}

function extractSpecialRequests(raw: string): string | null {
  const text = normalizeText(raw);
  if (!/(observacion|nota|especial|quiero\s+agregar|adicional|comentario)/.test(text)) return null;
  return raw.trim();
}

function inferFromLatestMessage(state: BookingState, latestUserMessage: string): BookingState {
  return normalizeState({
    date: extractDate(latestUserMessage) ?? state.date,
    tourTime: extractTime(latestUserMessage) ?? state.tourTime,
    tourPackage: extractPackage(latestUserMessage) ?? state.tourPackage,
    tickets: extractTickets(latestUserMessage) ?? state.tickets,
    name: extractName(latestUserMessage) ?? state.name,
    email: extractEmail(latestUserMessage) ?? state.email,
    phone: extractPhone(latestUserMessage) ?? state.phone,
    specialRequests: extractSpecialRequests(latestUserMessage) ?? state.specialRequests,
  });
}

function inferFromConversation(state: BookingState, messages: ChatMessage[]): BookingState {
  return messages
    .filter((message) => message.role === "user")
    .reduce((acc, message) => inferFromLatestMessage(acc, message.content), state);
}

function normalizeState(state: BookingState): BookingState {
  const validTourTime = state.tourTime === "08:00" || state.tourTime === "09:00" || state.tourTime === "10:00" ? state.tourTime : null;
  const validPackage = state.tourPackage === "basic" || state.tourPackage === "full-day" || state.tourPackage === "private" ? state.tourPackage : null;
  const validTickets = typeof state.tickets === "number" && state.tickets >= 1 && state.tickets <= 20 ? state.tickets : null;

  return {
    ...state,
    date: state.date && /^\d{4}-\d{2}-\d{2}$/.test(state.date) ? state.date : null,
    tourTime: validTourTime,
    tourPackage: validPackage,
    tickets: validTickets,
    name: state.name?.trim() || null,
    email: state.email && EMAIL_PATTERN.test(state.email) ? state.email : null,
    phone: state.phone?.trim() || null,
    specialRequests: state.specialRequests?.trim() || null,
  };
}

function getMissingFields(state: BookingState): string[] {
  return REQUIRED_FIELDS.filter((field) => !state[field]);
}

function getFaqAnswer(input: string): string | null {
  const normalized = normalizeText(input);
  const entry = FAQ_ENTRIES.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
  return entry?.answer ?? null;
}

function buildLocalReply(updatedState: BookingState, latestMessage: string): string {
  const missingFields = getMissingFields(updatedState);
  const faqAnswer = getFaqAnswer(latestMessage);

  if (missingFields.length === 0) {
    return "¡Excelente! Ya tengo todo para tu reserva: fecha, hora, paquete, cantidad, nombre, correo y teléfono. Ahora podés pasar al flujo de reserva y pagar con PayPal.";
  }

  const nextField = missingFields[0];
  const promptByField: Record<string, string> = {
    date: "¿Qué fecha querés reservar? Podés escribirla como YYYY-MM-DD.",
    tourTime: "¿Qué horario preferís: 08:00, 09:00 o 10:00?",
    tourPackage: "¿Cuál paquete preferís: basic, full-day o private?",
    tickets: "¿Para cuántas personas sería la reserva?",
    name: "¿A nombre de quién hacemos la reserva?",
    email: "¿Cuál es tu correo para enviarte la confirmación?",
    phone: "¿Cuál es tu número de teléfono?",
  };

  if (faqAnswer) {
    return `${faqAnswer} Para avanzar con la reserva, ${promptByField[nextField]}`;
  }

  return `Perfecto, ya avancé con tus datos. ${promptByField[nextField]} Si querés, podés enviarme varios datos en un solo mensaje y yo completo los huecos automáticamente.`;
}

function shouldUseModel(previousState: BookingState, inferredState: BookingState, latestMessage: string): boolean {
  const prevMissing = getMissingFields(previousState).length;
  const nextMissing = getMissingFields(inferredState).length;
  const hasFaqAnswer = Boolean(getFaqAnswer(latestMessage));

  if (hasFaqAnswer) return false;
  if (nextMissing < prevMissing) return false;
  if (latestMessage.trim().length < 8) return false;

  const normalized = normalizeText(latestMessage);
  return /\?|explic|detalle|recomend|ayuda|no\s+entiendo|diferencia/.test(normalized);
}

export async function POST(req: NextRequest) {
  try {
    const { messages, state } = (await req.json()) as AssistantPayload;
    const latestUserMessage = [...messages].reverse().find((msg) => msg.role === "user")?.content ?? "";

    const inferredState = inferFromConversation(normalizeState(state), messages);
    if (!shouldUseModel(state, inferredState, latestUserMessage)) {
      const missingFields = getMissingFields(inferredState);
      return NextResponse.json(
        {
          reply: buildLocalReply(inferredState, latestUserMessage),
          updatedState: inferredState,
          missingFields,
          readyToBook: missingFields.length === 0,
        } satisfies AssistantResult,
        {
          headers: { "Cache-Control": "no-store", "X-AI-Mode": "local-rules" },
        },
      );
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 450,
      temperature: 0.3,
      system: buildSystemPrompt(inferredState),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const parsed = parseJsonFromText(text);

    if (!parsed) {
      return NextResponse.json(sanitizeResult(DEFAULT_RESULT, inferredState), {
        headers: { "Cache-Control": "no-store", "X-AI-Mode": "fallback-default" },
      });
    }

    return NextResponse.json(sanitizeResult(parsed, inferredState), {
      headers: { "Cache-Control": "no-store", "X-AI-Mode": "anthropic" },
    });
  } catch (error) {
    console.error("[ai/assistant]", error);
    return NextResponse.json(DEFAULT_RESULT, {
      headers: { "Cache-Control": "no-store", "X-AI-Mode": "error-default" },
    });
  }
}
