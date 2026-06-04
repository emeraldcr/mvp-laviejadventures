"use client";

import { useEffect, useMemo, useState } from "react";
import {
 ShieldCheck, Bike, CalendarClock, CheckCircle2, Clock3, LocateFixed, MapPin, Minus, PackageCheck,
  PhoneCall, Plus, Search, ShoppingCart, SlidersHorizontal, Star, Trash2, Truck, Wrench, X,
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
type ServiceMode = "express" | "encomienda" | "carretera";
type WorkshopJob = "revision" | "reparacion" | "instalacion" | "mantenimiento";

const parts: Part[] = [
  {
    id: "1", name: "Pastillas de freno delanteras", category: "frenos", brand: "Honda", model: "XR 150",
    price: 12500, stock: "Disponible hoy", stockLevel: "high",
    description: "Compuesto semi-metálico de alto rendimiento para uso diario, lluvia y caminos mixtos.",
    image: "https://picsum.photos/id/1015/600/400",
  },
  {
    id: "2", name: "Aceite sintético 10W-40", category: "aceites", brand: "Yamaha", model: "FZ / XTZ",
    price: 6900, stock: "24 unidades", stockLevel: "high",
    description: "Lubricante de alto rendimiento para motores de 4 tiempos. Ideal para condiciones tropicales.",
    image: "https://picsum.photos/id/160/600/400",
  },
  {
    id: "3", name: "Llanta trasera 120/80-18", category: "llantas", brand: "Honda", model: "Tornado / XR",
    price: 48500, stock: "Bajo pedido", stockLevel: "low",
    description: "Dibujo multipropósito excelente para carretera, lastre y entrada a finca.",
    image: "https://picsum.photos/id/201/600/400",
  },
  {
    id: "4", name: "Kit cadena + sprockets reforzado", category: "cadena", brand: "Suzuki", model: "GN 125",
    price: 32900, stock: "Disponible hoy", stockLevel: "high",
    description: "Cadena reforzada + sprockets delantero y trasero. Listo para instalar.",
    image: "https://picsum.photos/id/251/600/400",
  },
  {
    id: "5", name: "Batería sellada 12V 7Ah", category: "electrico", brand: "AKT", model: "NKD / Pulsar",
    price: 27800, stock: "8 unidades", stockLevel: "medium",
    description: "Batería libre de mantenimiento con excelente respuesta de arranque.",
    image: "https://picsum.photos/id/103/600/400",
  },
  {
    id: "6", name: "Disco de freno ventilado", category: "frenos", brand: "Bajaj", model: "Pulsar 180/200",
    price: 23800, stock: "Disponible hoy", stockLevel: "high",
    description: "Frenado estable y duradero tanto en ciudad como en carretera.",
    image: "https://picsum.photos/id/106/600/400",
  },
  {
    id: "7", name: "Filtro de aceite + junta", category: "aceites", brand: "Yamaha", model: "XTZ 250",
    price: 4200, stock: "18 unidades", stockLevel: "high",
    description: "Filtro de recambio original para mantenimiento preventivo.",
    image: "https://picsum.photos/id/107/600/400",
  },
  {
    id: "8", name: "Direccionales LED completas", category: "electrico", brand: "Universal", model: "12V",
    price: 9800, stock: "Disponible hoy", stockLevel: "high",
    description: "Par de direccionales LED compactas y brillantes. Fácil instalación.",
    image: "https://picsum.photos/id/29/600/400",
  },
];

const categoryLabels = motoPartCategoryLabels;

const serviceLabels: Record<ServiceMode, string> = {
  express: "Express local", encomienda: "Encomienda", carretera: "Atención en carretera",
};

const workshopLabels: Record<WorkshopJob, string> = {
  revision: "Revisión general", reparacion: "Reparación", instalacion: "Instalación de repuestos", mantenimiento: "Mantenimiento preventivo",
};

const currency = new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

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

  // Persistencia del carrito
  useEffect(() => {
    const saved = localStorage.getItem("rutaMotoCart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("rutaMotoCart", JSON.stringify(cart));
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

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const brands = useMemo(() => ["Todas", ...Array.from(new Set(catalogParts.map(p => p.brand)))], [catalogParts]);

  const filteredParts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    let result = catalogParts.filter(part => {
      const matchesCategory = activeCategory === "all" || part.category === activeCategory;
      const matchesBrand = selectedBrand === "Todas" || part.brand === selectedBrand;
      const matchesSearch = normalized.length === 0 || 
        `${part.name} ${part.brand} ${part.model}`.toLowerCase().includes(normalized);
      const matchesPrice = part.price >= minPrice && part.price <= maxPrice;
      return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
    });

    // Ordenamiento
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);

    return result;
  }, [activeCategory, catalogParts, searchTerm, selectedBrand, sortBy, minPrice, maxPrice]);

  const cartDetails = useMemo(() => {
    return cart.map(item => {
      const part = catalogParts.find(p => p.id === item.partId);
      if (!part) return null;
      return { ...part, quantity: item.quantity, lineTotal: item.quantity * part.price };
    }).filter(Boolean) as any[];
  }, [cart, catalogParts]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);

  const deliveryCost = cartDetails.length === 0 ? 0 : 
    serviceMode === "carretera" ? 9500 : serviceMode === "encomienda" ? 4500 : 2500;

  const total = subtotal + deliveryCost;

  const getDeliveryTime = (mode: ServiceMode) => {
    if (mode === "express") return "2-4 horas";
    if (mode === "encomienda") return "24-48 horas";
    return "Según ubicación (te coordinamos)";
  };

  const addToCart = (partId: string, qty = 1) => {
    setCart(current => {
      const existing = current.find(i => i.partId === partId);
      if (existing) {
        return current.map(i => i.partId === partId ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...current, { partId, quantity: qty }];
    });
    const part = catalogParts.find(p => p.id === partId);
    setToast({ message: `${part?.name} agregado al carrito`, type: "success" });
  };

  const changeQuantity = (partId: string, delta: number) => {
    setCart(current =>
      current.map(item => item.partId === partId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
    );
  };

  const removeFromCart = (partId: string) => {
    setCart(current => current.filter(i => i.partId !== partId));
    setToast({ message: "Producto eliminado", type: "success" });
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  // WhatsApp messages
  const orderSummary = encodeURIComponent(
    `Hola RUTA MOTO 👋\n\n` +
    `Quiero realizar el siguiente pedido:\n\n` +
    cartDetails.map(item => `• ${item.name} (${item.brand} ${item.model}) ×${item.quantity} — ${currency.format(item.lineTotal)}`).join("\n") +
    `\n\nServicio: ${serviceLabels[serviceMode]} (${getDeliveryTime(serviceMode)})\n` +
    `Ubicación: ${location || "Por definir"}\n` +
    `Notas: ${deliveryNotes || "Sin notas adicionales"}\n\n` +
    `Total estimado: ${currency.format(total)}\n\n` +
    `¿Me pueden confirmar stock y hora de entrega?`
  );

  const workshopSummary = encodeURIComponent(
    `Hola RUTA MOTO 👋\n\n` +
    `Quiero agendar cita de taller:\n\n` +
    `Servicio: ${workshopLabels[workshopJob]}\n` +
    `Fecha preferida: ${workshopDate || "Por definir"}\n` +
    `Urgencia: ${urgency.toUpperCase()}\n` +
    `Moto: ${motoBrand || "—"} ${motoModel || "—"} (${motoYear || "—"})\n` +
    `Detalle / Falla: ${workshopDetails || "Por definir"}\n\n` +
    `¿Me pueden confirmar la cita?`
  );

  const showPartModal = (part: Part) => setSelectedPart(part);

  return (
    <main className="min-h-screen bg-[#0a0f14] text-zinc-100 selection:bg-cyan-400 selection:text-zinc-950">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f14]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-zinc-950">
              <Bike size={22} />
            </div>
            <div>
              <div className="font-black text-2xl tracking-[-1.5px]">RUTA MOTO</div>
              <div className="text-[10px] text-zinc-500 -mt-1">SAN CARLOS • ZONA NORTE</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <a href="#catalogo" className="hidden rounded-lg px-4 py-2 hover:bg-white/5 md:block">Catálogo</a>
            <a href="#como-funciona" className="hidden rounded-lg px-4 py-2 hover:bg-white/5 md:block">Cómo funciona</a>
            <a href="#taller" className="hidden rounded-lg px-4 py-2 hover:bg-white/5 md:block">Taller</a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold transition hover:bg-white/10"
            >
              <ShoppingCart size={18} />
              <span>Carrito</span>
              {cartCount > 0 && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-zinc-950">
                  {cartCount}
                </div>
              )}
            </button>

            <a
              href="https://wa.me/50662332535"
              target="_blank"
              className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2 font-black text-zinc-950 transition hover:bg-zinc-200 md:flex"
            >
              <PhoneCall size={17} /> WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0a0f14]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=2000&q=80')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f14] via-[#0a0f14]/90 to-[#0a0f14]" />
        
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center md:py-24 md:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[3px] text-cyan-300">
            <Bike size={14} /> ZONA NORTE • COSTA RICA
          </div>
          
          <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-[-2.5px] text-white sm:text-6xl md:text-7xl">
            Repuestos y taller<br />para tu moto.<br />Sin complicaciones.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-300">
            La mejor selección de repuestos + servicio express, encomienda o atención en carretera. 
            Agenda tu taller en minutos.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#catalogo" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-black text-zinc-950 transition active:scale-[0.985]">
              Ver repuestos <ShoppingCart size={22} />
            </a>
            <a href="#taller" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur transition hover:bg-white/10">
              Agendar taller <CalendarClock size={22} />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-zinc-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={16} /> +500 repuestos</div>
            <div className="flex items-center gap-2"><Clock3 className="text-amber-400" size={16} /> Entrega 2-4h express</div>
            <div className="flex items-center gap-2"><Star className="text-yellow-400" size={16} /> 98% satisfacción</div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-b border-white/10 bg-[#10161b] py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm text-zinc-400 md:justify-between">
          <div className="font-medium">Marcas que trabajamos:</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-bold text-zinc-300">
            Honda • Yamaha • Suzuki • Bajaj • AKT • Universal
          </div>
          <div className="hidden items-center gap-2 text-emerald-400 md:flex">
            <ShieldCheck /> Garantía de repuestos • Pago contra entrega
          </div>
        </div>
      </div>

      {/* CATÁLOGO */}
      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="text-cyan-400" />
              <h2 className="text-3xl font-black tracking-tight">Catálogo de repuestos</h2>
            </div>
            <p className="mt-1 text-zinc-400">Filtra por categoría, marca o precio. Todo listo para entregar.</p>
          </div>
          <div className="text-sm text-zinc-400">
            Mostrando <span className="font-bold text-white">{filteredParts.length}</span> productos
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-[#11181f] p-5">
          <div className="grid gap-4 md:grid-cols-12">
            {/* Búsqueda */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-zinc-500" size={18} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, marca o modelo..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3.5 pl-11 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Marca + Ordenar */}
            <div className="grid grid-cols-2 gap-4 md:col-span-7">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-sm outline-none focus:border-cyan-400"
              >
                {brands.map(b => <option key={b}>{b}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-sm outline-none focus:border-cyan-400"
              >
                <option value="relevance">Ordenar por relevancia</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
              </select>
            </div>

            {/* Rango de precio */}
            <div className="md:col-span-12 flex flex-wrap items-center gap-3 pt-1 text-sm">
              <div className="font-medium text-zinc-400">Precio:</div>
              <input type="number" value={minPrice} onChange={e => setMinPrice(+e.target.value)} className="w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm" placeholder="Mín" />
              <span className="text-zinc-500">—</span>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} className="w-28 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm" placeholder="Máx" />
              <button onClick={() => { setMinPrice(0); setMaxPrice(60000); }} className="ml-2 text-xs text-cyan-400 hover:underline">Limpiar rango</button>
            </div>

            {/* Categorías */}
            <div className="md:col-span-12 flex flex-wrap gap-2 pt-2">
              {(Object.keys(categoryLabels) as Category[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-2xl px-5 py-2 text-sm font-bold transition ${activeCategory === cat 
                    ? "bg-cyan-400 text-zinc-950" 
                    : "border border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredParts.map(part => {
            const stockColor = part.stockLevel === "high" ? "emerald" : part.stockLevel === "medium" ? "amber" : "rose";
            return (
              <article key={part.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-[#11181f] transition hover:border-white/20">
                <div className="relative h-48 overflow-hidden bg-zinc-950">
                  <img 
                    src={part.image} 
                    alt={part.name} 
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105" 
                  />
                  <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold bg-${stockColor}-400/90 text-white`}>
                    {part.stock}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">{categoryLabels[part.category]}</div>
                      <h3 className="mt-1.5 line-clamp-2 text-lg font-black leading-tight">{part.name}</h3>
                      <p className="text-sm text-zinc-400">{part.brand} • {part.model}</p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{part.description}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-500">Precio</div>
                      <div className="text-2xl font-black tracking-tight">{currency.format(part.price)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => showPartModal(part)}
                        className="rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/5"
                      >
                        Ver detalles
                      </button>
                      <button 
                        onClick={() => addToCart(part.id)}
                        className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-black text-zinc-950 active:bg-cyan-300"
                      >
                        <Plus size={17} /> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-white/10 bg-[#10161b] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center">
            <div className="inline-block rounded-full bg-white/5 px-4 py-1 text-xs font-bold tracking-[2px] text-cyan-300">PROCESO SIMPLE</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Así de fácil es comprar con nosotros</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { icon: <Search size={28} />, title: "1. Busca y filtra", desc: "Encuentra el repuesto por categoría, marca o modelo en segundos." },
              { icon: <ShoppingCart size={28} />, title: "2. Agrega al carrito", desc: "Elige cantidad y agrega. Puedes seguir comprando sin problema." },
              { icon: <Truck size={28} />, title: "3. Elige servicio", desc: "Express local, encomienda o atención en carretera según tu urgencia." },
              { icon: <PhoneCall size={28} />, title: "4. Confirma por WA", desc: "Te contactamos en minutos para confirmar stock y coordinar entrega." },
            ].map((step, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-[#11181f] p-6">
                <div className="mb-4 text-cyan-400">{step.icon}</div>
                <div className="text-xl font-black">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[2px] text-amber-400">DE NUESTROS CLIENTES</div>
            <h3 className="text-3xl font-black tracking-tight">Lo que dicen en San Carlos y Zona Norte</h3>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { name: "Carlos Ramírez", moto: "Honda XR150", text: "Pedí las pastillas de freno un martes a las 10am y me las llevaron a la finca a las 2pm. Calidad original y precio justo. Recomendadísimo.", rating: 5 },
            { name: "María López", moto: "Yamaha FZ", text: "El kit de cadena llegó perfecto. Me explicaron todo por WhatsApp y el servicio de encomienda fue rápido. Ya soy cliente frecuente.", rating: 5 },
            { name: "Andrés Vargas", moto: "Bajaj Pulsar", text: "Tuve una falla en carretera cerca de La Tigra. Me atendieron en menos de una hora. Muy profesionales y buena atención.", rating: 5 },
          ].map((t, i) => (
            <div key={i} className="rounded-3xl border border-white/10 bg-[#11181f] p-6">
              <div className="flex gap-1 text-yellow-400">
                {Array.from({ length: t.rating }).map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">“{t.text}”</p>
              <div className="mt-5 text-sm">
                <span className="font-bold">{t.name}</span> <span className="text-zinc-500">• {t.moto}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TALLER */}
      <section id="taller" className="border-t border-white/10 bg-[#10161b] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[2px] text-amber-300">
                <Wrench size={15} /> TALLER ESPECIALIZADO
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-[-1.5px] leading-none">Deja tu moto en manos de expertos locales.</h2>
              <p className="mt-4 text-lg text-zinc-400">Revisión, reparación, instalación de repuestos o mantenimiento preventivo. Agenda en menos de 2 minutos.</p>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-[#11181f] p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-white/70">TIPO DE SERVICIO</label>
                    <select value={workshopJob} onChange={e => setWorkshopJob(e.target.value as any)} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm">
                      {Object.entries(workshopLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/70">FECHA PREFERIDA</label>
                    <input type="date" value={workshopDate} onChange={e => setWorkshopDate(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/70">MARCA DE TU MOTO</label>
                    <input value={motoBrand} onChange={e => setMotoBrand(e.target.value)} placeholder="Honda, Yamaha..." className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-white/70">MODELO</label>
                      <input value={motoModel} onChange={e => setMotoModel(e.target.value)} placeholder="XR150, FZ..." className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/70">AÑO</label>
                      <input value={motoYear} onChange={e => setMotoYear(e.target.value)} placeholder="2022" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-xs font-bold text-white/70">DETALLE DE LA FALLA O TRABAJO</label>
                  <textarea value={workshopDetails} onChange={e => setWorkshopDetails(e.target.value)} rows={4} placeholder="Ej: No enciende, quiero cambio de aceite + revisión de frenos..." className="mt-1.5 w-full resize-y rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm" />
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-white/70">URGENCIA</label>
                    <div className="mt-1.5 flex rounded-2xl border border-white/10 bg-zinc-950 p-1 text-sm">
                      {(["baja", "media", "alta"] as const).map(u => (
                        <button key={u} onClick={() => setUrgency(u)} className={`flex-1 rounded-[14px] py-2 font-bold capitalize transition ${urgency === u ? "bg-amber-400 text-zinc-950" : "hover:bg-white/5"}`}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <a href={`https://wa.me/50662332535?text=${workshopSummary}`} target="_blank" className="mt-6 inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 text-center text-sm font-black text-zinc-950 active:bg-amber-300">
                    SOLICITAR CITA POR WHATSAPP <CalendarClock size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0a0f14] py-10 text-sm text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-y-6 md:flex-row">
            <div>
              <div className="flex items-center gap-2 font-black text-xl text-white"><Bike /> RUTA MOTO</div>
              <div className="mt-1">San Carlos, Zona Norte, Costa Rica</div>
            </div>
            <div className="text-right text-xs">
              © {new Date().getFullYear()} RUTA MOTO. Todos los derechos reservados.<br />
              Repuestos originales y de alta calidad • Servicio local con garantía.
            </div>
          </div>
        </div>
      </footer>

      {/* DRAWER DEL CARRITO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/70" onClick={() => setIsCartOpen(false)}>
          <div 
            className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0f14] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">TU PEDIDO</div>
                <div className="text-2xl font-black">{cartCount} repuestos</div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 hover:bg-white/10"><X size={22} /></button>
            </div>

            {cartDetails.length === 0 ? (
              <div className="mt-12 text-center">
                <ShoppingCart className="mx-auto text-zinc-700" size={48} />
                <p className="mt-4 font-bold">Tu carrito está vacío</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-6 text-sm text-cyan-400 hover:underline">Explorar repuestos</button>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-3">
                  {cartDetails.map(item => (
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
                          <div className="font-black text-cyan-300">{currency.format(item.lineTotal)}</div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="self-start text-zinc-500 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>

                {/* Servicio visual */}
                <div className="mt-8">
                  <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">TIPO DE SERVICIO</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["express", "encomienda", "carretera"] as ServiceMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setServiceMode(mode)}
                        className={`rounded-2xl border p-3 text-left text-xs transition ${serviceMode === mode ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 hover:bg-white/5"}`}
                      >
                        <div className="font-bold">{serviceLabels[mode]}</div>
                        <div className="mt-0.5 text-[10px] text-zinc-400">{getDeliveryTime(mode)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm">
                  <div>
                    <label className="text-xs font-bold text-white/70">UBICACIÓN O DIRECCIÓN</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Finca La Tigra, Liberia centro..." className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/70">NOTAS ADICIONALES</label>
                    <textarea value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} rows={2} placeholder="Punto de referencia, horario preferido, falla de la moto..." className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm" />
                  </div>
                </div>

                <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{currency.format(subtotal)}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>{serviceLabels[serviceMode]} ({getDeliveryTime(serviceMode)})</span><span>{currency.format(deliveryCost)}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-black"><span>Total estimado</span><span>{currency.format(total)}</span></div>
                </div>

                <a href={`https://wa.me/50662332535?text=${orderSummary}`} target="_blank" className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 py-4 text-lg font-black text-zinc-950 active:bg-cyan-300">
                  CONFIRMAR PEDIDO POR WHATSAPP <PhoneCall size={20} />
                </a>

                <button onClick={clearCart} className="mt-3 w-full text-center text-xs text-zinc-500 hover:text-red-400">Vaciar carrito</button>
              </>)}
          </div>
        </div>
      )}

      {/* MODAL DETALLE PRODUCTO */}
      {selectedPart && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPart(null)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#11181f]" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedPart.image} alt={selectedPart.name} className="h-72 w-full object-cover" />
              <button onClick={() => setSelectedPart(null)} className="absolute right-4 top-4 rounded-full bg-black/60 p-2"><X /></button>
            </div>
            <div className="p-7">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">{categoryLabels[selectedPart.category]}</div>
                  <h3 className="mt-1 text-3xl font-black tracking-tight">{selectedPart.name}</h3>
                  <p className="text-lg text-zinc-400">{selectedPart.brand} • {selectedPart.model}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black tracking-tighter">{currency.format(selectedPart.price)}</div>
                  <div className="text-xs text-emerald-400">{selectedPart.stock}</div>
                </div>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-zinc-300">{selectedPart.description}</p>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { addToCart(selectedPart.id, 1); setSelectedPart(null); }} className="flex-1 rounded-2xl bg-cyan-400 py-4 text-lg font-black text-zinc-950">AGREGAR AL CARRITO</button>
                <button onClick={() => setSelectedPart(null)} className="flex-1 rounded-2xl border border-white/20 py-4 font-bold">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-medium shadow-xl ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}
