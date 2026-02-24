// LastUpdate.tsx
"use client";

import { useEffect, useState } from "react";
import type { LastUpdateProps } from "@/lib/types";

export default function LastUpdate({ lastUpdateISO }: LastUpdateProps) {
  const [relative, setRelative] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(lastUpdateISO).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) setRelative("ahora mismo");
      else if (min < 60) setRelative(`hace ${min} min`);
      else setRelative(`hace ${Math.floor(min / 60)} h`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [lastUpdateISO]);

  return (
    <div className="text-center text-slate-400 mb-6">
      Última medición: {relative} • {new Date(lastUpdateISO).toLocaleString("es-CR")}
    </div>
  );
}