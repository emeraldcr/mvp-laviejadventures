import type { LucideIcon } from "lucide-react";
import type { CvData, SummarySegment } from "./types";

// The printable résumé sheet. Layout is identical for every variant — only the
// `cv` data differs. Kept free of variant-switching / audit chrome so it prints
// clean on its own.

export function CvDocument({ cv }: { cv: CvData }) {
  const { personalInfo, contactInfo, primarySkills, secondarySkills, education, languages, summary, experience } = cv;

  return (
    <article className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm md:grid-cols-[220px_1fr] print:mt-0 print:w-full print:max-w-none print:grid-cols-[2in_1fr] print:rounded-none print:border-0 print:shadow-none">
      <div className="absolute inset-x-0 top-0 z-10 h-[2px] bg-teal-600 md:col-span-2" />

      <aside className="relative border-b border-zinc-200 bg-zinc-50 px-6 py-8 md:border-b-0 md:border-r">
        <div className="relative">
          <header className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-600/30 bg-white font-[family-name:var(--font-display)] text-base font-bold tracking-wide text-teal-700 shadow-sm">
              {monogram(personalInfo.name)}
            </div>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[19px] font-bold leading-[1.15] tracking-tight text-zinc-900">
              {personalInfo.name}
            </h1>
            <p className="mt-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-teal-700">
              {personalInfo.title}
            </p>
            <span className="mt-3 block h-px w-10 bg-teal-600/50" />
          </header>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] print:shadow-none">
            <div className="space-y-0.5">
              {contactInfo.map((item) => (
                <ContactItem
                  key={item.text}
                  icon={item.icon}
                  text={item.text}
                  href={item.href}
                  external={item.external}
                />
              ))}
            </div>
          </div>

          <SidebarHeading title="Core Skills" />
          <div className="mt-3 space-y-3">
            {primarySkills.map((group) => (
              <div key={group.label}>
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-teal-700">{group.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">{group.items.join(" · ")}</p>
              </div>
            ))}
            {secondarySkills.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{group.label}</p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-zinc-500">{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>

          <SidebarHeading title="Education" />
          <div className="mt-2 text-[11.5px] leading-relaxed text-zinc-600">
            <p className="font-semibold text-zinc-900">{education.degree}</p>
            <p>{education.school}</p>
            <p>{education.period}</p>
            <p className="mt-1.5">
              <span className="font-semibold text-zinc-900">{education.internshipLabel}</span> {education.internship}
            </p>
          </div>

          <SidebarHeading title="Languages" />
          <div className="mt-2 text-[11.5px] leading-relaxed text-zinc-600">
            {languages.map((entry) => (
              <p key={entry.language}>
                {entry.language} — {entry.level}
              </p>
            ))}
          </div>
        </div>
      </aside>

      <div className="px-7 py-8 print:px-6 print:py-5">
        <SectionHeading title="Professional Summary" />
        {summary.map((paragraph, index) => (
          <p
            key={index}
            className={`text-[12.5px] leading-relaxed text-zinc-700 print:text-[11px] ${
              index === 0 ? "mt-2.5" : "mt-1.5 print:mt-1"
            }`}
          >
            <Segments segments={paragraph} />
          </p>
        ))}

        <SectionHeading title="Professional Experience" className="mt-6" />
        <div className="relative mt-4 space-y-6 print:mt-2 print:space-y-3">
          <div className="absolute bottom-2 left-[3px] top-2 w-px bg-zinc-200" />
          {experience.map((job, index) => {
            const fade = job.current ? 1 : Math.max(1 - index * 0.07, 0.7);
            return (
              <div
                key={`${job.role}-${job.company}`}
                className="relative flex gap-3 break-inside-avoid pl-5"
                style={{ opacity: fade }}
              >
                <span
                  className={`absolute left-0 top-[5px] h-2 w-2 rounded-full ring-4 ring-white ${
                    job.current ? "bg-teal-600" : "bg-zinc-300"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13.5px] font-bold text-zinc-900 print:text-[12.5px]">{job.role}</h3>
                  <p className="mt-0.5 text-[11.5px] font-medium text-zinc-500 print:text-[10px]">
                    {job.company}
                    {job.current && (
                      <span className="ml-1.5 font-semibold uppercase tracking-wide text-teal-700">· Current</span>
                    )}
                  </p>
                  <ul className="mt-1.5 space-y-0.5 print:mt-1">
                    {job.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-1.5 text-[13px] leading-snug text-zinc-700 print:text-[11px]"
                      >
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-[104px] shrink-0 text-right">
                  <p className="text-[11px] font-medium text-zinc-500 print:text-[9px]">{job.period}</p>
                  <p className="text-[10.5px] text-zinc-400 print:text-[9px]">{job.location}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function Segments({ segments }: { segments: readonly SummarySegment[] }) {
  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={segment.bold ? (segment.accent ? "font-semibold text-teal-700" : "font-semibold text-zinc-900") : undefined}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

/** First given name + first surname initials (falls back gracefully). */
function monogram(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 4) return (parts[0][0] + parts[2][0]).toUpperCase();
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
}

function ContactItem({
  icon: Icon,
  text,
  href,
  external,
}: {
  icon: LucideIcon;
  text: string;
  href?: string;
  external?: boolean;
}) {
  const className =
    "group flex items-center gap-2.5 rounded-md px-1.5 py-1 text-[11px] font-medium leading-snug text-zinc-600 transition-colors hover:bg-teal-50/70 hover:text-teal-700";
  const content = (
    <>
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-400 transition-colors group-hover:border-teal-200 group-hover:bg-white group-hover:text-teal-600 print:border-zinc-300 print:text-zinc-500">
        <Icon size={12} />
      </span>
      <span>{text}</span>
    </>
  );

  if (!href) {
    return <p className={className}>{content}</p>;
  }

  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={className}>
      {content}
    </a>
  );
}

function SidebarHeading({ title }: { title: string }) {
  return (
    <h2 className="mt-5 border-t border-zinc-200 pt-3 text-[11px] font-bold uppercase tracking-wider text-zinc-900">
      {title}
    </h2>
  );
}

function SectionHeading({ title, className = "" }: { title: string; className?: string }) {
  return (
    <h2
      className={`border-b border-zinc-200 pb-1.5 text-[12.5px] font-bold uppercase tracking-wide text-zinc-900 print:text-[12px] ${className}`}
    >
      {title}
    </h2>
  );
}
