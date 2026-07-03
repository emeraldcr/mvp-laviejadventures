import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { getStoreSettings, type StoreSettings } from "@/lib/models/store-settings";

export type StoreProductCategory =
  | "packs"
  | "footwear"
  | "apparel"
  | "essentials"
  | "hydration"
  | "safety"
  | "camping"
  | "accessories";

export type StoreProductDoc = {
  _id?: unknown;
  slug: string;
  category: StoreProductCategory;
  brand?: string;
  image: string;
  price: number;
  priceCRC?: number;
  currency?: "USD" | "CRC";
  rating: number;
  featured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  stock?: number | null;
  tagEs: string;
  tagEn: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  useCaseEs: string;
  useCaseEn: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  category: StoreProductCategory;
  brand?: string;
  image: string;
  price: number;
  priceCRC?: number;
  currency: "USD" | "CRC";
  rating: number;
  featured: boolean;
  inStock: boolean;
  stockCount: number | null;
  tag: { es: string; en: string };
  name: { es: string; en: string };
  description: { es: string; en: string };
  useCase: { es: string; en: string };
};

export type StoreCatalogResponse = {
  products: StoreProduct[];
  settings: Pick<StoreSettings, "shippingFeeUSD" | "freeShippingThresholdUSD" | "currency" | "whatsappPhone">;
};

