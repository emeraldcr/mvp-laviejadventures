"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Minus,
  PhoneCall,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Trash2,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import {
  motoPartCategoryLabels,
  type MotoCartItem,
  type MotoPartCatalogItem,
  type MotoPartCategoryFilter,
} from "@/lib/moto-parts";

type Category = MotoPartCategoryFilter;
type Part = MotoPartCatalogItem;
type CartItem = MotoCartItem;
type ServiceMode = "express" | "encomienda" | "retirar";
type WorkshopJob = "revision" | "reparacion" | "instalacion" | "mantenimiento";

const WHATSAPP_NUMBER = "50662200006";
const BUSINESS_NAME = "Parce Motos Virtual CR";
const BUSINESS_LOCATION = "Ciudad Quesada, diagonal a Pali";

const parts: Part[] = [
  {
    id: "1",
    name: "Combo rider: casco + guantes + accesorios",
    category: "accesorios",
    brand: "Shadows",
    model: "Universal",
    price: 39900,
    stock: "Disponible hoy",
    stockLevel: "high",
    description: "Combo para salir completo: casco, guantes y accesorios basicos con entrega coordinada.",
    image: "/rider.jpg",
  },
  {
    id: "2",
    name: "Casco certificado urbano",
    category: "accesorios",
    brand: "On.Wheels",
    model: "Integral",
    price: 32500,
    stock: "Varias tallas",
    stockLevel: "high",
    description: "Casco comodo para uso diario, buena ventilacion y acabado resistente.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&q=80",
  },
  {
    id: "3",
    name: "Flat Morez suavizador de clutch",
    category: "embrague",
    brand: "Flat Morez",
    model: "Universal",
    price: 14500,
    stock: "Disponible hoy",
    stockLevel: "high",
    description: "Suavizador de clutch para manejo mas liviano en ciudad, rutas largas y trabajo diario.",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&q=80",
  },
  {
    id: "4",
    name: "Patillas de cambios reforzadas",
    category: "direccion",
    brand: "Shadows",
    model: "Varias motos",
    price: 9800,
    stock: "Consultar modelo",
    stockLevel: "medium",
    description: "Patillas de cambios para reemplazo rapido. Confirmamos compatibilidad por WhatsApp.",
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=900&q=80",
  },
  {
    id: "5",
    name: "Kit mantenimiento 2T",
    category: "motor",
    brand: "On.Wheels",
    model: "2T",
    price: 18900,
    stock: "Disponible hoy",
    stockLevel: "high",
    description: "Insumos y repuestos seleccionados para motores 2T, bici motos y uso de alto giro.",
    image: "https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?w=900&q=80",
  },
  {
    id: "6",
    name: "Repuestos para bici motos",
    category: "motor",
    brand: "Universal",
    model: "Bici moto",
    price: 12000,
    stock: "Bajo consulta",
    stockLevel: "medium",
    description: "Piezas, accesorios e instalacion para bici motos. Te orientamos segun el motor.",
    image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=900&q=80",
  },
  {
    id: "7",
    name: "Pastillas de freno para moto",
    category: "frenos",
    brand: "Shadows",
    model: "Varias referencias",
    price: 8500,
    stock: "Disponible hoy",
    stockLevel: "high",
    description: "Pastillas para mantenimiento rapido. Revisamos referencia antes de confirmar pedido.",
    image: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=900&q=80",
  },
  {
    id: "8",
    name: "Aceite y consumibles de taller",
    category: "aceites",
    brand: "On.Wheels",
    model: "2T / 4T",
    price: 6900,
    stock: "Stock local",
    stockLevel: "high",
    description: "Aceites, lubricantes y consumibles para mantenimiento preventivo en tienda o taller.",
    image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=900&q=80",
  },
];

const categoryLabels = motoPartCategoryLabels;

const serviceLabels: Record<ServiceMode, string> = {
  express: "Express local",
  encomienda: "Encomienda",
  retirar: "Retiro en tienda",
};

const workshopLabels: Record<WorkshopJob, string> = {
  revision: "Revision general",
  reparacion: "Reparacion",
  instalacion: "Instalacion de repuestos",
  mantenimiento: "Mantenimiento preventivo",
};

