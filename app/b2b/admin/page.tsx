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
  const [loading, setLoading] = useState(false);
  const [initialSessionLoading, setInitialSessionLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState("");

  const pendingOperators = useMemo(
    () => operators.filter((op) => op.status === "pending"),
    [operators]
  );

  const approvedOperators = useMemo(
    () => operators.filter((op) => op.status !== "pending"),
    [operators]
  );

  async function fetchOperators() {
    setLoading(true);
    setRequestError("");

    try {
      const response = await fetch("/api/admin/b2b/operators");
      const data = await response.json();

      if (response.status === 401) {
        setIsLoggedIn(false);
        setOperators([]);
        return;
      }

      if (!response.ok) {
        setRequestError(data.error || "No se pudieron cargar los operadores.");
        return;
      }

      setIsLoggedIn(true);
      setOperators(data.operators || []);
    } catch {
      setRequestError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
      setInitialSessionLoading(false);
    }
  }

  useEffect(() => {
    fetchOperators();
  }, []);

  async function updateStatus(id: string, status: "approved" | "pending") {
    setActionLoadingId(id);
    setRequestError("");

    try {
      const response = await fetch(`/api/admin/b2b/operators/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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

      setOperators((current) =>
        current.map((operator) =>
          operator._id === id ? { ...operator, status } : operator
        )
      );
    } catch {
      setRequestError("Error de conexión al actualizar el operador.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || "Credenciales inválidas.");
        return;
      }

      setIsLoggedIn(true);
      setPassword("");
      await fetchOperators();
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

  if (initialSessionLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-12">
        <p className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando sesión de administrador...
        </p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12">
        <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Admin B2B</h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Acceso interno para aprobación de operadores.
          </p>
          <div className="mb-6 grid gap-2 sm:grid-cols-3">
            {ACCESS_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.style}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {authError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {authError}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Usuario"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Contraseña"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <button
              type="submit"
              disabled={authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Entrar
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8">
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard aprobación B2B</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Revisa y aprueba cuentas de operadores con estado pendiente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ACCESS_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${link.style}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-700 hover:shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      {requestError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {requestError}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900 dark:bg-amber-950/20">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-amber-900 dark:text-amber-300">
            <ShieldAlert className="h-5 w-5" />
            Pendientes ({pendingOperators.length})
          </h2>

          {loading ? (
            <p className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando operadores...
            </p>
          ) : pendingOperators.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No hay operadores pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {pendingOperators.map((operator) => (
                <li
                  key={operator._id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{operator.company}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {operator.name} · {operator.email}
                  </p>
                  <button
                    disabled={actionLoadingId === operator._id}
                    onClick={() => updateStatus(operator._id, "approved")}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {actionLoadingId === operator._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Aprobar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Aprobados / activos ({approvedOperators.length})
          </h2>

          {loading ? (
            <p className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando operadores...
            </p>
          ) : approvedOperators.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No hay operadores aprobados aún.</p>
          ) : (
            <ul className="space-y-3">
              {approvedOperators.map((operator) => (
                <li
                  key={operator._id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{operator.company}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {operator.name} · {operator.email}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Estado: {operator.status}</p>
                  <button
                    disabled={actionLoadingId === operator._id}
                    onClick={() => updateStatus(operator._id, "pending")}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200"
                  >
                    {actionLoadingId === operator._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Volver a pendiente
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