export const DEFAULT_STORE_PRODUCTS: Omit<StoreProductDoc, "_id">[] = [
  {
    slug: "mochila-rio-28l",
    category: "packs",
    image: "/image/IMG_6814.jpg",
    price: 89,
    rating: 4.9,
    featured: true,
    isActive: true,
    sortOrder: 1,
    stock: null,
    tagEs: "Favorito del cañón",
    tagEn: "Canyon favorite",
    nameEs: "Mochila Río 28L",
    nameEn: "River Pack 28L",
    descriptionEs:
      "Mochila ligera con soporte lumbar, funda impermeable y bolsillos rápidos para días largos en sendero y poza.",
    descriptionEn:
      "Lightweight pack with lumbar support, rain cover, and quick pockets for long trail and pool days.",
    useCaseEs: "Cañón · Pozas · Trekking",
    useCaseEn: "Canyon · Pools · Trekking",
  },
  {
    slug: "bota-grip-la-vieja",
    category: "footwear",
    image: "/image/IMG_5592.jpg",
    price: 124,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 2,
    stock: null,
    tagEs: "Río y roca",
    tagEn: "River & rock",
    nameEs: "Bota Grip La Vieja",
    nameEn: "La Vieja Grip Boot",
    descriptionEs:
      "Tracción profunda, secado rápido y puntera reforzada para piedra mojada y cruces de río con confianza.",
    descriptionEn:
      "Deep traction, quick-dry panels, and reinforced toe for wet rock and river crossings.",
    useCaseEs: "Ciudad Esmeralda · Rappel",
    useCaseEn: "Ciudad Esmeralda · Rappel",
  },
  {
    slug: "capa-esmeralda",
    category: "apparel",
    image: "/image/IMG_6810.jpg",
    price: 52,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 3,
    stock: null,
    tagEs: "Lluvia tropical",
    tagEn: "Tropical rain",
    nameEs: "Capa Esmeralda",
    nameEn: "Emerald Shell",
    descriptionEs:
      "Capa respirable para lluvia de montaña, empacable y lista cuando el clima cambia en San Carlos.",
    descriptionEn:
      "Breathable shell for mountain rain, packable when San Carlos weather shifts fast.",
    useCaseEs: "Bosque nuboso · Cañón",
    useCaseEn: "Cloud forest · Canyon",
  },
  {
    slug: "kit-explorador",
    category: "essentials",
    image: "/image/IMG_6806.jpg",
    price: 36,
    rating: 4.9,
    featured: false,
    isActive: true,
    sortOrder: 4,
    stock: null,
    tagEs: "Kit base",
    tagEn: "Base kit",
    nameEs: "Kit Explorador",
    nameEn: "Explorer Kit",
    descriptionEs:
      "Botella térmica, dry bag y multi-tool compacto para mantenerte listo en toda la aventura.",
    descriptionEn:
      "Thermal bottle, dry bag, and compact multi-tool to stay ready on every adventure.",
    useCaseEs: "Día completo · Familia",
    useCaseEn: "Full day · Family",
  },
  {
    slug: "sandalia-pozas",
    category: "footwear",
    image: "/image/IMG_4523.jpg",
    price: 74,
    rating: 4.6,
    featured: false,
    isActive: true,
    sortOrder: 5,
    stock: null,
    tagEs: "Agua + piedra",
    tagEn: "Water + stone",
    nameEs: "Sandalia Pozas",
    nameEn: "Pool Sandal",
    descriptionEs:
      "Sandalia anfibia con agarre flexible y correas de ajuste rápido para pozas cristalinas.",
    descriptionEn:
      "Amphibious sandal with flexible grip and quick-adjust straps for crystal pools.",
    useCaseEs: "Pozas · Kayak · Relax",
    useCaseEn: "Pools · Kayak · Chill",
  },
  {
    slug: "rinonera-sendero",
    category: "packs",
    image: "/image/IMG_4672.jpg",
    price: 58,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 6,
    stock: null,
    tagEs: "Ligera",
    tagEn: "Lightweight",
    nameEs: "Riñonera Sendero",
    nameEn: "Trail Hip Pack",
    descriptionEs:
      "Riñonera técnica para celular, snacks y documentos con tela repelente al agua.",
    descriptionEn:
      "Technical hip pack for phone, snacks, and docs with water-resistant fabric.",
    useCaseEs: "ATV · Caballo · Corto",
    useCaseEn: "ATV · Horse · Short",
  },
  // ── Calzado de marca ──────────────────────────────────────────────
  {
    slug: "nike-pegasus-trail",
    category: "footwear",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=70",
    price: 135,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 10,
    stock: null,
    tagEs: "Trail running",
    tagEn: "Trail running",
    nameEs: "Nike Pegasus Trail",
    nameEn: "Nike Pegasus Trail",
    descriptionEs: "Zapatilla de trail con amortiguación React y suela adherente para senderos húmedos de San Carlos.",
    descriptionEn: "Trail shoe with React cushioning and grippy outsole for wet San Carlos trails.",
    useCaseEs: "Sendero · Trail run",
    useCaseEn: "Trail · Trail run",
  },
  {
    slug: "adidas-terrex-swift",
    category: "footwear",
    brand: "Adidas Terrex",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=900&q=70",
    price: 139,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 11,
    stock: null,
    tagEs: "Aproximación",
    tagEn: "Approach",
    nameEs: "Adidas Terrex Swift R3",
    nameEn: "Adidas Terrex Swift R3",
    descriptionEs: "Calzado de aproximación con Continental Rubber para roca mojada y ascensos técnicos.",
    descriptionEn: "Approach shoe with Continental Rubber for wet rock and technical climbs.",
    useCaseEs: "Cañón · Roca",
    useCaseEn: "Canyon · Rock",
  },
  {
    slug: "hitec-altitude-vii",
    category: "footwear",
    brand: "Hi-Tec",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=70",
    price: 95,
    rating: 4.6,
    featured: false,
    isActive: true,
    sortOrder: 12,
    stock: null,
    tagEs: "Bota clásica",
    tagEn: "Classic boot",
    nameEs: "Hi-Tec Altitude VII WP",
    nameEn: "Hi-Tec Altitude VII WP",
    descriptionEs: "Bota impermeable de cuero con tobillera alta, la favorita costarricense para bosque nuboso.",
    descriptionEn: "Waterproof leather boot with high ankle support, a Costa Rican cloud-forest favorite.",
    useCaseEs: "Bosque nuboso · Trekking",
    useCaseEn: "Cloud forest · Trekking",
  },
  {
    slug: "merrell-moab-3",
    category: "footwear",
    brand: "Merrell",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=70",
    price: 118,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 13,
    stock: null,
    tagEs: "Best seller",
    tagEn: "Best seller",
    nameEs: "Merrell Moab 3 Ventilador",
    nameEn: "Merrell Moab 3 Ventilator",
    descriptionEs: "El zapato de hiking más vendido del mundo: ventilado, cómodo desde el primer día y con suela Vibram.",
    descriptionEn: "The world's best-selling hiker: ventilated, comfortable out of the box, Vibram outsole.",
    useCaseEs: "Sendero · Día completo",
    useCaseEn: "Trail · Full day",
  },
  // ── Mochilas de marca ─────────────────────────────────────────────
  {
    slug: "tnf-borealis-28",
    category: "packs",
    brand: "The North Face",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=70",
    price: 99,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 14,
    stock: null,
    tagEs: "Versátil",
    tagEn: "Versatile",
    nameEs: "The North Face Borealis 28L",
    nameEn: "The North Face Borealis 28L",
    descriptionEs: "Mochila todo-terreno con panel FlexVent y compartimento acolchado, del bus al sendero.",
    descriptionEn: "Do-it-all pack with FlexVent panel and padded sleeve, from bus to trailhead.",
    useCaseEs: "Viaje · Sendero",
    useCaseEn: "Travel · Trail",
  },
  {
    slug: "columbia-trail-30",
    category: "packs",
    brand: "Columbia",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=900&q=70",
    price: 84,
    rating: 4.6,
    featured: false,
    isActive: true,
    sortOrder: 15,
    stock: null,
    tagEs: "Trekking",
    tagEn: "Trekking",
    nameEs: "Columbia Trail Elite 30L",
    nameEn: "Columbia Trail Elite 30L",
    descriptionEs: "Mochila de trekking con espalda ventilada, porta-bastones y cubierta de lluvia incluida.",
    descriptionEn: "Trekking pack with ventilated back, pole carry, and included rain cover.",
    useCaseEs: "Trekking · Cañón",
    useCaseEn: "Trekking · Canyon",
  },
  // ── Ropa técnica de marca ─────────────────────────────────────────
  {
    slug: "patagonia-torrentshell",
    category: "apparel",
    brand: "Patagonia",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=70",
    price: 149,
    rating: 4.9,
    featured: false,
    isActive: true,
    sortOrder: 16,
    stock: null,
    tagEs: "Impermeable 3L",
    tagEn: "3L waterproof",
    nameEs: "Patagonia Torrentshell 3L",
    nameEn: "Patagonia Torrentshell 3L",
    descriptionEs: "Capa impermeable de 3 capas, reciclada y garantizada de por vida. Hecha para aguaceros tropicales.",
    descriptionEn: "3-layer recycled waterproof shell with lifetime guarantee. Built for tropical downpours.",
    useCaseEs: "Lluvia · Montaña",
    useCaseEn: "Rain · Mountain",
  },
  {
    slug: "columbia-watertight-ii",
    category: "apparel",
    brand: "Columbia",
    image: "https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=900&q=70",
    price: 89,
    rating: 4.6,
    featured: false,
    isActive: true,
    sortOrder: 17,
    stock: null,
    tagEs: "Lluvia diaria",
    tagEn: "Daily rain",
    nameEs: "Columbia Watertight II",
    nameEn: "Columbia Watertight II",
    descriptionEs: "Chaqueta Omni-Tech empacable en su propio bolsillo, ideal para la temporada verde.",
    descriptionEn: "Omni-Tech jacket that packs into its own pocket, ideal for green season.",
    useCaseEs: "Lluvia · Viaje ligero",
    useCaseEn: "Rain · Light travel",
  },
  {
    slug: "adidas-terrex-fleece",
    category: "apparel",
    brand: "Adidas Terrex",
    image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=70",
    price: 72,
    rating: 4.5,
    featured: false,
    isActive: true,
    sortOrder: 18,
    stock: null,
    tagEs: "Capa media",
    tagEn: "Mid layer",
    nameEs: "Adidas Terrex Fleece",
    nameEn: "Adidas Terrex Fleece",
    descriptionEs: "Polar liviano de secado rápido para madrugadas frías en la montaña y el mirador.",
    descriptionEn: "Light quick-dry fleece for chilly mountain mornings and lookout points.",
    useCaseEs: "Madrugada · Mirador",
    useCaseEn: "Early start · Lookout",
  },
  {
    slug: "nike-drifit-trail-tee",
    category: "apparel",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=70",
    price: 38,
    rating: 4.5,
    featured: false,
    isActive: true,
    sortOrder: 19,
    stock: null,
    tagEs: "Secado rápido",
    tagEn: "Quick dry",
    nameEs: "Nike Dri-FIT Trail Tee",
    nameEn: "Nike Dri-FIT Trail Tee",
    descriptionEs: "Camiseta técnica que evacúa el sudor en clima húmedo; corte relajado para moverse libre.",
    descriptionEn: "Technical tee that wicks sweat in humid weather; relaxed fit for free movement.",
    useCaseEs: "Humedad · Todo uso",
    useCaseEn: "Humidity · Everyday",
  },
  // ── Hidratación ───────────────────────────────────────────────────
  {
    slug: "camelbak-hydrobak",
    category: "hydration",
    brand: "CamelBak",
    image: "https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=70",
    price: 68,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 20,
    stock: null,
    tagEs: "Manos libres",
    tagEn: "Hands free",
    nameEs: "CamelBak HydroBak 1.5L",
    nameEn: "CamelBak HydroBak 1.5L",
    descriptionEs: "Mochila de hidratación compacta con reservorio Crux: agua sin detenerte en el sendero.",
    descriptionEn: "Compact hydration pack with Crux reservoir: drink without breaking stride.",
    useCaseEs: "Trail run · Bici",
    useCaseEn: "Trail run · Bike",
  },
  {
    slug: "hydroflask-32oz",
    category: "hydration",
    brand: "Hydro Flask",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=70",
    price: 45,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 21,
    stock: null,
    tagEs: "Frío 24h",
    tagEn: "Cold 24h",
    nameEs: "Hydro Flask 32oz",
    nameEn: "Hydro Flask 32oz",
    descriptionEs: "Botella de acero con doble pared: agua helada todo el día aunque el sol apriete.",
    descriptionEn: "Double-wall steel bottle: ice-cold water all day even under strong sun.",
    useCaseEs: "Día completo · Playa",
    useCaseEn: "Full day · Beach",
  },
  {
    slug: "nalgene-wide-1l",
    category: "hydration",
    brand: "Nalgene",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=70",
    price: 18,
    rating: 4.9,
    featured: false,
    isActive: true,
    sortOrder: 22,
    stock: null,
    tagEs: "Indestructible",
    tagEn: "Indestructible",
    nameEs: "Nalgene Boca Ancha 1L",
    nameEn: "Nalgene Wide Mouth 1L",
    descriptionEs: "La botella clásica de expedición: liviana, libre de BPA y prácticamente irrompible.",
    descriptionEn: "The classic expedition bottle: light, BPA-free, and nearly unbreakable.",
    useCaseEs: "Todo tour · Diario",
    useCaseEn: "Every tour · Daily",
  },
  // ── Seguridad ─────────────────────────────────────────────────────
  {
    slug: "petzl-tikka-headlamp",
    category: "safety",
    brand: "Petzl",
    image: "https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=900&q=70",
    price: 38,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 23,
    stock: null,
    tagEs: "300 lúmenes",
    tagEn: "300 lumens",
    nameEs: "Linterna frontal Petzl Tikka",
    nameEn: "Petzl Tikka Headlamp",
    descriptionEs: "Frontal confiable para caminatas nocturnas de ranas y salidas antes del amanecer.",
    descriptionEn: "Reliable headlamp for night frog walks and pre-dawn starts.",
    useCaseEs: "Nocturno · Amanecer",
    useCaseEn: "Night · Sunrise",
  },
  {
    slug: "bd-trail-poles",
    category: "safety",
    brand: "Black Diamond",
    image: "https://images.unsplash.com/photo-1517398823963-c2dc6fc3e837?auto=format&fit=crop&w=900&q=70",
    price: 79,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 24,
    stock: null,
    tagEs: "Rodillas felices",
    tagEn: "Happy knees",
    nameEs: "Bastones Black Diamond Trail",
    nameEn: "Black Diamond Trail Poles",
    descriptionEs: "Bastones de aluminio con ajuste FlickLock para descensos empinados y cruces de río.",
    descriptionEn: "Aluminum poles with FlickLock adjust for steep descents and river crossings.",
    useCaseEs: "Descenso · Cañón",
    useCaseEn: "Descent · Canyon",
  },
  {
    slug: "kit-primeros-auxilios",
    category: "safety",
    brand: "La Vieja",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=900&q=70",
    price: 29,
    rating: 4.9,
    featured: false,
    isActive: true,
    sortOrder: 25,
    stock: null,
    tagEs: "Imprescindible",
    tagEn: "Must have",
    nameEs: "Kit Primeros Auxilios Montaña",
    nameEn: "Mountain First Aid Kit",
    descriptionEs: "Botiquín compacto y resistente al agua armado por nuestros guías certificados.",
    descriptionEn: "Compact, water-resistant first aid kit assembled by our certified guides.",
    useCaseEs: "Todo tour · Familia",
    useCaseEn: "Every tour · Family",
  },
  // ── Camping ───────────────────────────────────────────────────────
  {
    slug: "tnf-stormbreak-2",
    category: "camping",
    brand: "The North Face",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=70",
    price: 159,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 26,
    stock: null,
    tagEs: "2 personas",
    tagEn: "2 person",
    nameEs: "Carpa The North Face Stormbreak 2",
    nameEn: "The North Face Stormbreak 2 Tent",
    descriptionEs: "Carpa de 2 personas fácil de armar, probada bajo lluvia de montaña costarricense.",
    descriptionEn: "Easy-pitch 2-person tent, tested under Costa Rican mountain rain.",
    useCaseEs: "Camping · Volcán",
    useCaseEn: "Camping · Volcano",
  },
  {
    slug: "columbia-sleeping-bag",
    category: "camping",
    brand: "Columbia",
    image: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?auto=format&fit=crop&w=900&q=70",
    price: 85,
    rating: 4.5,
    featured: false,
    isActive: true,
    sortOrder: 27,
    stock: null,
    tagEs: "10°C confort",
    tagEn: "10°C comfort",
    nameEs: "Sleeping Columbia 10°C",
    nameEn: "Columbia 10°C Sleeping Bag",
    descriptionEs: "Bolsa de dormir sintética para noches frescas de altura, empacable y lavable.",
    descriptionEn: "Synthetic bag for cool highland nights, packable and washable.",
    useCaseEs: "Camping · Altura",
    useCaseEn: "Camping · Highlands",
  },
  {
    slug: "hamaca-toldo-rio",
    category: "camping",
    brand: "La Vieja",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=900&q=70",
    price: 65,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 28,
    stock: null,
    tagEs: "Pura vida",
    tagEn: "Pura vida",
    nameEs: "Hamaca + Toldo Río",
    nameEn: "River Hammock + Tarp",
    descriptionEs: "Hamaca de nylon con toldo impermeable para siestas junto al Río La Vieja.",
    descriptionEn: "Nylon hammock with waterproof tarp for naps beside La Vieja River.",
    useCaseEs: "Río · Descanso",
    useCaseEn: "River · Rest",
  },
  // ── Accesorios ────────────────────────────────────────────────────
  {
    slug: "patagonia-p6-cap",
    category: "accessories",
    brand: "Patagonia",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=70",
    price: 35,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 29,
    stock: null,
    tagEs: "Clásica",
    tagEn: "Classic",
    nameEs: "Gorra Patagonia P-6",
    nameEn: "Patagonia P-6 Cap",
    descriptionEs: "Gorra trucker de algodón orgánico para sol de mediodía en el cañón.",
    descriptionEn: "Organic cotton trucker cap for midday canyon sun.",
    useCaseEs: "Sol · Diario",
    useCaseEn: "Sun · Daily",
  },
  {
    slug: "gafas-polarizadas-rio",
    category: "accessories",
    brand: "Columbia",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=70",
    price: 75,
    rating: 4.6,
    featured: false,
    isActive: true,
    sortOrder: 30,
    stock: null,
    tagEs: "Polarizadas",
    tagEn: "Polarized",
    nameEs: "Gafas Polarizadas Río",
    nameEn: "River Polarized Sunglasses",
    descriptionEs: "Lentes polarizados que cortan el reflejo del agua para ver las pozas en todo su color.",
    descriptionEn: "Polarized lenses that cut water glare so you see the pools in full color.",
    useCaseEs: "Río · Manejo",
    useCaseEn: "River · Driving",
  },
  {
    slug: "reloj-gps-outdoor",
    category: "accessories",
    brand: "Garmin",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=70",
    price: 249,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 31,
    stock: null,
    tagEs: "GPS + Altímetro",
    tagEn: "GPS + Altimeter",
    nameEs: "Reloj GPS Outdoor",
    nameEn: "Outdoor GPS Watch",
    descriptionEs: "Reloj resistente con GPS, altímetro y brújula para registrar cada aventura.",
    descriptionEn: "Rugged watch with GPS, altimeter, and compass to log every adventure.",
    useCaseEs: "Trekking · Datos",
    useCaseEn: "Trekking · Tracking",
  },
  {
    slug: "medias-merino-trail",
    category: "accessories",
    brand: "Merrell",
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=900&q=70",
    price: 22,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 32,
    stock: null,
    tagEs: "Anti-ampollas",
    tagEn: "Blister-free",
    nameEs: "Medias Merino Trail (2 pares)",
    nameEn: "Merino Trail Socks (2 pairs)",
    descriptionEs: "Medias de lana merino que regulan temperatura y evitan ampollas en jornadas largas.",
    descriptionEn: "Merino wool socks that regulate temperature and prevent blisters on long days.",
    useCaseEs: "Trekking · Diario",
    useCaseEn: "Trekking · Daily",
  },
];

