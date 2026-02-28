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
  const [settings, setSettings] = useState<B2BSettings>({ ivaRate: 13, tourPricing: [] });
  const [pricingJson, setPricingJson] = useState("[]");

  const [loading, setLoading] = useState(false);
  const [initialSessionLoading, setInitialSessionLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState("");

  const pendingOperators = useMemo(() => operators.filter((op) => op.status === "pending"), [operators]);
  const approvedOperators = useMemo(() => operators.filter((op) => op.status !== "pending"), [operators]);

  async function fetchAdminData() {
    setLoading(true);
    setRequestError("");

    try {
      const [operatorsRes, insightsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/b2b/operators"),
        fetch("/api/admin/b2b/insights"),
        fetch("/api/admin/b2b/settings"),
      ]);

      if (operatorsRes.status === 401 || insightsRes.status === 401 || settingsRes.status === 401) {
        setIsLoggedIn(false);
        setOperators([]);
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
  }

  if (initialSessionLoading) return <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-12"><p className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Loader2 className="h-4 w-4 animate-spin" />Verificando sesión de administrador...</p></main>;

  if (!isLoggedIn) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12">
        <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Admin B2B</h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Acceso interno para aprobación de operadores y settings B2B.</p>
          <div className="mb-6 grid gap-2 sm:grid-cols-3">{ACCESS_LINKS.map((link) => <Link key={link.href} href={link.href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.style}`}>{link.icon}{link.label}</Link>)}</div>
          {authError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{authError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Usuario" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Contraseña" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm" />
            <button type="submit" disabled={authLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}Entrar</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8">
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex flex-col gap-2"><h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard Admin B2B avanzado</h1><p className="text-sm text-zinc-500 dark:text-zinc-400">Gestiona operadores, paquetes, precios, IVA y auditoría de usuarios/logins.</p></div>
        <div className="flex flex-wrap items-center gap-2">{ACCESS_LINKS.map((link) => <Link key={link.href} href={link.href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.style}`}>{link.icon}{link.label}</Link>)}<button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"><LogOut className="h-4 w-4" />Salir</button></div>
      </header>

      {requestError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{requestError}</div>}

      <section className="grid gap-6 lg:grid-cols-2 mb-6">
        <article className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6"><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-900"><ShieldAlert className="h-5 w-5" />Pendientes ({pendingOperators.length})</h2>{loading ? <p className="inline-flex items-center gap-2 text-sm text-zinc-600"><Loader2 className="h-4 w-4 animate-spin" />Cargando operadores...</p> : pendingOperators.length === 0 ? <p className="text-sm text-zinc-600">No hay operadores pendientes.</p> : <ul className="space-y-3">{pendingOperators.map((operator) => <li key={operator._id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="font-semibold text-zinc-900">{operator.company}</p><p className="text-sm text-zinc-500">{operator.name} · {operator.email}</p><button disabled={actionLoadingId === operator._id} onClick={() => updateStatus(operator._id, "approved")} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{actionLoadingId === operator._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Aprobar</button></li>)}</ul>}</article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="mb-4 text-xl font-semibold text-zinc-900">Aprobados / activos ({approvedOperators.length})</h2>{loading ? <p className="inline-flex items-center gap-2 text-sm text-zinc-600"><Loader2 className="h-4 w-4 animate-spin" />Cargando operadores...</p> : approvedOperators.length === 0 ? <p className="text-sm text-zinc-600">No hay operadores aprobados aún.</p> : <ul className="space-y-3">{approvedOperators.map((operator) => <li key={operator._id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="font-semibold text-zinc-900">{operator.company}</p><p className="text-sm text-zinc-500">{operator.name} · {operator.email}</p><p className="mt-1 text-xs text-zinc-400">Estado: {operator.status}</p><button disabled={actionLoadingId === operator._id} onClick={() => updateStatus(operator._id, "pending")} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-60">{actionLoadingId === operator._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}Volver a pendiente</button></li>)}</ul>}</article>
      </section>

      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold mb-3">Configuración de paquetes, precios e IVA</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm mb-1">IVA (%)</label>
            <input type="number" min={0} max={100} value={settings.ivaRate} onChange={(e) => setSettings((prev) => ({ ...prev, ivaRate: Number(e.target.value) }))} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-3">Edita el JSON para definir paquetes por tour. Formato ejemplo en el textarea inferior.</p>
        <textarea value={pricingJson} onChange={(e) => setPricingJson(e.target.value)} rows={8} className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono" />
        <button onClick={handleSaveSettings} disabled={savingSettings} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{savingSettings ? "Guardando..." : "Guardar configuración"}</button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Usuarios registrados ({users.length})</h2>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-zinc-500"><th className="pb-2">Nombre</th><th className="pb-2">Email</th><th className="pb-2">Creado</th></tr></thead><tbody>{users.map((user) => <tr key={user._id} className="border-t border-zinc-100"><td className="py-2">{user.name}</td><td className="py-2">{user.email}</td><td className="py-2">{new Date(user.createdAt).toLocaleString("es-CR")}</td></tr>)}</tbody></table>
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Logs de acceso ({loginLogs.length})</h2>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-zinc-500"><th className="pb-2">Tipo</th><th className="pb-2">Usuario</th><th className="pb-2">Device/IP</th><th className="pb-2">Fecha</th></tr></thead><tbody>{loginLogs.map((log) => <tr key={log._id} className="border-t border-zinc-100"><td className="py-2">{log.userType}</td><td className="py-2">{log.emailOrUsername}</td><td className="py-2">{log.device}{log.ip ? ` · ${log.ip}` : ""}</td><td className="py-2">{new Date(log.createdAt).toLocaleString("es-CR")}</td></tr>)}</tbody></table>
          </div>
        </article>
      </section>
    </main>
  );
}
