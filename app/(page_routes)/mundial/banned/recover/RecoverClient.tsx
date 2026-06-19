"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RecoverClient() {
  const params = useSearchParams();
  const player = params.get("playerName") ?? "";

  return (
    <div className="min-h-screen bg-[#060e08] flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black text-white mb-1">Recuperación de cuenta</h1>
        <p className="text-sm text-white/45">Proceso de verificación de identidad</p>
      </div>

      {player ? (
        <p className="mb-4 text-white/80">Jugador: {player}</p>
      ) : (
        <p className="mb-4 text-white/45">Ingresa tu nombre en la quiniela para iniciar el proceso.</p>
      )}

      <Link href="/mundial/banned" className="text-sm text-white/60 underline">
        Volver
      </Link>
    </div>
  );
}
