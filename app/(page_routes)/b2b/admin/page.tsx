"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Home, Loader2, LogIn, LogOut, ShieldAlert, ShieldCheck, UserRound, XCircle } from "lucide-react";

type Operator = {
  _id: string;
  name: string;
  company: string;
  email: string;
  status: "pending" | "approved" | "active";
  commissionRate: number;
  createdAt: string;
};

type AppUser = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type Reservation = {
  _id: string;
  name: string | null;
  email: string | null;
  date: string | null;
  tickets: number | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  tourName: string | null;
  createdAt: string | null;
};

type LoginLog = {
  _id: string;
  userType: "admin" | "operator" | "user";
  emailOrUsername: string;
  device: string;
  ip?: string;
  createdAt: string;
};

type B2BSettings = {
  ivaRate: number;
  tourPricing: Array<{ tourId: string; packages: Array<{ id: string; name: string; priceCRC: number }> }>;
};

type BookingAnalyticsEvent = {
  _id: string;
  event: "booking_step" | "booking_submitted";
  path: string | null;
  sessionId: string | null;
  happenedAt: string | null;
  createdAt: string | null;
  metadata: {
    step?: string;
    tickets?: number;
    amount?: number;
    currency?: string;
    [key: string]: unknown;
  };
  user: {
    userId?: string | null;
    email?: string | null;
    name?: string | null;
  };
  request: {
    country?: string | null;
    city?: string | null;
    deviceType?: string | null;
    browser?: string | null;
    os?: string | null;
  };
};

type BookingAnalytics = {
  totalEvents: number;
  bookingSteps: number;
  bookingSubmissions: number;
  uniqueSessions: number;
  conversionRate: number;
  recentEvents: BookingAnalyticsEvent[];
};

type HeroSloganLog = {
  _id: string;
  es: string;
  en: string;
  model: string;
  prompt: string;
  rawResponse: string;
  createdAt: string | null;
};

type ManualReservationForm = {
  name: string;
  email: string;
  phone: string;
  date: string;
  tickets: number;
  tourName: string;
  tourPackage: string;
  tourTime: string;
  amount: string;
  currency: string;
  notes: string;
  paymentMethod: "cash" | "bank_transfer" | "unpaid";
};


