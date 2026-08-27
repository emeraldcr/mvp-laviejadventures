"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Printer } from "lucide-react";
import {
  contactInfo,
  education,
  experience,
  languages,
  personalInfo,
  primarySkills,
  secondarySkills,
  summary,
  type SummarySegment,
} from "./constants";

export default function CvElasticsearchPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: letter; margin: 0.4in; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-4xl items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-teal-600"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <span className="text-zinc-300">·</span>
          <Link href="/cv" className="text-sm text-zinc-500 transition-colors hover:text-teal-600">
            View full-stack version →
          </Link>
          <span className="text-zinc-300">·</span>
          <Link href="/cv/java" className="text-sm text-zinc-500 transition-colors hover:text-teal-600">
            View Java-centered version →
          </Link>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:border-transparent hover:bg-teal-600 hover:text-white"
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      <article className="relative mx-auto mt-4 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm md:grid-cols-[220px_1fr] print:mt-0 print:w-full print:max-w-none print:grid-cols-[2in_1fr] print:rounded-none print:border-0 print:shadow-none">
        <div className="absolute inset-x-0 top-0 z-10 h-[2px] bg-teal-600 md:col-span-2" />

        <aside className="relative border-b border-zinc-200 bg-zinc-50 px-6 py-8 md:border-b-0 md:border-r">
          <div className="relative">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold leading-[1.15] tracking-tight text-zinc-900">
              {personalInfo.name}
            </h1>
            <p className="mt-2.5 text-sm font-semibold text-teal-700">{personalInfo.title}</p>

            <div className="mt-6 space-y-1">
              {contactInfo.map((item) => (
                <ContactItem key={item.text} icon={item.icon} text={item.text} href={item.href} external={item.external} />
              ))}
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
    </main>
  );
}

function Segments({ segments }: { segments: SummarySegment[] }) {
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

function ContactItem({
  icon: Icon,
  text,
  href,
  external,
}: {
  icon: typeof Mail;
  text: string;
  href?: string;
  external?: boolean;
}) {
  const className =
    "flex items-center gap-2 py-0.5 text-[11.5px] font-medium text-zinc-700 transition-colors hover:text-teal-700";
  const content = (
    <>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400">
        <Icon size={11} />
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
