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
  errorLoadingImages: "Error al cargar las imágenes",
  loadingImages: "Cargando imágenes...",
  previousImageAria: "Imagen anterior",
  nextImageAria: "Imagen siguiente",
  goToSlideAria: "Ir a imagen {slide}",
  scrollToToursAria: "Ir a los tours",
  scrollToMainAria: "Ir al contenido principal",
  locationBadge: "San Carlos, Costa Rica",
  title: "Aventuras Inolvidables en San Carlos",
  subtitle: "Cañones, cascadas secretas y pozas esmeralda en el corazón de Alajuela Norte",
  description:
    "Vive 6 experiencias únicas guiadas por locales expertos. Desde el icónico Tour Ciudad Esmeralda hasta rapel en cañones, avistamiento de aves, tours nocturnos y gastronomía auténtica.",
  exploreCta: "Explorar Todas las Aventuras",
  datesCta: "Ver Fechas Disponibles",
},

tours: {
  eyebrow: "Elige tu próxima aventura",
  title: "Nuestras Experiencias",
  subtitle: "Desde emocionantes descensos en cañones hasta caminatas tranquilas en la selva, encuentra la aventura perfecta para ti.",
},
    conversion: {
      title: "Preguntas frecuentes",
      subtitle: "Respuestas rapidas para planear tu aventura con mas confianza.",
      faqs: [
  {
    question: "¿Puedo cambiar la fecha de mi tour después de reservar?",
    answer: "Sí, puedes solicitar el cambio de fecha con al menos 48 horas de anticipación. Nuestro equipo te ayudará a reprogramar según la disponibilidad disponible.",
  },
  {
    question: "¿Cuál es el tour más recomendado para principiantes?",
    answer: "Los tours más adecuados para principiantes son **Cascadas Secretas**, **Lluvia en la Naturaleza** y el **Tour Gastronómico**. Son de baja o moderada intensidad y no requieren experiencia previa.",
  },
  {
    question: "¿Qué pasa si llueve el día del tour?",
    answer: "La mayoría de nuestros tours operan con lluvia ligera. En caso de tormenta fuerte, te contactaremos con anticipación para ofrecerte una fecha alternativa o cambiar a otra actividad segura.",
  },
  {
    question: "¿Qué debo llevar al tour?",
    answer: "Depende del tour, pero en general recomendamos: ropa cómoda, zapatos que se puedan mojar, traje de baño, toalla, repelente, protector solar y una muda de ropa. Te enviaremos una lista específica al confirmar tu reserva.",
  },
  {
    question: "¿Hay edad mínima para participar?",
    answer: "La mayoría de los tours permiten desde los 10-12 años acompañados por un adulto. Los tours extremos como Rapel y Cuatrimotos tienen edad mínima de 14 y 16 años respectivamente.",
  },
  {
    question: "¿El transporte está incluido?",
    answer: "No, el transporte no está incluido. Podemos ayudarte a coordinar un traslado privado desde tu hotel por un costo adicional.",
  },
  {
    question: "¿Cuál es la política de cancelación?",
    answer: "Tienes cancelación gratuita hasta 48 horas antes del tour. Cancelaciones con menos de 48 horas no tienen reembolso.",
  }
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
      title: "Frequently Asked Questions",
      subtitle: "Quick answers to help you plan your adventure with confidence.",
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
