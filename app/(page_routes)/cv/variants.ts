// ─────────────────────────────────────────────────────────────
// Résumé variant registry — single source of truth for the sidebar.
//
// To add a new variant:
//   1. Create app/(page_routes)/cv/<slug>/constants.ts (copy an existing one,
//      adapt the summary + experience bullets + skills to the target role).
//   2. Create app/(page_routes)/cv/<slug>/page.tsx (3-line wrapper — copy one).
//   3. Add an entry to the array below.
// The sidebar, the variant switcher and the "active" highlight update from here.
// ─────────────────────────────────────────────────────────────

export type CvVariant = {
  /** URL slug under /cv — empty string for the base résumé. */
  slug: string;
  /** Resolved route. */
  path: string;
  /** Short name shown in the sidebar. */
  name: string;
  /** Headline / target title this variant leads with. */
  role: string;
  /** One line: when to send this one. */
  when: string;
  /** Keywords this variant deliberately leans into (shown as tags). */
  focus: string[];
};

export const cvVariants: CvVariant[] = [
  {
    slug: "",
    path: "/cv",
    name: "Full-Stack",
    role: "Senior Software Engineer",
    when: "General senior / full-stack roles — broadest surface area.",
    focus: ["Java / Spring Boot", "TypeScript / React", "PHP / Laravel", "AWS"],
  },
  {
    slug: "java",
    path: "/cv/java",
    name: "Java / Spring Boot",
    role: "Senior Java Software Engineer",
    when: "Backend-heavy Java roles — microservices, JVM, distributed systems.",
    focus: ["Spring Boot", "Microservices", "AWS", "Kubernetes"],
  },
  {
    slug: "elasticsearch",
    path: "/cv/elasticsearch",
    name: "Elasticsearch / Node.js",
    role: "Elasticsearch & Node.js Engineer",
    when: "Search, observability and Node backend roles.",
    focus: ["Elasticsearch", "Query DSL", "Node.js", "Datadog / APM"],
  },
];

export const cvVariantBySlug = (slug: string): CvVariant | undefined =>
  cvVariants.find((v) => v.slug === slug);
