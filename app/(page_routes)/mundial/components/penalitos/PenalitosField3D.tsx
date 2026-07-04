"use client";

import { memo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PenalitosScene, type PenalitosScenePhase } from "./PenalitosScene";
import type { PenalitosDirection } from "../../types";

export type PenalitosField3DProps = {
  phase: PenalitosScenePhase;
  shooterChoice: PenalitosDirection | null;
  goalkeeperChoice: PenalitosDirection | null;
  outcome: "goal" | "save" | null;
  animStartMs: number | null;
  nowMs: number;
  compact?: boolean;
};

function FieldFallback({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center bg-[#0a3d1f] ${compact ? "h-32 sm:h-44" : "h-56 sm:h-72"}`}
    >
      <span className="text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse">
        Cargando cancha…
      </span>
    </div>
  );
}

export const PenalitosField3D = memo(function PenalitosField3D({
  phase,
  shooterChoice,
  goalkeeperChoice,
  outcome,
  animStartMs,
  nowMs,
  compact = false,
}: PenalitosField3DProps) {
  return (
    <div className={compact ? "h-32 sm:h-44" : "h-56 sm:h-72"}>
      <Canvas
        camera={{ position: [0, 1.75, 7.2], fov: 48, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.9, 0);
        }}
      >
        <Suspense fallback={null}>
          <PenalitosScene
            phase={phase}
            shooterChoice={shooterChoice}
            goalkeeperChoice={goalkeeperChoice}
            outcome={outcome}
            animStartMs={animStartMs}
            nowMs={nowMs}
          />
        </Suspense>
      </Canvas>
    </div>
  );
});

export { FieldFallback };