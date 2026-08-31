import type { CSSProperties, Ref } from "react";
import type { LucideIcon } from "lucide-react";
import type { CvData, SummarySegment } from "./types";
import { color, gap, margin, sheet, text } from "./design";

// The printable résumé — one physical A4 page, identical layout for every
// variant (only `cv` data differs). Every visual decision comes from ./design;
// this file is structure only, no magic numbers. Kept free of variant-switching
// / audit chrome so it prints clean on its own.

const mm = (n: number) => `${n}mm`;

export function CvDocument({ cv, sheetRef }: { cv: CvData; sheetRef?: Ref<HTMLElement> }) {
  const { personalInfo, contactInfo, primarySkills, secondarySkills, education, languages, summary, highlights, experience } =
    cv;

  const sidebarPad: CSSProperties = {
    padding: `${mm(margin.cvTop)} ${mm(margin.cvSideNarrow)} ${mm(margin.cvBottom)}`,
  };
  const mainPad: CSSProperties = {
    padding: `${mm(margin.cvTop)} ${mm(margin.cvSideWide)} ${mm(margin.cvBottom)}`,
  };

  return (
    <article ref={sheetRef} className={sheet.frame} style={sheet.style}>
      <div className={sheet.topRule} />

      <div className="grid h-full" style={{ gridTemplateColumns: `${margin.cvSidebarW}mm 1fr` }}>
        {/* ── sidebar ─────────────────────────────────────── */}
        <aside className={`flex h-full flex-col border-r ${color.hairline} ${color.sidebar}`} style={sidebarPad}>
          <header className="flex flex-col items-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-600/30 bg-white shadow-sm">
              <span className={text.monogram}>{monogram(personalInfo.name)}</span>
            </div>
            <h1 className={`mt-2.5 ${text.name}`}>{personalInfo.name}</h1>
            <p className={`mt-2 ${text.title}`}>{personalInfo.title}</p>
            <span className={`mt-2.5 block h-px w-8 ${color.accentRule}`} />
          </header>

          <div className={`mt-4 rounded-md border ${color.hairline} bg-white px-2.5 py-2`}>
            <div className="space-y-1">
              {contactInfo.map((item) => (
                <ContactItem key={item.text} icon={item.icon} label={item.text} href={item.href} external={item.external} />
              ))}
            </div>
          </div>

          <SidebarHeading title="Core Skills" />
          <div className="mt-2.5 space-y-2">
            {primarySkills.map((group) => (
              <div key={group.label}>
                <p className={text.skillLabel}>{group.label}</p>
                <p className={`mt-0.5 ${text.skillItems}`}>{group.items.join("  ·  ")}</p>
              </div>
            ))}
            {secondarySkills.map((group) => (
              <div key={group.label}>
                <p className={text.skillLabelMuted}>{group.label}</p>
                <p className={`mt-0.5 ${text.skillItemsMuted}`}>{group.items.join("  ·  ")}</p>
              </div>
            ))}
          </div>

          <SidebarHeading title="Education" />
          <div className={`mt-1.5 ${text.sidebarBody}`}>
            <p className={text.sidebarStrong}>{education.degree}</p>
            <p>{education.school}</p>
            <p>{education.period}</p>
            <p className="mt-1">
              <span className={text.sidebarStrong}>{education.internshipLabel}</span> {education.internship}
            </p>
          </div>

          <SidebarHeading title="Languages" />
          <div className={`mt-1.5 ${text.sidebarBody}`}>
            {languages.map((entry) => (
              <p key={entry.language}>
                <span className={text.sidebarStrong}>{entry.language}</span> — {entry.level}
              </p>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <span className={`block h-px w-full ${color.hairlineBg}`} />
            <p className={`mt-2 ${text.footer}`}>{personalInfo.name}</p>
          </div>
        </aside>

        {/* ── main column ─────────────────────────────────── */}
        <div className="flex h-full flex-col" style={mainPad}>
          {highlights && highlights.length > 0 && (
            <section style={{ marginBottom: mm(gap.afterHighlights) }}>
              <SectionHeading title="What I Bring" />
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {highlights.map((h) => (
                  <div key={h.title} className="break-inside-avoid">
                    <p className={text.hlTitle}>{h.title}</p>
                    <p className={`mt-px ${text.hlDetail}`}>{h.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <SectionHeading title="Professional Summary" />
          <div style={{ marginTop: mm(gap.afterHeading) }}>
            {summary.map((paragraph, index) => (
              <p key={index} className={text.lead} style={index === 0 ? undefined : { marginTop: mm(1.6) }}>
                <Segments segments={paragraph} />
              </p>
            ))}
          </div>

          <SectionHeading title="Professional Experience" style={{ marginTop: mm(gap.beforeSection) }} />
          <div className="relative flex-1" style={{ marginTop: mm(gap.afterHeading) }}>
            <div className="absolute bottom-1 left-[3px] top-1 w-px bg-zinc-200" />
            <div className="flex flex-col" style={{ rowGap: mm(gap.betweenJobs) }}>
              {experience.map((job, index) => {
                const fade = job.current ? 1 : Math.max(1 - index * 0.05, 0.74);
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
                      <h3 className={text.role}>{job.role}</h3>
                      <p className={`mt-0.5 ${text.company}`}>
                        {job.company}
                        {job.current && <span className={`ml-1.5 ${text.current}`}>· Current</span>}
                      </p>
                      <ul
                        className="flex flex-col"
                        style={{ marginTop: mm(gap.jobHeadToBullets), rowGap: mm(gap.betweenBullets) }}
                      >
                        {job.bullets.map((bullet) => (
                          <li key={bullet} className={`flex items-start gap-1.5 ${text.bullet}`}>
                            <span className="mt-[6px] h-[3px] w-[3px] shrink-0 rounded-full bg-zinc-300" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-[26mm] shrink-0 text-right">
                      <p className={text.period}>{job.period}</p>
                      <p className={`mt-0.5 ${text.location}`}>{job.location}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto pt-3">
            <span className={`block h-px w-full ${color.hairlineBg}`} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className={`truncate ${text.footer}`}>{personalInfo.name}</p>
              <p className={`truncate ${text.footer}`}>{personalInfo.title}</p>
              <p className={`shrink-0 ${text.footer}`}>Résumé</p>
            </div>
          </div>
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
          className={
            segment.bold
              ? segment.accent
                ? "font-semibold text-teal-700"
                : "font-semibold text-zinc-900"
              : undefined
          }
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

function ContactItem({
  icon: Icon,
  label,
  href,
  external,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  external?: boolean;
}) {
  const className = `flex items-center gap-1.5 ${text.contact} transition-colors hover:text-teal-700`;
  const content = (
    <>
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-zinc-400">
        <Icon size={10} />
      </span>
      <span className="min-w-0 break-words">{label}</span>
    </>
  );

  if (!href) return <p className={className}>{content}</p>;
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={className}>
      {content}
    </a>
  );
}

function SidebarHeading({ title }: { title: string }) {
  return <h2 className={`mt-4 border-t ${color.hairline} pt-2.5 ${text.sidebarHeading}`}>{title}</h2>;
}

function SectionHeading({ title, style }: { title: string; style?: CSSProperties }) {
  return (
    <h2 className={`border-b ${color.hairline} pb-1 ${text.sectionHeading}`} style={style}>
      {title}
    </h2>
  );
}

/** First given name + first surname initials (falls back gracefully). */
function monogram(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 4) return (parts[0][0] + parts[2][0]).toUpperCase();
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
}
