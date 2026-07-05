// Rich, per-tour editorial content for the public tour detail pages.
// Keyed by tour slug. This layer is additive: it does NOT touch the Mongo
// tour documents used for booking/pricing. It only enriches what a visitor
// reads and sees on /tour/[slug]. Photos are theme-specific remote images so
// each tour looks aligned with its title instead of reusing the same saved
// gallery. When a slug has no entry here the detail page falls back to the
// existing behaviour.

export type ItineraryStop = {
  time?: string;
  title: string;
  description: string;
};

export type TourFaq = {
  q: string;
  a: string;
};

export type TourContent = {
  tagline: string;
  overview: string[];
  highlights: string[];
  itinerary: ItineraryStop[];
  included: string[];
  notIncluded: string[];
  whatToBring: string[];
  goodToKnow: string[];
  faqs: TourFaq[];
  gallery: string[];
};

// Build a stable Unsplash CDN url from a photo id. All ids below were verified
// to return 200 before being committed.
function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=1400&auto=format&fit=crop`;
}

export const TOUR_CONTENT: Record<string, TourContent> = {
  "cuadra-tours-aventura": {
    tagline: "Senderos privados, barro, río y miradores sobre cuatro ruedas",
    overview: [
      "Nuestro Cuadra-Tour es la forma más divertida de cubrir en poco tiempo los paisajes escondidos de la Zona Norte. Salimos desde Sucre de Ciudad Quesada y nos internamos por senderos privados que cruzan fincas ganaderas, parches de bosque y quebradas, con paradas en miradores donde se abre el valle de San Carlos.",
      "Cada salida arranca con una inducción completa: cómo manejar la cuadraciclo, frenado, curvas y qué hacer en el barro. No necesitás experiencia previa; empezamos en un tramo plano para que tomés confianza antes de entrar a la ruta real.",
      "El recorrido mezcla terreno seco y lodoso según la época del año, con un alto para refrescarse a la orilla del río. Es una experiencia de adrenalina controlada, siempre detrás de un guía que marca el ritmo del grupo.",
    ],
    highlights: [
      "Inducción de manejo para principiantes antes de salir",
      "Senderos privados que no se recorren en tours masivos",
      "Cruce de quebradas y tramos de barro en temporada verde",
      "Mirador panorámico del valle de San Carlos",
      "Parada de refresco a la orilla del río",
    ],
    itinerary: [
      { time: "0:00", title: "Bienvenida e inducción", description: "Papeleo, casco y una charla de seguridad. Practicás el manejo en un tramo plano hasta sentirte cómodo." },
      { time: "0:20", title: "Salida a senderos", description: "Entramos a los caminos privados entre finca y bosque, en fila detrás del guía." },
      { time: "0:50", title: "Mirador y fotos", description: "Alto en un punto alto con vista al valle para tomar aire y fotos del grupo." },
      { time: "1:15", title: "Río y barro", description: "Bajada hacia la quebrada, cruce de agua y el tramo más divertido de lodo." },
      { time: "1:45", title: "Regreso a base", description: "Volvemos a la base para entregar equipo y refrescarnos." },
    ],
    included: [
      "Cuadraciclo (ATV) por persona o compartida según el paquete",
      "Guía local certificado",
      "Casco y equipo de seguridad",
      "Inducción de manejo",
      "Ruta por senderos privados",
    ],
    notIncluded: ["Transporte hacia/desde el punto de encuentro", "Alimentos y bebidas", "Fotografías profesionales", "Propinas"],
    whatToBring: [
      "Zapatos cerrados que se puedan ensuciar",
      "Ropa que no te importe manchar de barro",
      "Cambio de ropa y toalla",
      "Bloqueador solar y repelente",
      "Agua y, si querés, traje de baño para el río",
    ],
    goodToKnow: [
      "Edad mínima para conducir: 16 años con licencia; menores pueden ir de pasajeros.",
      "En temporada verde (mayo–noviembre) el barro es parte de la diversión: vas a terminar sucio.",
      "Se puede compartir una cuadra entre dos personas.",
      "La ruta se ajusta al clima; en lluvia fuerte se modifican los tramos por seguridad.",
    ],
    faqs: [
      { q: "¿Necesito experiencia manejando cuadraciclo?", a: "No. La inducción y el tramo de práctica están diseñados para principiantes." },
      { q: "¿Me voy a mojar o ensuciar?", a: "Casi seguro, sobre todo en temporada verde. Traé cambio de ropa y zapatos que puedan ensuciarse." },
      { q: "¿Qué pasa si llueve?", a: "El tour opera con lluvia normal; solo se suspende o reprograma ante condiciones inseguras." },
    ],
    gallery: [img("1533246696441-571a1d6d1281"), img("1781714098388-cca9b228d5cc"), img("1769052346677-8ead8d92e64d")],
  },

  "cascadas-secretas-rio-la-vieja": {
    tagline: "Caminata guiada a cascadas escondidas y pozas de agua cristalina",
    overview: [
      "Una caminata tranquila pero llena de recompensas: seguimos senderos por el bosque del Cañón del Río La Vieja hasta cascadas que pocos conocen, con pozas de agua fresca ideales para un chapuzón.",
      "El guía va marcando el ritmo, señalando plantas, aves y rastros de fauna, y contando la historia de la zona. Hacemos varias paradas fotográficas donde el bosque, el río y la roca se combinan para las mejores tomas.",
      "Es una experiencia pensada para conectar con la naturaleza sin necesidad de ser un atleta: caminamos con calma y con tiempo para disfrutar cada poza.",
    ],
    highlights: [
      "Cascadas escondidas fuera de las rutas turísticas comunes",
      "Pozas naturales para nadar y refrescarse",
      "Paradas fotográficas en río y bosque",
      "Guía local que interpreta flora, fauna y geología",
      "Ambiente fresco de bosque durante todo el recorrido",
    ],
    itinerary: [
      { time: "0:00", title: "Punto de encuentro y briefing", description: "Charla de seguridad, ajuste de equipo y contexto de lo que veremos." },
      { time: "0:15", title: "Entrada al sendero", description: "Caminata suave por el bosque con paradas para observar aves y plantas." },
      { time: "0:45", title: "Primera cascada", description: "Llegada a la primera caída de agua y tiempo para fotos." },
      { time: "1:15", title: "Poza cristalina", description: "Baño opcional en la poza y descanso a la orilla del río." },
      { time: "2:15", title: "Regreso", description: "Retorno por el sendero hacia el punto de encuentro." },
    ],
    included: [
      "Guía local certificado",
      "Acceso a senderos y áreas naturales",
      "Paradas fotográficas guiadas",
      "Briefing de seguridad",
    ],
    notIncluded: ["Transporte", "Alimentos y bebidas", "Toalla", "Propinas"],
    whatToBring: [
      "Zapatos con buen agarre para sendero húmedo",
      "Traje de baño y toalla",
      "Cambio de ropa seca",
      "Repelente y bloqueador biodegradable",
      "Agua y bolsa impermeable para el celular",
    ],
    goodToKnow: [
      "Los senderos pueden estar resbalosos; se recomienda calzado con suela agarrada.",
      "Apta para familias y personas con condición física moderada.",
      "Usá bloqueador biodegradable para proteger las pozas.",
      "El nivel del río depende de las lluvias recientes.",
    ],
    faqs: [
      { q: "¿Puedo nadar en las cascadas?", a: "Sí, hay pozas seguras para nadar. El guía indica dónde es apto según el caudal del día." },
      { q: "¿Es difícil la caminata?", a: "Es de dificultad moderada, con tramos cortos de subida. Vamos a ritmo relajado con varias paradas." },
      { q: "¿Sirve para niños?", a: "Sí, es una de nuestras opciones más familiares siempre que los niños caminen acompañados." },
    ],
    gallery: [img("1580259679654-9276b39fd2d5"), img("1669694841884-95d35a6bc287"), img("1611222566512-cb8dd8e689e5")],
  },

  "tour-gastronomico-local": {
    tagline: "Sabores del campo: comida tradicional preparada por manos locales",
    overview: [
      "Un recorrido por la cocina de la Zona Norte tal como se vive en las casas y fincas de la región. Probás platillos tradicionales costarricenses preparados por cocineros locales, con ingredientes de temporada y recetas que pasan de generación en generación.",
      "Entre bocado y bocado, los anfitriones cuentan el origen de cada plato, cómo se cultiva o se cría lo que estás comiendo y qué papel juega en la mesa tica. Es tanto una degustación como una ventana a la cultura local.",
      "Ideal para complementar un día de aventura con una experiencia más pausada, cultural y deliciosa.",
    ],
    highlights: [
      "Degustación de platillos típicos costarricenses",
      "Cocineros y anfitriones locales",
      "Ingredientes frescos de la zona",
      "Historias detrás de cada receta",
      "Ritmo relajado, apto para todas las edades",
    ],
    itinerary: [
      { time: "0:00", title: "Bienvenida", description: "Recibimiento con una bebida tradicional y presentación de la experiencia." },
      { time: "0:15", title: "Primera degustación", description: "Entradas y bocadillos típicos mientras se explica su origen." },
      { time: "0:45", title: "Plato fuerte", description: "Un platillo tradicional preparado al momento por los cocineros locales." },
      { time: "1:15", title: "Dulce y café", description: "Postre casero y café de la zona para cerrar." },
    ],
    included: [
      "Degustación de varios platillos tradicionales",
      "Bebida de bienvenida",
      "Anfitrión local",
      "Experiencia cultural guiada",
    ],
    notIncluded: ["Transporte", "Consumos adicionales", "Bebidas alcohólicas", "Propinas"],
    whatToBring: [
      "Ganas de probar cosas nuevas",
      "Cámara o celular para las fotos",
      "Aviso previo de alergias o restricciones alimentarias",
    ],
    goodToKnow: [
      "Avisanos con antelación si sos vegetariano, vegano o tenés alergias: adaptamos el menú.",
      "Es una experiencia sentada y relajada, apta para adultos mayores y niños.",
      "El menú varía según la temporada y los productos disponibles.",
    ],
    faqs: [
      { q: "¿Tienen opciones vegetarianas?", a: "Sí, con aviso previo adaptamos la degustación a dietas vegetarianas, veganas o con alergias." },
      { q: "¿Cuánta comida es?", a: "Suficiente para quedar satisfecho; es una degustación de varios platillos, no un solo plato." },
      { q: "¿Es apto para niños?", a: "Totalmente. Es una de nuestras experiencias más tranquilas y familiares." },
    ],
    gallery: [img("1621295239171-6f95272fdf45"), img("1630527910939-275499aa3650"), img("1721314678207-8b7bd43e677b")],
  },

  "lluvia-en-la-naturaleza": {
    tagline: "El bosque bajo la lluvia: una experiencia sensorial única",
    overview: [
      "En la Zona Norte la lluvia no es un problema, es un espectáculo. Este tour te invita a entrar al bosque justamente cuando la mayoría se resguarda, con equipo especial para mantenerte cómodo mientras el bosque cobra vida.",
      "Con la lluvia despiertan los aromas, los sonidos y los colores: las hojas brillan, las ranas cantan y las quebradas crecen. El guía te ayuda a leer ese cambio y a apreciar por qué la lluvia es el motor de este ecosistema.",
      "Es una caminata corta y accesible, pensada como una experiencia sensorial de desconexión más que como un reto físico.",
    ],
    highlights: [
      "Equipo especial para lluvia incluido",
      "El bosque en su estado más activo y aromático",
      "Sonidos de ranas, aves y quebradas",
      "Caminata corta y accesible",
      "Perfecta para desconectar y tomar fotos distintas",
    ],
    itinerary: [
      { time: "0:00", title: "Preparación", description: "Entrega de capa/poncho y equipo, más una charla sobre qué observar bajo la lluvia." },
      { time: "0:15", title: "Entrada al bosque", description: "Caminata pausada mientras el guía interpreta los cambios que trae la lluvia." },
      { time: "0:40", title: "Punto sensorial", description: "Alto para escuchar, oler y observar el bosque activo." },
      { time: "1:00", title: "Cierre", description: "Regreso y bebida caliente para entrar en calor." },
    ],
    included: [
      "Guía local certificado",
      "Equipo especial para lluvia (poncho/capa)",
      "Ruta sensorial guiada",
      "Bebida caliente al final",
    ],
    notIncluded: ["Transporte", "Ropa de cambio", "Botas de hule (consultar disponibilidad)", "Propinas"],
    whatToBring: [
      "Ropa que se pueda mojar y cambio seco",
      "Zapatos cerrados o botas de hule",
      "Bolsa impermeable para el celular",
      "Toalla pequeña",
    ],
    goodToKnow: [
      "El tour está diseñado para hacerse con lluvia; se reprograma solo ante tormenta eléctrica.",
      "Es de baja exigencia física, apta para la mayoría de edades.",
      "Traé mentalidad de mojarte: es parte de la experiencia.",
    ],
    faqs: [
      { q: "¿Y si no llueve ese día?", a: "Igual se disfruta el bosque húmedo; la experiencia se adapta a las condiciones del momento." },
      { q: "¿Me voy a mojar?", a: "Sí, esa es la idea. Te damos equipo para lluvia pero conviene traer cambio seco." },
      { q: "¿Es peligroso caminar con lluvia?", a: "No en condiciones normales. Ante tormenta eléctrica se suspende por seguridad." },
    ],
    gallery: [img("1630574232726-fc3ea90637b8"), img("1500354960738-4c480ed785bc"), img("1604956080929-0aaf39237d5c")],
  },

  "avistamiento-aves": {
    tagline: "Aves del corredor biológico Juan Castro Blanco al amanecer",
    overview: [
      "La Zona Norte es un paraíso para observar aves, y este tour te lleva a los mejores puntos del corredor biológico del Parque Nacional del Agua Juan Castro Blanco. Salimos temprano, cuando la actividad de las aves está en su punto más alto.",
      "El guía, conocedor del canto y los hábitos de cada especie, te ayuda a ubicar tucanes, tangaras, colibríes y, con suerte, especies más escurridizas. Aprendés a identificar por sonido y silueta, no solo por color.",
      "Un ritmo pausado, con paradas frecuentes y binoculares apuntando al dosel: ideal tanto para observadores expertos como para quienes se inician en el pajareo.",
    ],
    highlights: [
      "Salida temprano para la mejor actividad de aves",
      "Puntos clave del corredor Juan Castro Blanco",
      "Guía experto en identificación por canto y silueta",
      "Posibilidad de ver tucanes, tangaras y colibríes",
      "Ritmo tranquilo, apto para principiantes",
    ],
    itinerary: [
      { time: "5:30", title: "Encuentro temprano", description: "Salida al amanecer, cuando las aves están más activas." },
      { time: "5:45", title: "Primeros avistamientos", description: "Observación en los bordes de bosque y zonas abiertas." },
      { time: "6:45", title: "Interior de bosque", description: "Búsqueda de especies del dosel y sotobosque con apoyo del guía." },
      { time: "7:30", title: "Cierre", description: "Repaso de la lista de especies vistas antes de regresar." },
    ],
    included: [
      "Guía local especializado en aves",
      "Ruta de observación por puntos estratégicos",
      "Apoyo para identificación de especies",
      "Lista de especies del recorrido",
    ],
    notIncluded: ["Transporte", "Binoculares personales (consultar préstamo)", "Desayuno", "Propinas"],
    whatToBring: [
      "Binoculares (podemos prestar según disponibilidad)",
      "Ropa de colores neutros",
      "Zapatos cómodos para caminar",
      "Repelente y bloqueador",
      "Agua y algo para picar",
    ],
    goodToKnow: [
      "Empezamos muy temprano: la mejor actividad de aves es al amanecer.",
      "La ropa de colores neutros ayuda a no espantar a las aves.",
      "No se garantizan especies concretas: es naturaleza, pero la zona es muy rica.",
    ],
    faqs: [
      { q: "¿Necesito llevar binoculares?", a: "Ayuda mucho tenerlos. Consultá disponibilidad de préstamo al reservar." },
      { q: "¿A qué hora empieza?", a: "Muy temprano, alrededor del amanecer, que es cuando las aves están más activas." },
      { q: "¿Sirve si nunca he pajareado?", a: "Sí, el guía adapta el ritmo y te enseña a identificar desde cero." },
    ],
    gallery: [img("1550853024-fae8cd4be47f"), img("1550994439-a879aabe0386"), img("1682788820676-2d68c93d3346")],
  },

  "tour-nocturno-la-vieja": {
    tagline: "La vida secreta del bosque cuando cae la noche",
    overview: [
      "Cuando el sol se oculta, el bosque cambia por completo. En esta caminata nocturna, con linterna y guía, buscamos a los protagonistas de la noche: ranas de colores, insectos, arañas, serpientes inofensivas y mamíferos que solo salen al amparo de la oscuridad.",
      "El guía te enseña a mover la luz, a escuchar y a detectar los ojos que brillan entre la vegetación. Cada salida es distinta porque la fauna nocturna es impredecible y siempre sorprende.",
      "Es una experiencia segura, de baja exigencia física y con un factor sorpresa altísimo: perfecta para cerrar el día con algo diferente.",
    ],
    highlights: [
      "Fauna nocturna: ranas, insectos, anfibios y más",
      "Guía experto en detección con linterna",
      "Sonidos y ojos brillando en la oscuridad",
      "Caminata corta y de baja exigencia",
      "Cada noche es diferente",
    ],
    itinerary: [
      { time: "18:30", title: "Briefing nocturno", description: "Entrega de linterna, normas de seguridad y qué buscar." },
      { time: "18:45", title: "Sendero de noche", description: "Caminata lenta buscando ranas, insectos y ojos que brillan." },
      { time: "19:30", title: "Punto de escucha", description: "Alto para apagar luces y escuchar el bosque nocturno." },
      { time: "20:00", title: "Regreso", description: "Retorno al punto de encuentro." },
    ],
    included: [
      "Guía local certificado",
      "Ruta nocturna guiada",
      "Briefing de seguridad",
      "Apoyo de iluminación del guía",
    ],
    notIncluded: ["Transporte", "Linterna personal (recomendada)", "Repelente", "Propinas"],
    whatToBring: [
      "Linterna o frontal (recomendado)",
      "Zapatos cerrados",
      "Pantalón largo y manga larga",
      "Repelente de insectos",
      "Cámara con buen modo nocturno",
    ],
    goodToKnow: [
      "Usá pantalón largo y manga larga para protegerte de insectos.",
      "Traé tu propia linterna o frontal aunque el guía lleve una.",
      "La fauna es silvestre: nunca se toca ni se molesta a los animales.",
    ],
    faqs: [
      { q: "¿Es peligroso caminar de noche?", a: "No. Vamos en grupo, con guía y luz, por senderos conocidos y a ritmo lento." },
      { q: "¿Qué animales podría ver?", a: "Ranas de colores, insectos, arañas, a veces serpientes inofensivas y mamíferos pequeños. Varía cada noche." },
      { q: "¿Necesito linterna propia?", a: "Es recomendable llevar una frontal, aunque el guía siempre lleva iluminación." },
    ],
    gallery: [img("1631006860710-3f270ead6c51"), img("1592148923625-ca39edb0ccbb"), img("1584468247714-715aea60d3e0")],
  },

  "rapel-canon-del-rio": {
    tagline: "Descenso vertical por el Cañón del Río La Vieja con guías certificados",
    overview: [
      "Para quienes buscan adrenalina de verdad: descendemos en rapel por secciones del Cañón del Río La Vieja, bajando paredes de roca y, según la ruta, junto a caídas de agua. Todo con equipo profesional y guías certificados que van contigo en cada tramo.",
      "Empezamos con una inducción completa de técnica y seguridad, y una práctica en una pared baja antes de enfrentar los descensos reales. No necesitás experiencia previa, pero sí buena disposición física y ganas de superar el vértigo.",
      "Es nuestra experiencia más intensa y también una de las más memorables: la sensación de bajar por la roca con el río rugiendo abajo no se olvida.",
    ],
    highlights: [
      "Rapel en secciones del Cañón del Río La Vieja",
      "Descensos junto a paredes de roca y caídas de agua",
      "Equipo profesional y guías certificados",
      "Inducción y práctica antes de los descensos reales",
      "La opción más extrema del catálogo",
    ],
    itinerary: [
      { time: "0:00", title: "Inducción y equipo", description: "Colocación de arnés y casco, explicación de técnica y seguridad." },
      { time: "0:20", title: "Práctica", description: "Descenso de prueba en una pared baja para tomar confianza." },
      { time: "0:45", title: "Primer descenso", description: "Primer rapel real acompañado por el guía en todo momento." },
      { time: "1:20", title: "Descensos del cañón", description: "Secciones más altas del cañón, según la ruta y condiciones del día." },
      { time: "2:00", title: "Cierre", description: "Recuento, entrega de equipo y regreso." },
    ],
    included: [
      "Guías certificados en rapel/canyoning",
      "Equipo profesional completo (arnés, casco, cuerdas)",
      "Inducción técnica y práctica",
      "Briefing de seguridad",
    ],
    notIncluded: ["Transporte", "Alimentos y bebidas", "Fotografías profesionales", "Propinas"],
    whatToBring: [
      "Ropa deportiva que se pueda mojar",
      "Zapatos cerrados con buen agarre",
      "Cambio de ropa seca y toalla",
      "Bloqueador y agua",
    ],
    goodToKnow: [
      "Requiere condición física moderada y no tener contraindicaciones médicas.",
      "No apto para embarazadas ni personas con lesiones de espalda/rodilla recientes.",
      "El vértigo es normal: los guías te acompañan en cada descenso.",
      "La ruta se ajusta al caudal del río y al clima por seguridad.",
    ],
    faqs: [
      { q: "¿Necesito experiencia en rapel?", a: "No. La inducción y la práctica inicial están pensadas para principiantes." },
      { q: "¿Y si me da miedo la altura?", a: "Es normal. El guía va contigo en cada tramo y avanzás a tu ritmo. Muchos superan el vértigo en el primer descenso." },
      { q: "¿Hay peso o edad mínima?", a: "Sí, aplican límites de edad, peso y condición física por seguridad. Consultanos antes de reservar." },
    ],
    gallery: [img("1621693113354-8b32a9e0ba39"), img("1600198718659-01e18c32e13c"), img("1704386596483-ea345dfa9034")],
  },

  "caminata-volcanes-dormidos": {
    tagline: "Cráteres antiguos y miradores del Parque del Agua Juan Castro Blanco",
    overview: [
      "Una caminata de medio día hacia el corazón del Parque Nacional del Agua Juan Castro Blanco, hogar de volcanes dormidos y de las nacientes que abastecen de agua a toda la región. Subimos entre bosque nuboso hasta miradores y cráteres antiguos con vistas que se abren sobre la Zona Norte.",
      "El guía interpreta la geología volcánica, la importancia del parque como fábrica de agua y la fauna y flora de altura que vamos encontrando. Es una experiencia que combina esfuerzo físico con recompensa paisajística y aprendizaje.",
      "Recomendada para quienes disfrutan caminar y quieren entender por qué esta zona es tan especial para Costa Rica.",
    ],
    highlights: [
      "Cráteres de volcanes dormidos y miradores de altura",
      "Bosque nuboso del Parque Juan Castro Blanco",
      "Interpretación de geología volcánica y nacientes de agua",
      "Flora y fauna de altura",
      "Vistas panorámicas de la Zona Norte",
    ],
    itinerary: [
      { time: "0:00", title: "Encuentro y briefing", description: "Charla de seguridad y contexto del parque nacional." },
      { time: "0:20", title: "Ascenso por bosque nuboso", description: "Caminata de subida entre vegetación de altura con paradas de descanso." },
      { time: "1:30", title: "Mirador / cráter", description: "Llegada a los miradores y cráteres antiguos, tiempo para fotos y explicación." },
      { time: "2:30", title: "Almuerzo ligero", description: "Descanso para hidratarse y comer algo (traé tu merienda)." },
      { time: "3:00", title: "Descenso", description: "Regreso por el sendero hacia el punto de encuentro." },
    ],
    included: [
      "Guía local certificado",
      "Ruta a cráteres antiguos y miradores",
      "Interpretación ambiental",
      "Briefing de seguridad",
    ],
    notIncluded: ["Transporte", "Alimentos y bebidas", "Bastones de trekking", "Propinas"],
    whatToBring: [
      "Zapatos de senderismo con buen agarre",
      "Chaqueta impermeable (clima de altura cambiante)",
      "Merienda y suficiente agua",
      "Bloqueador, gorra y repelente",
      "Ropa abrigada para el bosque nuboso",
    ],
    goodToKnow: [
      "Es la caminata más exigente del catálogo: requiere buena condición física.",
      "El clima de altura cambia rápido; puede hacer frío y llover aunque abajo haga sol.",
      "Se camina dentro de un parque nacional: no se deja basura ni se sale de los senderos.",
    ],
    faqs: [
      { q: "¿Qué tan difícil es la caminata?", a: "Es de dificultad moderada a exigente por la subida y la altura. Recomendada para personas que caminan con regularidad." },
      { q: "¿Cómo es el clima allá arriba?", a: "Fresco y cambiante. Puede llover y bajar la temperatura; traé chaqueta impermeable y algo abrigado." },
      { q: "¿Hay dónde comer?", a: "No hay servicios dentro de la ruta: traé tu propia merienda y suficiente agua." },
    ],
    gallery: [img("1543321600-62c7a3591b69"), img("1532885399978-d1721c804f3e"), img("1639977699853-02edebe51348")],
  },

  "tour-ciudad-esmeralda": {
    tagline: "El clásico de La Vieja: senderos, río y cañón hasta la Cascada El Zafiro",
    overview: [
      "Nuestra experiencia insignia. El Tour Ciudad Esmeralda te lleva a recorrer 3.5 km por senderos, río y cañón dentro del Cañón del Río La Vieja, hasta llegar a la imponente Cascada El Zafiro, con sus pozas de agua turquesa.",
      "Un guía profesional bilingüe te acompaña durante las 3 a 4 horas de recorrido, interpretando la naturaleza, cuidando la seguridad del grupo y marcando los mejores puntos para fotos y para nadar.",
      "Es la mezcla perfecta de caminata, agua y aventura: exigente lo justo para sentir que lo lograste, y espectacular de principio a fin.",
    ],
    highlights: [
      "Recorrido de 3.5 km por senderos, río y cañón",
      "Cascada El Zafiro y sus pozas turquesa",
      "Guía profesional bilingüe (español/inglés)",
      "Equipo de seguridad incluido",
      "Paisajes de aventura de principio a fin",
    ],
    itinerary: [
      { time: "0:00", title: "Bienvenida y briefing", description: "Registro, equipo de seguridad y charla del recorrido." },
      { time: "0:20", title: "Senderos y bosque", description: "Inicio de la caminata por senderos hacia el cañón." },
      { time: "1:15", title: "Río y cañón", description: "Tramos junto al río y dentro del cañón, con paradas fotográficas." },
      { time: "2:00", title: "Cascada El Zafiro", description: "Llegada a la cascada y tiempo para nadar en las pozas." },
      { time: "3:00", title: "Regreso", description: "Retorno hacia el punto de partida." },
    ],
    included: [
      "Acceso a las instalaciones y áreas del recorrido",
      "Guía profesional bilingüe (español e inglés)",
      "Recorrido de 3.5 km hasta la Cascada El Zafiro",
      "Equipo de seguridad durante toda la experiencia",
    ],
    notIncluded: ["Transporte hacia/desde el punto de encuentro", "Alimentos y bebidas no especificadas", "Fotografías profesionales", "Propinas"],
    whatToBring: [
      "Zapatos con buen agarre para agua y sendero",
      "Traje de baño y toalla",
      "Cambio de ropa seca",
      "Bloqueador biodegradable y repelente",
      "Agua y snack",
    ],
    goodToKnow: [
      "Recomendado para adultos en buena condición física.",
      "Si tenés una condición médica, contactanos antes de reservar.",
      "Cancelaciones con al menos 48 horas de anticipación aplican para reembolso completo.",
    ],
    faqs: [
      { q: "¿Cuánto dura el tour?", a: "Entre 3 y 4 horas, incluyendo la caminata, el tiempo en la cascada y el regreso." },
      { q: "¿Necesito saber nadar?", a: "No es obligatorio, pero saber nadar te permite disfrutar mejor las pozas. Hay áreas seguras para todos." },
      { q: "¿Es apto para niños?", a: "Por la exigencia del recorrido está recomendado para adultos y jóvenes en buena condición física. Consultanos para casos familiares." },
    ],
    gallery: [img("1580259679654-9276b39fd2d5"), img("1611222566512-cb8dd8e689e5"), img("1669694841884-95d35a6bc287")],
  },
};

export function getTourContent(slug?: string | null): TourContent | null {
  if (!slug) return null;
  return TOUR_CONTENT[slug] ?? null;
}