const stockBadgeClasses: Record<Part["stockLevel"], string> = {
  high: "bg-emerald-400 text-zinc-950",
  medium: "bg-amber-400 text-zinc-950",
  low: "bg-rose-500 text-white",
};

const currency = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

export default function RutaMotoApp() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "price-low" | "price-high">("relevance");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(60000);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [serviceMode, setServiceMode] = useState<ServiceMode>("express");
  const [location, setLocation] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [workshopJob, setWorkshopJob] = useState<WorkshopJob>("revision");
  const [workshopDate, setWorkshopDate] = useState("");
  const [workshopDetails, setWorkshopDetails] = useState("");
  const [motoBrand, setMotoBrand] = useState("");
  const [motoModel, setMotoModel] = useState("");
  const [motoYear, setMotoYear] = useState("");
  const [urgency, setUrgency] = useState<"baja" | "media" | "alta">("media");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [catalogParts, setCatalogParts] = useState<Part[]>(parts);

  useEffect(() => {
    const saved = localStorage.getItem("parceMotosCart");
    if (saved) {
      window.queueMicrotask(() => setCart(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("parceMotosCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let cancelled = false;

    async function loadMotoParts() {
      try {
        const response = await fetch("/api/moto-parts");
        const data = await response.json();
        if (!cancelled && response.ok && Array.isArray(data.parts) && data.parts.length > 0) {
          setCatalogParts(data.parts);
        }
      } catch {
        setCatalogParts(parts);
      }
    }

    void loadMotoParts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const brands = useMemo(() => ["Todas", ...Array.from(new Set(catalogParts.map((p) => p.brand)))], [catalogParts]);

  const filteredParts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const result = catalogParts.filter((part) => {
      const matchesCategory = activeCategory === "all" || part.category === activeCategory;
      const matchesBrand = selectedBrand === "Todas" || part.brand === selectedBrand;
      const matchesSearch =
        normalized.length === 0 ||
        `${part.name} ${part.brand} ${part.model} ${part.description}`.toLowerCase().includes(normalized);
      const matchesPrice = part.price >= minPrice && part.price <= maxPrice;
      return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
    });

    if (sortBy === "price-low") return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [activeCategory, catalogParts, maxPrice, minPrice, searchTerm, selectedBrand, sortBy]);

  const cartDetails = useMemo(() => {
    return cart
      .map((item) => {
        const part = catalogParts.find((p) => p.id === item.partId);
        if (!part) return null;
        return { ...part, quantity: item.quantity, lineTotal: item.quantity * part.price };
      })
      .filter(Boolean) as Array<Part & { quantity: number; lineTotal: number }>;
  }, [cart, catalogParts]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryCost = cartDetails.length === 0 ? 0 : serviceMode === "retirar" ? 0 : serviceMode === "encomienda" ? 4500 : 2500;
  const total = subtotal + deliveryCost;

  const getDeliveryTime = (mode: ServiceMode) => {
    if (mode === "express") return "2-4 horas en Ciudad Quesada";
    if (mode === "encomienda") return "24-48 horas";
    return "Diagonal a Pali";
  };

  const addToCart = (partId: string, qty = 1) => {
    setCart((current) => {
      const existing = current.find((i) => i.partId === partId);
      if (existing) {
        return current.map((i) => (i.partId === partId ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...current, { partId, quantity: qty }];
    });
    const part = catalogParts.find((p) => p.id === partId);
    setToast({ message: `${part?.name} agregado al carrito`, type: "success" });
  };

  const changeQuantity = (partId: string, delta: number) => {
    setCart((current) =>
      current.map((item) => (item.partId === partId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)),
    );
  };

  const removeFromCart = (partId: string) => {
    setCart((current) => current.filter((i) => i.partId !== partId));
    setToast({ message: "Producto eliminado", type: "success" });
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  const orderSummary = encodeURIComponent(
    `Hola ${BUSINESS_NAME}\n\n` +
      `Quiero confirmar este pedido:\n\n` +
      cartDetails.map((item) => `- ${item.name} (${item.brand} ${item.model}) x${item.quantity}: ${currency.format(item.lineTotal)}`).join("\n") +
      `\n\nServicio: ${serviceLabels[serviceMode]} (${getDeliveryTime(serviceMode)})\n` +
      `Ubicacion: ${location || "Por definir"}\n` +
      `Notas: ${deliveryNotes || "Sin notas adicionales"}\n\n` +
      `Total estimado: ${currency.format(total)}\n\n` +
      `Me confirman stock y disponibilidad, por favor.`,
  );

  const workshopSummary = encodeURIComponent(
    `Hola ${BUSINESS_NAME}\n\n` +
      `Quiero agendar taller de mecanica:\n\n` +
      `Servicio: ${workshopLabels[workshopJob]}\n` +
      `Fecha preferida: ${workshopDate || "Por definir"}\n` +
      `Urgencia: ${urgency.toUpperCase()}\n` +
      `Moto: ${motoBrand || "-"} ${motoModel || "-"} (${motoYear || "-"})\n` +
      `Detalle / falla: ${workshopDetails || "Por definir"}\n\n` +
      `Me confirman espacio, por favor.`,
  );

  return (
    <main className="min-h-screen bg-[#07090d] text-zinc-100 selection:bg-yellow-300 selection:text-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#07090d]/70 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-white/[0.03]" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-yellow-300/35 bg-black/55 p-1 shadow-[0_0_34px_rgba(234,179,8,0.3)]">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.22),transparent_68%)]" />
              <img
                src="/parce.jpg"
                alt="Logo Parce Motos Virtual CR"
                className="relative h-full w-full rounded-full object-cover opacity-95 shadow-inner [mask-image:radial-gradient(circle,black_58%,rgba(0,0,0,0.88)_70%,transparent_82%)]"
              />
            </div>
            <div>
              <div className="text-xl font-black leading-none tracking-tight text-white md:text-2xl">{BUSINESS_NAME}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[2px] text-blue-300">{BUSINESS_LOCATION}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <a href="#catalogo" className="hidden rounded-lg px-4 py-2 hover:bg-white/5 md:block">Catalogo</a>
            <a href="#taller" className="hidden rounded-lg px-4 py-2 hover:bg-white/5 md:block">Taller</a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold transition hover:bg-white/10"
            >
              <ShoppingCart size={18} />
              <span>Carrito</span>
              {cartCount > 0 && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-300 text-xs font-black text-zinc-950">
                  {cartCount}
                </div>
              )}
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              className="hidden items-center gap-2 rounded-xl bg-yellow-300 px-4 py-2 font-black text-zinc-950 transition hover:bg-yellow-200 md:flex"
            >
              <PhoneCall size={17} /> 62200006
            </a>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#07090d]">
        <div className="absolute inset-0 bg-[url('/moto1.jpg')] bg-cover bg-center opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,179,8,0.25),transparent_34%),radial-gradient(circle_at_80%_35%,rgba(37,99,235,0.22),transparent_30%),linear-gradient(90deg,rgba(7,9,13,0.92),rgba(7,9,13,0.68)_48%,rgba(7,9,13,0.9)),linear-gradient(180deg,rgba(7,9,13,0.35),#07090d_92%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-12 md:px-8 md:py-20">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-4 py-1 text-xs font-black uppercase tracking-[2px] text-yellow-200">
              <MapPin size={14} /> Ciudad Quesada - diagonal a Pali
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl">
              Accesorios, repuestos y taller de mecánica.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              En {BUSINESS_NAME} resolvemos por WhatsApp y en tienda: combos, cascos, suavizador de clutch Flat Morez,
              patillas de cambios, marcas Shadows y On.Wheels, todo para 2T y bici motos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catalogo" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-yellow-300 px-8 py-4 text-lg font-black text-zinc-950 transition active:scale-[0.985]">
                Ver catalogo <ShoppingCart size={22} />
              </a>
              <a href="#taller" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold backdrop-blur transition hover:bg-white/15">
                Agendar taller <CalendarClock size={22} />
              </a>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-yellow-300/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-3 shadow-2xl backdrop-blur-md">
                <div className="grid gap-3">
                  <div className="relative h-64 overflow-hidden rounded-[1.5rem] border border-yellow-300/20 bg-zinc-950">
                    <img src="/moto2.jpg" alt="Vista de tienda Parce Motos" className="h-full w-full object-cover opacity-95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs font-black uppercase tracking-[2px] text-yellow-200">Tienda fisica</div>
                      <div className="mt-1 text-2xl font-black text-white">Accesorios y repuestos listos</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                      <img src="/moto3.jpg" alt="Productos y taller de Parce Motos" className="h-32 w-full object-cover opacity-90" />
                    </div>
                    <div className="rounded-2xl border border-yellow-300/25 bg-[#0d1118]/90 p-4">
                      <div className="text-sm font-black uppercase tracking-[2px] text-blue-300">Prod prototype</div>
                      <div className="mt-3 text-2xl font-black text-yellow-300">Parce Motos</div>
                      <div className="text-lg font-black text-blue-400">Virtual CR</div>
                    </div>
                  </div>

                  <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-4 text-sm text-zinc-300">
                    <div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={16} /> Tienda de accesorios y repuestos</div>
                    <div className="flex items-center gap-2"><Wrench className="text-yellow-300" size={16} /> Taller de mecanica local</div>
                    <div className="flex items-center gap-2"><PhoneCall className="text-blue-300" size={16} /> WhatsApp 62200006</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-white/10 bg-[#101216] py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm text-zinc-400 md:justify-between">
          <div className="font-medium">Lineas destacadas:</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-bold text-zinc-200">
            Shadows / On.Wheels / 2T / Bici motos / Cascos / Combos
          </div>
          <div className="hidden items-center gap-2 text-emerald-400 md:flex">
            <ShieldCheck /> Confirmacion por WhatsApp antes de entregar
          </div>
        </div>
      </div>

      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="text-yellow-300" />
              <h2 className="text-3xl font-black tracking-tight">Catalogo de productos</h2>
            </div>
            <p className="mt-1 text-zinc-400">Busca accesorios, repuestos, combos y piezas para taller.</p>
          </div>
          <div className="text-sm text-zinc-400">
            Mostrando <span className="font-bold text-white">{filteredParts.length}</span> productos
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#101216] p-5">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-zinc-500" size={18} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar casco, clutch, 2T, bici moto..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3.5 pl-11 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:border-yellow-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-7">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-sm outline-none focus:border-yellow-300"
              >
                {brands.map((b) => <option key={b}>{b}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-sm outline-none focus:border-yellow-300"
              >
                <option value="relevance">Ordenar por relevancia</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm md:col-span-12">
              <div className="font-medium text-zinc-400">Precio:</div>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(+e.target.value)} className="w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm" placeholder="Min" />
              <span className="text-zinc-500">a</span>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm" placeholder="Max" />
              <button onClick={() => { setMinPrice(0); setMaxPrice(60000); }} className="ml-2 text-xs text-yellow-300 hover:underline">Limpiar rango</button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 md:col-span-12">
              {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-2xl px-5 py-2 text-sm font-bold transition ${
                    activeCategory === cat
                      ? "bg-yellow-300 text-zinc-950"
                      : "border border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredParts.map((part) => (
            <article key={part.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101216] transition hover:-translate-y-0.5 hover:border-yellow-300/50">
              <div className="relative h-48 overflow-hidden bg-zinc-950">
                <img
                  src={part.image}
                  alt={part.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black ${stockBadgeClasses[part.stockLevel]}`}>
                  {part.stock}
                </div>
              </div>

              <div className="p-5">
                <div className="text-xs font-black uppercase tracking-widest text-blue-300">{categoryLabels[part.category]}</div>
                <h3 className="mt-1.5 line-clamp-2 text-lg font-black leading-tight">{part.name}</h3>
                <p className="text-sm text-zinc-400">{part.brand} / {part.model}</p>
                <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{part.description}</p>

                <div className="mt-5 flex flex-col gap-3">
                  <div>
                    <div className="text-xs text-zinc-500">Precio estimado</div>
                    <div className="text-2xl font-black tracking-tight">{currency.format(part.price)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPart(part)}
                      className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/5"
                    >
                      Detalles
                    </button>
                    <button
                      onClick={() => addToCart(part.id)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-2.5 text-sm font-black text-zinc-950 active:bg-yellow-200"
                    >
                      <Plus size={17} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="border-y border-white/10 bg-[#101216] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center">
            <div className="inline-block rounded-full bg-yellow-300/10 px-4 py-1 text-xs font-black tracking-[2px] text-yellow-200">COMPRA RAPIDA</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Listo para prototipo de venta</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { icon: <Search size={28} />, title: "1. Busca", desc: "Filtra por producto, marca o categoria." },
              { icon: <ShoppingCart size={28} />, title: "2. Cotiza", desc: "Agrega al carrito para armar el pedido." },
              { icon: <Truck size={28} />, title: "3. Coordina", desc: "Express, encomienda o retiro en Ciudad Quesada." },
              { icon: <PhoneCall size={28} />, title: "4. Confirma", desc: "WhatsApp valida stock, precio final y taller." },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-[#07090d] p-6">
                <div className="mb-4 text-yellow-300">{step.icon}</div>
                <div className="text-xl font-black">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-[2px] text-blue-300">ESPECIALIDADES</div>
          <h3 className="text-3xl font-black tracking-tight">Lo mas pedido en Parce Motos</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { title: "Combos y cascos", text: "Opciones listas para salir protegido, con marcas Shadows y On.Wheels.", image: "/moto1.jpg" },
            { title: "2T y bici motos", text: "Repuestos, consumibles y orientacion para motores 2T y bici motos.", image: "/moto2.jpg" },
            { title: "Taller mecanico", text: "Instalacion, revision, mantenimiento y reparacion en Ciudad Quesada.", image: "/moto3.jpg" },
          ].map((item) => (
            <div key={item.title} className="overflow-hidden rounded-2xl border border-white/10 bg-[#101216]">
              <div className="relative h-40 bg-zinc-950">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101216] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <Star className="text-yellow-300" size={20} fill="currentColor" />
                <div className="mt-4 text-xl font-black">{item.title}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="taller" className="border-t border-white/10 bg-[#101216] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-1 text-xs font-black uppercase tracking-[2px] text-yellow-200">
                <Wrench size={15} /> Taller de mecanica
              </div>
              <h2 className="mt-4 text-4xl font-black leading-none tracking-tight">Agenda instalacion, revision o reparacion.</h2>
              <p className="mt-4 text-lg text-zinc-400">
                Estamos ubicados en {BUSINESS_LOCATION}. Completa el formulario y se abre WhatsApp con el detalle listo.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/10 bg-[#07090d] p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-white/70">TIPO DE SERVICIO</label>
                    <select value={workshopJob} onChange={(e) => setWorkshopJob(e.target.value as WorkshopJob)} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm">
                      {Object.entries(workshopLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/70">FECHA PREFERIDA</label>
                    <input type="date" value={workshopDate} onChange={(e) => setWorkshopDate(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/70">MARCA DE TU MOTO</label>
                    <input value={motoBrand} onChange={(e) => setMotoBrand(e.target.value)} placeholder="Honda, Yamaha, bici moto..." className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/70">MODELO</label>
                      <input value={motoModel} onChange={(e) => setMotoModel(e.target.value)} placeholder="XR150, 2T..." className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/70">ANO</label>
                      <input value={motoYear} onChange={(e) => setMotoYear(e.target.value)} placeholder="2022" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-xs font-bold text-white/70">DETALLE DE LA FALLA O TRABAJO</label>
                  <textarea value={workshopDetails} onChange={(e) => setWorkshopDetails(e.target.value)} rows={4} placeholder="Ej: instalar suavizador de clutch, revisar frenos, motor 2T no enciende..." className="mt-1.5 w-full resize-y rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm" />
                </div>

                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-white/70">URGENCIA</label>
                    <div className="mt-1.5 flex rounded-2xl border border-white/10 bg-zinc-950 p-1 text-sm">
                      {(["baja", "media", "alta"] as const).map((u) => (
                        <button key={u} onClick={() => setUrgency(u)} className={`flex-1 rounded-[14px] py-2 font-bold capitalize transition ${urgency === u ? "bg-yellow-300 text-zinc-950" : "hover:bg-white/5"}`}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${workshopSummary}`} target="_blank" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-yellow-300 py-4 text-center text-sm font-black text-zinc-950 active:bg-yellow-200">
                    SOLICITAR CITA POR WHATSAPP <CalendarClock size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#07090d] py-10 text-sm text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-y-6 md:flex-row">
            <div>
              <div className="flex items-center gap-2 text-xl font-black text-white"><Bike /> {BUSINESS_NAME}</div>
              <div className="mt-1">{BUSINESS_LOCATION}</div>
              <div className="mt-1">WhatsApp 62200006</div>
            </div>
            <div className="text-left text-xs md:text-right">
              (c) {new Date().getFullYear()} {BUSINESS_NAME}. Todos los derechos reservados.<br />
              Accesorios, repuestos y taller de mecánica.
            </div>
          </div>
        </div>
      </footer>

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/70" onClick={() => setIsCartOpen(false)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#07090d] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-yellow-300">TU PEDIDO</div>
                <div className="text-2xl font-black">{cartCount} productos</div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 hover:bg-white/10"><X size={22} /></button>
            </div>

            {cartDetails.length === 0 ? (
              <div className="mt-12 text-center">
                <ShoppingCart className="mx-auto text-zinc-700" size={48} />
                <p className="mt-4 font-bold">Tu carrito esta vacio</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-6 text-sm text-yellow-300 hover:underline">Explorar productos</button>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-3">
                  {cartDetails.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                      <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <div className="flex-1 text-sm">
                        <div className="font-bold leading-tight">{item.name}</div>
                        <div className="text-xs text-zinc-400">{item.brand} {item.model}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-white/10">
                            <button onClick={() => changeQuantity(item.id, -1)} className="px-2 py-1"><Minus size={14} /></button>
                            <span className="px-3 font-mono text-sm">{item.quantity}</span>
                            <button onClick={() => changeQuantity(item.id, 1)} className="px-2 py-1"><Plus size={14} /></button>
                          </div>
                          <div className="font-black text-yellow-300">{currency.format(item.lineTotal)}</div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="self-start text-zinc-500 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <div className="mb-3 text-xs font-black uppercase tracking-widest text-white/60">TIPO DE SERVICIO</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["express", "encomienda", "retirar"] as ServiceMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setServiceMode(mode)}
                        className={`rounded-2xl border p-3 text-left text-xs transition ${serviceMode === mode ? "border-yellow-300 bg-yellow-300/10" : "border-white/10 hover:bg-white/5"}`}
                      >
                        <div className="font-bold">{serviceLabels[mode]}</div>
                        <div className="mt-0.5 text-[10px] text-zinc-400">{getDeliveryTime(mode)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm">
                  <div>
                    <label className="text-xs font-bold text-white/70">UBICACION O DIRECCION</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ciudad Quesada, barrio, referencia..." className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/70">NOTAS ADICIONALES</label>
                    <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={2} placeholder="Modelo de moto, talla de casco, horario preferido..." className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm" />
                  </div>
                </div>

                <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{currency.format(subtotal)}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>{serviceLabels[serviceMode]} ({getDeliveryTime(serviceMode)})</span><span>{currency.format(deliveryCost)}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-black"><span>Total estimado</span><span>{currency.format(total)}</span></div>
                </div>

                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${orderSummary}`} target="_blank" className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-yellow-300 py-4 text-lg font-black text-zinc-950 active:bg-yellow-200">
                  CONFIRMAR POR WHATSAPP <PhoneCall size={20} />
                </a>

                <button onClick={clearCart} className="mt-3 w-full text-center text-xs text-zinc-500 hover:text-red-400">Vaciar carrito</button>
              </>
            )}
          </div>
        </div>
      )}

      {selectedPart && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPart(null)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101216]" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedPart.image} alt={selectedPart.name} className="h-72 w-full object-cover" />
              <button onClick={() => setSelectedPart(null)} className="absolute right-4 top-4 rounded-full bg-black/60 p-2"><X /></button>
            </div>
            <div className="p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-blue-300">{categoryLabels[selectedPart.category]}</div>
                  <h3 className="mt-1 text-3xl font-black tracking-tight">{selectedPart.name}</h3>
                  <p className="text-lg text-zinc-400">{selectedPart.brand} / {selectedPart.model}</p>
                </div>
                <div className="md:text-right">
                  <div className="text-3xl font-black tracking-tighter">{currency.format(selectedPart.price)}</div>
                  <div className="text-xs text-emerald-400">{selectedPart.stock}</div>
                </div>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-zinc-300">{selectedPart.description}</p>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { addToCart(selectedPart.id, 1); setSelectedPart(null); }} className="flex-1 rounded-2xl bg-yellow-300 py-4 text-lg font-black text-zinc-950">AGREGAR AL CARRITO</button>
                <button onClick={() => setSelectedPart(null)} className="flex-1 rounded-2xl border border-white/20 py-4 font-bold">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-medium shadow-xl ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}
