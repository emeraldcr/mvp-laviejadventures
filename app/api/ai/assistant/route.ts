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

function buildSystemPrompt(state: BookingState) {
  return `Sos un asistente de reservas para La Vieja Adventures (Costa Rica).

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
- Ubicación: San Isidro de El General, Pérez Zeledón, Costa Rica.
- Operador: La Vieja Adventures.
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
  const updatedState: BookingState = {
    date: raw.updatedState?.date ?? fallbackState.date,
    tourTime: raw.updatedState?.tourTime ?? fallbackState.tourTime,
    tourPackage: raw.updatedState?.tourPackage ?? fallbackState.tourPackage,
    tickets: raw.updatedState?.tickets ?? fallbackState.tickets,
    name: raw.updatedState?.name ?? fallbackState.name,
    email: raw.updatedState?.email ?? fallbackState.email,
    phone: raw.updatedState?.phone ?? fallbackState.phone,
    specialRequests: raw.updatedState?.specialRequests ?? fallbackState.specialRequests,
  };

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

export async function POST(req: NextRequest) {
  try {
    const { messages, state } = (await req.json()) as AssistantPayload;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 450,
      temperature: 0.3,
      system: buildSystemPrompt(state),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const parsed = parseJsonFromText(text);

    if (!parsed) {
      return NextResponse.json(sanitizeResult(DEFAULT_RESULT, state), {
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(sanitizeResult(parsed, state), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[ai/assistant]", error);
    return NextResponse.json(DEFAULT_RESULT, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