const VALID_CATEGORIES = new Set<StoreProductCategory>([
  "packs",
  "footwear",
  "apparel",
  "essentials",
  "hydration",
  "safety",
  "camping",
  "accessories",
]);

export function serializeStoreProduct(doc: StoreProductDoc): StoreProduct {
  const stock = doc.stock;
  const inStock = stock == null || stock > 0;

  return {
    id: String(doc._id ?? doc.slug),
    slug: doc.slug,
    category: doc.category,
    brand: doc.brand?.trim() || undefined,
    image: doc.image,
    price: Number(doc.price) || 0,
    priceCRC: typeof doc.priceCRC === "number" ? doc.priceCRC : undefined,
    currency: doc.currency === "CRC" ? "CRC" : "USD",
    rating: Number(doc.rating) || 0,
    featured: Boolean(doc.featured),
    inStock,
    stockCount: stock == null ? null : Math.max(0, stock),
    tag: { es: doc.tagEs, en: doc.tagEn },
    name: { es: doc.nameEs, en: doc.nameEn },
    description: { es: doc.descriptionEs, en: doc.descriptionEn },
    useCase: { es: doc.useCaseEs, en: doc.useCaseEn },
  };
}

export function normalizeStoreProductInput(body: Record<string, unknown>) {
  const slug = String(body.slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return { error: "slug is required" as const };

  const category = String(body.category ?? "").trim() as StoreProductCategory;
  if (!VALID_CATEGORIES.has(category)) {
    return { error: "category must be one of: packs, footwear, apparel, essentials, hydration, safety, camping, accessories" as const };
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "price must be a non-negative number" as const };
  }

  const rating = Number(body.rating ?? 5);
  const priceCRC = body.priceCRC == null ? undefined : Number(body.priceCRC);
  const stock = body.stock == null ? null : Number(body.stock);
  const now = new Date().toISOString();

  return {
    slug,
    category,
    brand: String(body.brand ?? "").trim() || undefined,
    image: String(body.image ?? "/image/IMG_6810.jpg").trim(),
    price,
    priceCRC: Number.isFinite(priceCRC) ? priceCRC : undefined,
    currency: body.currency === "CRC" ? "CRC" : "USD",
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 5,
    featured: Boolean(body.featured),
    isActive: body.isActive !== false,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 100,
    stock: stock == null || !Number.isFinite(stock) ? null : Math.max(0, stock),
    tagEs: String(body.tagEs ?? "").trim(),
    tagEn: String(body.tagEn ?? body.tagEs ?? "").trim(),
    nameEs: String(body.nameEs ?? "").trim(),
    nameEn: String(body.nameEn ?? body.nameEs ?? "").trim(),
    descriptionEs: String(body.descriptionEs ?? "").trim(),
    descriptionEn: String(body.descriptionEn ?? body.descriptionEs ?? "").trim(),
    useCaseEs: String(body.useCaseEs ?? "").trim(),
    useCaseEn: String(body.useCaseEn ?? body.useCaseEs ?? "").trim(),
    updatedAt: now,
  } satisfies Omit<StoreProductDoc, "_id">;
}

