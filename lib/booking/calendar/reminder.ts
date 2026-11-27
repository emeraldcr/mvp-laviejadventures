type Reminder = { date?: string | null; tourName?: string | null; tourTime?: string | null; reference?: string | null; lang: "es" | "en" };

function dateParts(date?: string | null) {
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const startDate = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (startDate.getUTCFullYear() !== Number(y) || startDate.getUTCMonth() + 1 !== Number(m) || startDate.getUTCDate() !== Number(d)) return null;
  const format = (value: Date) => `${value.getUTCFullYear()}${String(value.getUTCMonth() + 1).padStart(2, "0")}${String(value.getUTCDate()).padStart(2, "0")}`;
  const start = format(startDate);
  startDate.setUTCDate(startDate.getUTCDate() + 1);
  return { start, end: format(startDate) };
}

function description({ tourTime, reference, lang }: Reminder) {
  const time = tourTime && /^([01]?\d|2[0-3]):[0-5]\d$/.test(tourTime) ? tourTime : null;
  return lang === "es"
    ? `Referencia: ${reference || "N/D"}. ${time ? `Hora seleccionada: ${time}, hora de Costa Rica.` : "Horario por coordinar."} El equipo confirma disponibilidad, hora y punto de encuentro.`
    : `Reference: ${reference || "N/A"}. ${time ? `Selected time: ${time}, Costa Rica time.` : "Time to be arranged."} The team confirms availability, time and meeting point.`;
}

export function googleCalendarReminder(input: Reminder): string | null {
  const dates = dateParts(input.date);
  if (!dates) return null;
  const params = new URLSearchParams({ action: "TEMPLATE", text: input.tourName || "La Vieja Adventures", details: description(input), dates: `${dates.start}/${dates.end}` });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function calendarReminderIcs(input: Reminder, now = new Date()): string | null {
  const dates = dateParts(input.date);
  if (!dates) return null;
  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//La Vieja Adventures//Booking//EN", "BEGIN:VEVENT", `UID:${escape(input.reference || `${dates.start}-lva`)}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${dates.start}`, `DTEND;VALUE=DATE:${dates.end}`, `SUMMARY:${escape(input.tourName || "La Vieja Adventures")}`, `DESCRIPTION:${escape(description(input))}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