const ACCESS_LINKS = [
  { href: "/", label: "Inicio", icon: <Home className="h-4 w-4" />, style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { href: "/dashboard", label: "Usuario normal", icon: <UserRound className="h-4 w-4" />, style: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" },
  { href: "/b2b/login", label: "Login B2B", icon: <ShieldCheck className="h-4 w-4" />, style: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
];

export default function B2BAdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [operators, setOperators] = useState<Operator[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics>({
    totalEvents: 0,
    bookingSteps: 0,
    bookingSubmissions: 0,
    uniqueSessions: 0,
    conversionRate: 0,
    recentEvents: [],
  });
  const [settings, setSettings] = useState<B2BSettings>({ ivaRate: 13, tourPricing: [] });
  const [pricingJson, setPricingJson] = useState("[]");
  const [heroSlogans, setHeroSlogans] = useState<HeroSloganLog[]>([]);
  const [manualReservation, setManualReservation] = useState<ManualReservationForm>({
    name: "",
    email: "",
    phone: "",
    date: "",
    tickets: 1,
    tourName: "",
    tourPackage: "",
    tourTime: "",
    amount: "",
    currency: "CRC",
    notes: "",
    paymentMethod: "unpaid",
  });

  const [loading, setLoading] = useState(false);
  const [initialSessionLoading, setInitialSessionLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingManualReservation, setCreatingManualReservation] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const pendingOperators = useMemo(() => operators.filter((op) => op.status === "pending"), [operators]);
  const approvedOperators = useMemo(() => operators.filter((op) => op.status !== "pending"), [operators]);

  async function fetchAdminData() {
    setLoading(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const [operatorsRes, insightsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/b2b/operators"),
        fetch("/api/admin/b2b/insights"),
        fetch("/api/admin/b2b/settings"),
      ]);

      if (operatorsRes.status === 401 || insightsRes.status === 401 || settingsRes.status === 401) {
        setIsLoggedIn(false);
        setOperators([]);
        setReservations([]);
        setBookingAnalytics({ totalEvents: 0, bookingSteps: 0, bookingSubmissions: 0, uniqueSessions: 0, conversionRate: 0, recentEvents: [] });
        setHeroSlogans([]);
        return;
      }

      const operatorsData = await operatorsRes.json();
      const insightsData = await insightsRes.json();
      const settingsData = await settingsRes.json();

      if (!operatorsRes.ok) {
        setRequestError(operatorsData.error || "No se pudieron cargar los operadores.");
        return;
      }

      setIsLoggedIn(true);
      setOperators(operatorsData.operators || []);
      setUsers(insightsData.users || []);
      setLoginLogs(insightsData.loginLogs || []);
      setReservations(insightsData.reservations || []);
      setBookingAnalytics(
        insightsData.bookingAnalytics ||
          { totalEvents: 0, bookingSteps: 0, bookingSubmissions: 0, uniqueSessions: 0, conversionRate: 0, recentEvents: [] },
      );
      setHeroSlogans(insightsData.heroSlogans || []);
      const nextSettings = settingsData.settings || { ivaRate: 13, tourPricing: [] };
      setSettings(nextSettings);
      setPricingJson(JSON.stringify(nextSettings.tourPricing || [], null, 2));
    } catch {
      setRequestError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
      setInitialSessionLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function updateStatus(id: string, status: "approved" | "pending") {
    setActionLoadingId(id);
    setRequestError("");

    try {
      const response = await fetch(`/api/admin/b2b/operators/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setIsLoggedIn(false);
        setOperators([]);
        setReservations([]);
        setBookingAnalytics({ totalEvents: 0, bookingSteps: 0, bookingSubmissions: 0, uniqueSessions: 0, conversionRate: 0, recentEvents: [] });
        setHeroSlogans([]);
        return;
      }

      if (!response.ok) {
        setRequestError(data.error || "No se pudo actualizar el estado.");
        return;
      }

      setOperators((current) => current.map((operator) => (operator._id === id ? { ...operator, status } : operator)));
    } catch {
      setRequestError("Error de conexión al actualizar el operador.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    setRequestError("");

    try {
      const parsed = JSON.parse(pricingJson);
      const response = await fetch("/api/admin/b2b/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ivaRate: settings.ivaRate, tourPricing: parsed }),
      });
      const data = await response.json();
      if (!response.ok) {
        setRequestError(data.error || "No se pudo guardar configuración");
        return;
      }
      await fetchAdminData();
    } catch {
      setRequestError("JSON de paquetes inválido.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleCreateManualReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingManualReservation(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      const response = await fetch("/api/admin/b2b/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualReservation,
          amount: manualReservation.amount ? Number(manualReservation.amount) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRequestError(data.error || "No se pudo crear la reserva manual.");
        return;
      }

      setRequestSuccess("Reserva manual creada correctamente.");
      setManualReservation({
        name: "",
        email: "",
        phone: "",
        date: "",
        tickets: 1,
        tourName: "",
        tourPackage: "",
        tourTime: "",
        amount: "",
        currency: "CRC",
        notes: "",
        paymentMethod: "unpaid",
      });

      await fetchAdminData();
    } catch {
      setRequestError("Error de conexión al crear la reserva manual.");
    } finally {
      setCreatingManualReservation(false);
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || "Credenciales inválidas.");
        return;
      }
      setIsLoggedIn(true);
      setPassword("");
      await fetchAdminData();
    } catch {
      setAuthError("No se pudo iniciar sesión. Intenta nuevamente.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setOperators([]);
    setReservations([]);
  }

  if (initialSessionLoading) return <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-12"><p className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Loader2 className="h-4 w-4 animate-spin" />Verificando sesión de administrador...</p></main>;

  if (!isLoggedIn) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12 text-zinc-900 dark:text-zinc-100">
        <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Admin B2B</h1>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Acceso interno para aprobación de operadores y settings B2B.</p>
          <div className="mb-6 grid gap-2 sm:grid-cols-3">{ACCESS_LINKS.map((link) => <Link key={link.href} href={link.href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.style}`}>{link.icon}{link.label}</Link>)}</div>
          {authError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{authError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Usuario" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Contraseña" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400" />
            <button type="submit" disabled={authLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}Entrar</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl rounded-3xl bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex flex-col gap-2"><h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard Admin B2B avanzado</h1><p className="text-sm text-zinc-600 dark:text-zinc-400">Gestiona operadores, paquetes, precios, IVA y auditoría de usuarios/logins.</p></div>
        <div className="flex flex-wrap items-center gap-2">{ACCESS_LINKS.map((link) => <Link key={link.href} href={link.href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.style}`}>{link.icon}{link.label}</Link>)}<button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"><LogOut className="h-4 w-4" />Salir</button></div>
      </header>

      {requestError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">{requestError}</div>}
      {requestSuccess && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{requestSuccess}</div>}

      <section className="grid gap-6 lg:grid-cols-2 mb-6">
        <article className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/30 p-6"><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-900 dark:text-amber-200"><ShieldAlert className="h-5 w-5" />Pendientes ({pendingOperators.length})</h2>{loading ? <p className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Loader2 className="h-4 w-4 animate-spin" />Cargando operadores...</p> : pendingOperators.length === 0 ? <p className="text-sm text-zinc-600 dark:text-zinc-300">No hay operadores pendientes.</p> : <ul className="space-y-3">{pendingOperators.map((operator) => <li key={operator._id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"><p className="font-semibold text-zinc-900">{operator.company}</p><p className="text-sm text-zinc-600 dark:text-zinc-300">{operator.name} · {operator.email}</p><button disabled={actionLoadingId === operator._id} onClick={() => updateStatus(operator._id, "approved")} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{actionLoadingId === operator._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Aprobar</button></li>)}</ul>}</article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"><h2 className="mb-4 text-xl font-semibold text-zinc-900">Aprobados / activos ({approvedOperators.length})</h2>{loading ? <p className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Loader2 className="h-4 w-4 animate-spin" />Cargando operadores...</p> : approvedOperators.length === 0 ? <p className="text-sm text-zinc-600 dark:text-zinc-300">No hay operadores aprobados aún.</p> : <ul className="space-y-3">{approvedOperators.map((operator) => <li key={operator._id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"><p className="font-semibold text-zinc-900">{operator.company}</p><p className="text-sm text-zinc-600 dark:text-zinc-300">{operator.name} · {operator.email}</p><p className="mt-1 text-xs text-zinc-400">Estado: {operator.status}</p><button disabled={actionLoadingId === operator._id} onClick={() => updateStatus(operator._id, "pending")} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-60">{actionLoadingId === operator._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}Volver a pendiente</button></li>)}</ul>}</article>
      </section>

      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-3">Configuración de paquetes, precios e IVA</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm mb-1">IVA (%)</label>
            <input type="number" min={0} max={100} value={settings.ivaRate} onChange={(e) => setSettings((prev) => ({ ...prev, ivaRate: Number(e.target.value) }))} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          </div>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-3">Edita el JSON para definir paquetes por tour. Formato ejemplo en el textarea inferior.</p>
        <textarea value={pricingJson} onChange={(e) => setPricingJson(e.target.value)} rows={8} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono" />
        <button onClick={handleSaveSettings} disabled={savingSettings} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{savingSettings ? "Guardando..." : "Guardar configuración"}</button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold">Usuarios registrados ({users.length})</h2>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-zinc-600 dark:text-zinc-300"><th className="pb-2">Nombre</th><th className="pb-2">Email</th><th className="pb-2">Creado</th></tr></thead><tbody>{users.map((user) => <tr key={user._id} className="border-t border-zinc-200 dark:border-zinc-700"><td className="py-2">{user.name}</td><td className="py-2">{user.email}</td><td className="py-2">{new Date(user.createdAt).toLocaleString("es-CR")}</td></tr>)}</tbody></table>
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold">Logs de acceso ({loginLogs.length})</h2>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-zinc-600 dark:text-zinc-300"><th className="pb-2">Tipo</th><th className="pb-2">Usuario</th><th className="pb-2">Device/IP</th><th className="pb-2">Fecha</th></tr></thead><tbody>{loginLogs.map((log) => <tr key={log._id} className="border-t border-zinc-200 dark:border-zinc-700"><td className="py-2">{log.userType}</td><td className="py-2">{log.emailOrUsername}</td><td className="py-2">{log.device}{log.ip ? ` · ${log.ip}` : ""}</td><td className="py-2">{new Date(log.createdAt).toLocaleString("es-CR")}</td></tr>)}</tbody></table>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-1 text-xl font-semibold">Crear reserva manual (sin pago web)</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">Para clientes que pagan en efectivo o transferencia local fuera del checkout del sitio.</p>

        <form onSubmit={handleCreateManualReservation} className="grid gap-3 md:grid-cols-2">
          <input required value={manualReservation.name} onChange={(event) => setManualReservation((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nombre cliente" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input required type="email" value={manualReservation.email} onChange={(event) => setManualReservation((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email cliente" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input required value={manualReservation.phone} onChange={(event) => setManualReservation((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Teléfono" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input required type="date" value={manualReservation.date} onChange={(event) => setManualReservation((prev) => ({ ...prev, date: event.target.value }))} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input required type="number" min={1} value={manualReservation.tickets} onChange={(event) => setManualReservation((prev) => ({ ...prev, tickets: Number(event.target.value) }))} placeholder="Tickets" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input required value={manualReservation.tourName} onChange={(event) => setManualReservation((prev) => ({ ...prev, tourName: event.target.value }))} placeholder="Nombre del tour" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input value={manualReservation.tourPackage} onChange={(event) => setManualReservation((prev) => ({ ...prev, tourPackage: event.target.value }))} placeholder="Paquete (opcional)" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input value={manualReservation.tourTime} onChange={(event) => setManualReservation((prev) => ({ ...prev, tourTime: event.target.value }))} placeholder="Hora tour (opcional)" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input type="number" min={0} value={manualReservation.amount} onChange={(event) => setManualReservation((prev) => ({ ...prev, amount: event.target.value }))} placeholder="Monto (opcional)" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <input value={manualReservation.currency} onChange={(event) => setManualReservation((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))} placeholder="Moneda (CRC, USD)" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <select value={manualReservation.paymentMethod} onChange={(event) => setManualReservation((prev) => ({ ...prev, paymentMethod: event.target.value as ManualReservationForm["paymentMethod"] }))} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
            <option value="unpaid">Sin pago aún</option>
            <option value="bank_transfer">Transferencia local</option>
            <option value="cash">Efectivo</option>
          </select>
          <input value={manualReservation.notes} onChange={(event) => setManualReservation((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notas (opcional)" className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          <button type="submit" disabled={creatingManualReservation} className="md:col-span-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{creatingManualReservation ? "Guardando..." : "Crear reserva manual"}</button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-semibold">Reservas de usuarios normales ({reservations.length})</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">Este panel ahora unifica B2B + usuarios normales para que admin/admin gestione todo en un solo lugar.</p>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-600 dark:text-zinc-300">
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Tour</th>
                <th className="pb-2">Fecha tour</th>
                <th className="pb-2">Tickets</th>
                <th className="pb-2">Monto</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2">Creada</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id} className="border-t border-zinc-200 dark:border-zinc-700">
                  <td className="py-2">
                    <p className="font-medium text-zinc-900">{reservation.name || "Sin nombre"}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">{reservation.email || "Sin email"}</p>
                  </td>
                  <td className="py-2">{reservation.tourName || "Tour principal"}</td>
                  <td className="py-2">{reservation.date || "Sin fecha"}</td>
                  <td className="py-2">{reservation.tickets ?? "-"}</td>
                  <td className="py-2">
                    {reservation.amount != null
                      ? `${reservation.amount} ${reservation.currency || "USD"}`
                      : "-"}
                  </td>
                  <td className="py-2">{reservation.status || "-"}</td>
                  <td className="py-2">
                    {reservation.createdAt ? new Date(reservation.createdAt).toLocaleString("es-CR") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-1 text-xl font-semibold">Slogans guardados en MongoDB ({heroSlogans.length})</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">Historial de slogans generados en el hero para auditoría de contenido AI.</p>

        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-600 dark:text-zinc-300">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">ES</th>
                <th className="pb-2">EN</th>
                <th className="pb-2">Modelo</th>
              </tr>
            </thead>
            <tbody>
              {heroSlogans.map((slogan) => (
                <tr key={slogan._id} className="border-t border-zinc-200 dark:border-zinc-700 align-top">
                  <td className="py-2 whitespace-nowrap">{slogan.createdAt ? new Date(slogan.createdAt).toLocaleString("es-CR") : "-"}</td>
                  <td className="py-2">{slogan.es}</td>
                  <td className="py-2">{slogan.en}</td>
                  <td className="py-2 whitespace-nowrap">{slogan.model || "-"}</td>
                </tr>
              ))}
              {heroSlogans.length === 0 && (
                <tr>
                  <td className="py-4 text-zinc-600 dark:text-zinc-300" colSpan={4}>No hay slogans guardados todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-1 text-xl font-semibold">Booking analytics (Mongo track)</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">Eventos nuevos de analytics para seguir el embudo de reserva e insights de conversión.</p>

        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">Eventos</p>
            <p className="text-2xl font-semibold">{bookingAnalytics.totalEvents}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">Booking steps</p>
            <p className="text-2xl font-semibold">{bookingAnalytics.bookingSteps}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">Submissions</p>
            <p className="text-2xl font-semibold">{bookingAnalytics.bookingSubmissions}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">Sesiones únicas</p>
            <p className="text-2xl font-semibold">{bookingAnalytics.uniqueSessions}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">Conversión / sesión</p>
            <p className="text-2xl font-semibold">{bookingAnalytics.conversionRate}%</p>
          </div>
        </div>

        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-600 dark:text-zinc-300">
                <th className="pb-2">Evento</th>
                <th className="pb-2">Paso</th>
                <th className="pb-2">Path</th>
                <th className="pb-2">Usuario</th>
                <th className="pb-2">Dispositivo</th>
                <th className="pb-2">Sesión</th>
                <th className="pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {bookingAnalytics.recentEvents.map((event) => (
                <tr key={event._id} className="border-t border-zinc-200 dark:border-zinc-700">
                  <td className="py-2 font-medium">{event.event}</td>
                  <td className="py-2">{typeof event.metadata.step === "string" ? event.metadata.step : "-"}</td>
                  <td className="py-2">{event.path || "-"}</td>
                  <td className="py-2">{event.user.email || event.user.name || "Anónimo"}</td>
                  <td className="py-2">{event.request.deviceType || "-"} · {event.request.browser || "-"}</td>
                  <td className="py-2">{event.sessionId ? event.sessionId.slice(0, 8) : "-"}</td>
                  <td className="py-2">{event.happenedAt ? new Date(event.happenedAt).toLocaleString("es-CR") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </main>
  );
}
