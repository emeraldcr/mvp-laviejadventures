"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bike,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type MotoPartCategory = "frenos" | "aceites" | "llantas" | "cadena" | "electrico";
type MotoPartStockLevel = "high" | "medium" | "low";

type MotoPart = {
  _id: string;
  id: string;
  name: string;
  category: MotoPartCategory;
  brand: string;
  model: string;
  price: number;
  stock: string;
  stockLevel: MotoPartStockLevel;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type MotoPartForm = {
  name: string;
  category: MotoPartCategory;
  brand: string;
  model: string;
  price: string;
  stock: string;
  stockLevel: MotoPartStockLevel;
  description: string;
  image: string;
  isActive: boolean;
};

const emptyForm: MotoPartForm = {
  name: "",
  category: "frenos",
  brand: "",
  model: "",
  price: "",
  stock: "",
  stockLevel: "high",
  description: "",
  image: "",
  isActive: true,
};

const categoryLabels: Record<MotoPartCategory, string> = {
  frenos: "Frenos",
  aceites: "Aceites y filtros",
  llantas: "Llantas",
  cadena: "Cadena y transmision",
  electrico: "Electrico",
};

const stockLabels: Record<MotoPartStockLevel, string> = {
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
};

const currency = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

function partToForm(part: MotoPart): MotoPartForm {
  return {
    name: part.name,
    category: part.category,
    brand: part.brand,
    model: part.model,
    price: String(part.price),
    stock: part.stock,
    stockLevel: part.stockLevel,
    description: part.description,
    image: part.image,
    isActive: part.isActive,
  };
}

function formToPayload(form: MotoPartForm) {
  return {
    ...form,
    price: Number(form.price),
  };
}

export default function MotoAdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parts, setParts] = useState<MotoPart[]>([]);
  const [form, setForm] = useState<MotoPartForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredParts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return parts;

    return parts.filter((part) =>
      `${part.name} ${part.brand} ${part.model} ${part.category}`.toLowerCase().includes(normalized),
    );
  }, [parts, searchTerm]);

  async function fetchParts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/moto-parts");
      const data = await response.json();

      if (response.status === 401) {
        setIsLoggedIn(false);
        setParts([]);
        return;
      }

      if (!response.ok) {
        setError(data.error || "No se pudieron cargar los repuestos.");
        return;
      }

      setIsLoggedIn(true);
      setParts(data.parts || []);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    void fetchParts();
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Credenciales invalidas.");
        return;
      }

      setPassword("");
      setIsLoggedIn(true);
      await fetchParts();
    } catch {
      setError("No se pudo iniciar sesion.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const url = editingId ? `/api/admin/moto-parts/${editingId}` : "/api/admin/moto-parts";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const data = await response.json();

      if (response.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || "No se pudo guardar el repuesto.");
        return;
      }

      setSuccess(editingId ? "Repuesto actualizado." : "Repuesto creado.");
      setForm(emptyForm);
      setEditingId("");
      await fetchParts();
    } catch {
      setError("Error de conexion al guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(part: MotoPart) {
    setError("");
    setSuccess("");

    const confirmed = window.confirm(`Eliminar ${part.name}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/moto-parts/${part.id}`, { method: "DELETE" });
      const data = await response.json();

      if (response.status === 401) {
        setIsLoggedIn(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || "No se pudo eliminar el repuesto.");
        return;
      }

      setSuccess("Repuesto eliminado.");
      await fetchParts();
    } catch {
      setError("Error de conexion al eliminar.");
    }
  }

  async function toggleActive(part: MotoPart) {
    const nextForm = partToForm({ ...part, isActive: !part.isActive });
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/moto-parts/${part.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(nextForm)),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo cambiar el estado.");
        return;
      }

      await fetchParts();
    } catch {
      setError("Error de conexion al cambiar estado.");
    }
  }

  function startEdit(part: MotoPart) {
    setEditingId(part.id);
    setForm(partToForm(part));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId("");
    setForm(emptyForm);
    setError("");
  }

  if (initialLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando sesion...
        </p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <section className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300 text-zinc-950">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Acceso interno</p>
              <h1 className="text-2xl font-black">Moto Admin</h1>
            </div>
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Usuario"
              className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-black text-zinc-950 disabled:opacity-60"
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
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Inventario MongoDB</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black">
              <Bike className="h-7 w-7 text-cyan-200" />
              Moto Admin
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/moto"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/10"
            >
              Ver tienda
            </Link>
            <button
              type="button"
              onClick={() => fetchParts()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-black text-zinc-950 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Recargar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 xl:grid-cols-[420px_1fr]">
        <section className="h-fit rounded-lg border border-white/10 bg-zinc-900 p-5 xl:sticky xl:top-4">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                {editingId ? "Editar repuesto" : "Nuevo repuesto"}
              </p>
              <h2 className="mt-1 text-xl font-black">{editingId ? form.name : "Agregar al catalogo"}</h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                aria-label="Cancelar edicion"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          {success && <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-zinc-300">Nombre</span>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-zinc-300">Categoria</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as MotoPartCategory }))}
                  className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-zinc-300">Precio CRC</span>
                <input
                  required
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-zinc-300">Marca moto</span>
                <input
                  required
                  value={form.brand}
                  onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-zinc-300">Modelo compatible</span>
                <input
                  required
                  value={form.model}
                  onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-zinc-300">Stock texto</span>
                <input
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  placeholder="Disponible hoy"
                  className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-zinc-300">Nivel stock</span>
                <select
                  value={form.stockLevel}
                  onChange={(event) => setForm((current) => ({ ...current, stockLevel: event.target.value as MotoPartStockLevel }))}
                  className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
                >
                  {Object.entries(stockLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Upload className="h-3.5 w-3.5" />
                Foto URL o path
              </span>
              <input
                value={form.image}
                onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                placeholder="/image/repuesto.jpg o https://..."
                className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300"
              />
            </label>

            {form.image && (
              <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                <img src={form.image} alt="Preview del repuesto" className="h-36 w-full object-cover" />
              </div>
            )}

            <label className="block">
              <span className="text-xs font-bold text-zinc-300">Descripcion</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-cyan-300"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4"
              />
              Visible en la tienda
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-black text-zinc-950 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Guardar cambios" : "Crear repuesto"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-white/10 bg-zinc-900 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Repuestos</p>
              <h2 className="mt-1 text-xl font-black">{parts.length} registrados</h2>
            </div>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar repuesto..."
              className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-cyan-300 md:w-72"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-3">Foto</th>
                  <th className="py-3 pr-3">Repuesto</th>
                  <th className="py-3 pr-3">Categoria</th>
                  <th className="py-3 pr-3">Compatibilidad</th>
                  <th className="py-3 pr-3">Precio</th>
                  <th className="py-3 pr-3">Stock</th>
                  <th className="py-3 pr-3">Estado</th>
                  <th className="py-3 pr-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => (
                  <tr key={part.id} className="border-b border-white/10 align-top">
                    <td className="py-3 pr-3">
                      <div className="h-14 w-20 overflow-hidden rounded-lg bg-zinc-950">
                        {part.image ? (
                          <img src={part.image} alt={part.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <Bike className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="max-w-72 py-3 pr-3">
                      <p className="font-bold text-white">{part.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{part.description || "Sin descripcion"}</p>
                    </td>
                    <td className="py-3 pr-3">{categoryLabels[part.category]}</td>
                    <td className="py-3 pr-3">
                      <p className="font-bold">{part.brand}</p>
                      <p className="text-xs text-zinc-400">{part.model}</p>
                    </td>
                    <td className="py-3 pr-3 font-black text-cyan-100">{currency.format(part.price)}</td>
                    <td className="py-3 pr-3">
                      <p>{part.stock || "-"}</p>
                      <p className="text-xs text-zinc-400">{stockLabels[part.stockLevel]}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(part)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          part.isActive ? "bg-emerald-500/10 text-emerald-200" : "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {part.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {part.isActive ? "Visible" : "Oculto"}
                      </button>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(part)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/10"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(part)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredParts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400">
                      No hay repuestos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
