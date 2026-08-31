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
  /** Company / posting this variant was tailored for — shown as a label in the
   *  sidebar so you can tell which application each CV belongs to. Free text
   *  ("Zazmic", "Acme · Sr FE posting"). Leave unset for general-purpose variants. */
  company?: string;
  /** One line: when to send this one. */
  when: string;
  /** Keywords this variant deliberately leans into (shown as tags). */
  focus: string[];

  // ── application metadata (optional) — feeds the auto cover letter + tracker ──
  /** Role title exactly as written in the posting (defaults to `role`). */
  postingTitle?: string;
  /** Location line from the posting, e.g. "LATAM · 100% Remote". */
  location?: string;
  /** Recruiter / hiring-manager name for the cover-letter greeting. */
  hiringManager?: string;
  /** Where the application goes — email or link. */
  contactEmail?: string;
  /** URL of the posting. */
  jobUrl?: string;
  /** yyyy-mm-dd this variant was tailored — tiebreaker for the "Recent" sort. */
  tailoredOn?: string;
  /** Verbatim "why this company" paragraph for the auto cover letter. */
  coverLetterNotes?: string;
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
    slug: "agentic-ai",
    path: "/cv/agentic-ai",
    name: "Agentic AI Engineer",
    role: "Agentic AI Engineer",
    when: "AI / agentic engineering roles — LLM apps, RAG, and tool-calling systems in production.",
    focus: ["LLMs (OpenAI / Claude)", "RAG", "Agents / tool-calling", "Python · AWS · TS"],
  },
  {
    slug: "python-react-lead",
    path: "/cv/python-react-lead",
    name: "Tech Lead · Python / React",
    role: "Tech Lead · Full-Stack Engineer",
    company: "Zazmic",
    when: "Tech Lead / senior full-stack roles on a Python + React + AWS serverless stack, with LangGraph / OpenAI agents.",
    focus: ["Python · React / TS", "AWS serverless", "LangGraph · OpenAI agents", "Tech lead · ownership"],
    postingTitle: "Tech Lead — Full Stack (Python / React)",
    location: "LATAM · 100% Remote",
    contactEmail: "cristina.caetano@zazmic.ai",
    tailoredOn: "2026-08-30",
  },
  {
    slug: "python-react-aws",
    path: "/cv/python-react-aws",
    name: "Full-Stack · Python / React / AWS",
    role: "Senior Full-Stack Engineer",
    company: "Zazmic",
    when: "Self-directed IC full-stack roles — drop into an existing AWS / Python / React codebase and ship with minimal oversight.",
    focus: ["Python · React / TS", "AWS serverless", "LangGraph · OpenAI agents", "Self-directed IC"],
    postingTitle: "Full Stack Developer — Python / React (AWS Cloud)",
    location: "Remote",
    tailoredOn: "2026-08-30",
  },
  {
    slug: "python-dotnet",
    path: "/cv/python-dotnet",
    name: "Python + .NET / Azure",
    role: "Senior Full-Stack Software Engineer",
    when: "Full-stack roles on a Python/FastAPI + C#/.NET 8 stack with React 19 and Azure.",
    focus: ["Python / FastAPI", "C# / .NET 8", "React 19 · PostgreSQL", "Azure"],
  },
  {
    slug: "java",
    path: "/cv/java",
    name: "Java / Spring Boot",
    role: "Java Backend Engineer",
    when: "Backend-heavy Core Java roles — internal developer platforms, JVM performance tuning, and large-scale distributed systems.",
    focus: ["Core Java / JVM", "Concurrency", "Spring Boot · gRPC", "AWS · Kubernetes"],
  },
  {
    slug: "elasticsearch",
    path: "/cv/elasticsearch",
    name: "Elasticsearch / Node.js",
    role: "Elasticsearch & Node.js Engineer",
    when: "Search, observability and Node backend roles.",
    focus: ["Elasticsearch", "Query DSL", "Node.js", "Datadog / APM"],
  },
  {
    slug: "electric-air",
    path: "/cv/electric-air",
    name: "Django + React (Remix)",
    role: "Senior Full Stack Software Engineer",
    company: "Electric Air",
    when: "Product full-stack roles on a Python/Django + React (Remix) stack — startup, end-to-end ownership.",
    focus: ["Python / Django", "React / Remix", "PostgreSQL", "AI integration"],
  },
  {
    slug: "designli",
    path: "/cv/designli",
    name: "React + Node (NestJS)",
    role: "Senior Full-Stack Engineer",
    company: "Designli",
    when: "Full-stack web roles on a React/Next + Node/NestJS stack — testing, clean architecture, and AI features.",
    focus: ["React / Next.js", "Node.js / NestJS", "Testing + CI/CD", "LLM / agentic features"],
  },
];

export const cvVariantBySlug = (slug: string): CvVariant | undefined =>
  cvVariants.find((v) => v.slug === slug);
