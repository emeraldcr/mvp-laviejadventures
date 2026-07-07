"use client";

// TEMP preview page for visual verification — delete after use.
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const PenalitosField3D = dynamic(
  () =>
    import("../mundial/components/penalitos/PenalitosField3D").then((m) => ({
      default: m.PenalitosField3D,
    })),
  { ssr: false },
);

export default function Preview() {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [animStart, setAnimStart] = useState<number | null>(null);
  const [mode, setMode] = useState<"idle" | "goal" | "save">("idle");

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const phase =
    animStart === null
      ? ("idle" as const)
      : nowMs - animStart < 2200
        ? ("animating" as const)
        : ("result" as const);

  return (
    <div className="min-h-screen bg-black p-6 space-y-4">
      <div className="mx-auto max-w-3xl rounded-2xl overflow-hidden border border-white/10">
        <PenalitosField3D
          phase={mode === "idle" ? "idle" : phase}
          shooterChoice={mode === "idle" ? null : "left"}
          goalkeeperChoice={mode === "goal" ? "right" : "left"}
          outcome={mode === "idle" ? null : mode}
          animStartMs={animStart}
          nowMs={nowMs}
        />
      </div>
      <div className="flex gap-3 justify-center">
        <button
          id="btn-idle"
          className="px-4 py-2 bg-white/10 text-white rounded"
          onClick={() => {
            setMode("idle");
            setAnimStart(null);
          }}
        >
          Idle
        </button>
        <button
          id="btn-goal"
          className="px-4 py-2 bg-white/10 text-white rounded"
          onClick={() => {
            setMode("goal");
            setAnimStart(Date.now());
          }}
        >
          Goal
        </button>
        <button
          id="btn-save"
          className="px-4 py-2 bg-white/10 text-white rounded"
          onClick={() => {
            setMode("save");
            setAnimStart(Date.now());
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
