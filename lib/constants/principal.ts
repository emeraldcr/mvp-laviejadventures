import type { Lang } from "@/app/context/LanguageContext";

export const principalContent = {
  es: {
    header: {
      exploreGroup: "Explorar",
      forecast: "Pronostico",
      dashboard: "Dashboard",
      logout: "Cerrar sesion",
      userMenuAria: "Menu de usuario",
      toggleMenuAria: "Abrir o cerrar menu",
    },
    hero: {
      errorLoadingImages: "Error al cargar imagenes",
      loadingImages: "Cargando imagenes...",
      previousImageAria: "Imagen anterior",
      nextImageAria: "Imagen siguiente",
      goToSlideAria: "Ir a imagen {slide}",
      scrollToToursAria: "Ir a tours",
      scrollToMainAria: "Ir al contenido principal",
      locationBadge: "San Carlos - Costa Rica",
      title: "Aventuras en San Carlos, Costa Rica",
      subtitle: "Canones, cascadas y pozas secretas en el Parque Nacional Juan Castro Blanco",
      description:
        "Descubre 6 experiencias unicas con guias locales. Desde el iconico Ciudad Esmeralda hasta pozas cristalinas, selva nublada y canonismo extremo.",
      exploreCta: "Explorar Todas las Aventuras",
      datesCta: "Ver Fechas Disponibles",
    },
    tours: {
      eyebrow: "Explora primero",
      title: "Elige tu aventura ideal",
    },
    conversion: {
      faqs: [
        {
          question: "Puedo cambiar mi fecha despues de reservar?",
          answer:
            "Si, nuestro equipo te ayuda a reprogramar segun disponibilidad para que no pierdas tu experiencia.",
        },
        {
          question: "Cual tour es mejor para principiantes?",
          answer:
            "Usa el boton AI en la reserva y te recomendara la opcion ideal por duracion e intensidad.",
        },
        {
          question: "Que pasa si llueve?",
          answer:
            "Monitoreamos el clima constantemente y te notificamos alternativas seguras con tiempo.",
        },
      ],
    },
    booking: {
      loading: "Preparando tu panel de reserva...",
      eyebrow: "Crea una nueva reserva",
      title: "Tu proximo tour empieza aqui",
      description:
        "Elige la fecha, completa tus detalles y si tienes dudas usa el boton de AI para resolver todo al instante.",
      steps: {
        date: "Paso 1 - Fecha",
        details: "Paso 2 - Detalles",
      },
    },
    errors: {
      criticalFallback: "Error critico: no se pudo cargar el motor de reservas.",
    },
  },
  en: {
    header: {
      exploreGroup: "Explore",
      forecast: "Forecast",
      dashboard: "Dashboard",
      logout: "Log Out",
      userMenuAria: "User menu",
      toggleMenuAria: "Toggle menu",
    },
    hero: {
      errorLoadingImages: "Error loading images",
      loadingImages: "Loading images...",
      previousImageAria: "Previous image",
      nextImageAria: "Next image",
      goToSlideAria: "Go to slide {slide}",
      scrollToToursAria: "Scroll to tours",
      scrollToMainAria: "Scroll to main content",
      locationBadge: "San Carlos - Costa Rica",
      title: "Adventures in San Carlos, Costa Rica",
      subtitle: "Canyons, waterfalls, and hidden pools in Juan Castro Blanco National Water Park",
      description:
        "Discover 6 unique experiences with local guides, from iconic Ciudad Esmeralda to crystal-clear pools, cloud forest, and extreme canyoning.",
      exploreCta: "Explore All Adventures",
      datesCta: "View Available Dates",
    },
    tours: {
      eyebrow: "Explore first",
      title: "Choose your ideal adventure",
    },
    conversion: {
      faqs: [
        {
          question: "Can I change my date after booking?",
          answer:
            "Yes, our team helps you reschedule based on availability so you never miss the experience.",
        },
        {
          question: "Which tour is best for beginners?",
          answer:
            "Use the AI button in booking and it will suggest the best option by duration and intensity.",
        },
        {
          question: "What if it rains?",
          answer:
            "We monitor weather constantly and notify you in advance with safe alternatives.",
        },
      ],
    },
    booking: {
      loading: "Preparing your booking panel...",
      eyebrow: "Make a new reservation",
      title: "Your next tour starts here",
      description:
        "Pick your date, complete your details, and use the AI button whenever you need instant help.",
      steps: {
        date: "Step 1 - Date",
        details: "Step 2 - Details",
      },
    },
    errors: {
      criticalFallback: "Critical error: cannot load the booking engine.",
    },
  },
} as const satisfies Record<Lang, object>;

export type PrincipalContent = (typeof principalContent)[Lang];