async function getProductsCollection() {
  const db = await getDb();
  return db.collection<StoreProductDoc>(COLLECTIONS.STORE_PRODUCTS);
}

export async function seedStoreProductsIfEmpty() {
  const collection = await getProductsCollection();

  // Insert any default products whose slug is not in the collection yet, so new
  // catalog additions show up on databases that were seeded with an older list.
  const existing = await collection
    .find({}, { projection: { slug: 1 } })
    .toArray();
  const existingSlugs = new Set(existing.map((doc) => doc.slug));
  const missing = DEFAULT_STORE_PRODUCTS.filter((product) => !existingSlugs.has(product.slug));
  if (missing.length === 0) return;

  const now = new Date().toISOString();
  await collection.insertMany(
    missing.map((product) => ({
      ...product,
      currency: "USD" as const,
      createdAt: now,
      updatedAt: now,
    })),
  );
}

export async function readActiveStoreCatalog(): Promise<StoreCatalogResponse> {
  await seedStoreProductsIfEmpty();

  const [collection, settings] = await Promise.all([
    getProductsCollection(),
    getStoreSettings(),
  ]);

  const docs = await collection
    .find({ isActive: { $ne: false } })
    .sort({ featured: -1, sortOrder: 1, price: 1 })
    .toArray();

  return {
    products: docs.map(serializeStoreProduct),
    settings: {
      shippingFeeUSD: settings.shippingFeeUSD,
      freeShippingThresholdUSD: settings.freeShippingThresholdUSD ?? 75,
      currency: settings.currency,
      whatsappPhone: settings.whatsappPhone,
    },
  };
}

