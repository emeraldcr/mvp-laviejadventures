"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, FileText, Mail, Maximize2, Minimize2 } from "lucide-react";
import { CvDocument } from "./CvDocument";
import { CoverLetterDocument } from "./CoverLetterDocument";
import { A4, preview } from "./design";
import type { CvData } from "./types";

// WYSIWYG print preview: the exact A4 pages that will come out of the printer —
// résumé and/or cover letter — scaled to fit on screen, with a one-page overflow
// guard. Print chrome (toolbar, tags, banners) carries `cv-print-hide`; the
// sheets themselves are what `window.print()` emits.

export type PreviewDoc = "resume" | "letter" | "both";

const FIT_KEY = "cv:preview-fit";
type Fit = "fit" | "actual";

export function PrintPreview({
  cv,
  letter,
  company,
  docMode,
  onDocMode,
}: {
  cv: CvData;
  letter: string | null;
  company?: string;
  docMode: PreviewDoc;
  onDocMode: (d: PreviewDoc) => void;
}) {
  const [fit, setFit] = useState<Fit>("fit");

  useEffect(() => {
    try {
      const v = localStorage.getItem(FIT_KEY);
      if (v === "fit" || v === "actual") setFit(v);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(FIT_KEY, fit);
    } catch {
      /* ignore */
    }
  }, [fit]);

  const showResume = docMode === "resume" || docMode === "both";
  const showLetter = docMode === "letter" || docMode === "both";

  return (
    <div className={preview.surface}>
      <div className={preview.toolbar}>
        <div className={preview.segment}>
          <SegBtn icon={<FileText size={12} />} label="Résumé" on={docMode === "resume"} onClick={() => onDocMode("resume")} />
          <SegBtn icon={<Mail size={12} />} label="Cover letter" on={docMode === "letter"} onClick={() => onDocMode("letter")} />
          <SegBtn label="Both" on={docMode === "both"} onClick={() => onDocMode("both")} />
        </div>

        <div className="flex items-center gap-2">
          <span className={preview.hint}>A4 · print preview</span>
          <button
            type="button"
            onClick={() => setFit((f) => (f === "fit" ? "actual" : "fit"))}
            title={fit === "fit" ? "Show at 100%" : "Fit to width"}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-50"
          >
            {fit === "fit" ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
            {fit === "fit" ? "Actual size" : "Fit width"}
          </button>
        </div>
      </div>

      <div className={preview.stack}>
        {showResume && (
          <SheetFrame fit={fit} label="Résumé · A4" measureKey={resumeKey(cv)}>
            {(ref) => <CvDocument cv={cv} sheetRef={ref} />}
          </SheetFrame>
        )}
        {showLetter && (
          <SheetFrame fit={fit} label="Cover letter · A4" measureKey={`L:${(letter ?? "").length}`}>
            {(ref) => <CoverLetterDocument letter={letter} company={company} sheetRef={ref} />}
          </SheetFrame>
        )}
      </div>
    </div>
  );
}

function resumeKey(cv: CvData): string {
  return `R:${cv.personalInfo.title}:${cv.experience.length}:${cv.highlights?.length ?? 0}:${cv.experience.reduce(
    (n, j) => n + j.bullets.length,
    0,
  )}`;
}

function SegBtn({ icon, label, on, onClick }: { icon?: ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${preview.segBtn} ${on ? preview.segOn : preview.segOff} inline-flex items-center gap-1`}
    >
      {icon}
      {label}
    </button>
  );
}

function SheetFrame({
  fit,
  label,
  measureKey,
  children,
}: {
  fit: Fit;
  label: string;
  measureKey: string;
  children: (ref: (el: HTMLElement | null) => void) => ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetElRef = useRef<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const [overflow, setOverflow] = useState(false);

  // scale-to-fit: measure the column, never upscale past 1:1
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const apply = () => {
      const avail = wrap.clientWidth;
      setScale(fit === "actual" ? 1 : Math.min(1, avail / A4.wPx));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [fit]);

  // one-page guard: the sheet clips at 297mm, so scrollHeight > clientHeight
  // means content ran past the page edge.
  const checkOverflow = useCallback(() => {
    const el = sheetElRef.current;
    if (!el) return;
    setOverflow(el.scrollHeight - el.clientHeight > 2);
  }, []);

  useEffect(() => {
    checkOverflow();
    const t = window.setTimeout(checkOverflow, 250);
    let cancelled = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready?.then(() => {
      if (!cancelled) checkOverflow();
    });
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [checkOverflow, measureKey]);

  const setSheet = useCallback(
    (el: HTMLElement | null) => {
      sheetElRef.current = el;
      checkOverflow();
    },
    [checkOverflow],
  );

  return (
    <div ref={wrapRef} className="w-full">
      <div className={preview.capRow}>
        <span className={preview.capLabel}>{label}</span>
        <span className={`${preview.pill} ${overflow ? preview.pillOver : preview.pillOk}`}>
          {overflow ? <AlertTriangle size={10} /> : <Check size={10} />}
          {overflow ? "Over one page" : "Fits one page"}
        </span>
      </div>

      <div
        className={`cv-scale-box relative mx-auto ${fit === "actual" ? "overflow-x-auto" : ""}`}
        style={{ width: A4.wPx * scale, height: A4.hPx * scale, maxWidth: "100%" }}
      >
        <div
          className="cv-scale-layer origin-top-left"
          style={{ width: A4.wPx, height: A4.hPx, transform: `scale(${scale})` }}
        >
          {children(setSheet)}
        </div>
      </div>

      {overflow && (
        <p className={preview.overNote}>
          This variant’s content runs past a single A4 sheet. Trim a few bullet lines or shorten the summary so it prints
          on one page.
        </p>
      )}
    </div>
  );
}