export async function readAllStoreProducts() {
  await seedStoreProductsIfEmpty();
  const collection = await getProductsCollection();
  const docs = await collection.find({}).sort({ sortOrder: 1, price: 1 }).toArray();
  return docs.map((doc) => ({
    ...doc,
    _id: String(doc._id),
  }));
}

export async function createStoreProduct(body: Record<string, unknown>) {
  const normalized = normalizeStoreProductInput(body);
  if ("error" in normalized) return normalized;

  const collection = await getProductsCollection();
  const existing = await collection.findOne({ slug: normalized.slug });
  if (existing) return { error: "Product slug already exists." as const };

  const now = new Date().toISOString();
  await collection.insertOne({
    ...normalized,
    createdAt: now,
  });

  return { ok: true as const };
}

export async function updateStoreProduct(slug: string, body: Record<string, unknown>) {
  const collection = await getProductsCollection();
  const existing = await collection.findOne({ slug });
  if (!existing) return { error: "Product not found." as const };

  const patch = normalizeStoreProductInput({ ...existing, ...body, slug });
  if ("error" in patch) return patch;

  await collection.updateOne({ slug }, { $set: patch });
  return { ok: true as const };
}

export async function deleteStoreProduct(slug: string) {
  const collection = await getProductsCollection();
  const result = await collection.updateOne(
    { slug },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
  );

  if (result.matchedCount === 0) return { error: "Product not found." as const };
  return { ok: true as const };
}