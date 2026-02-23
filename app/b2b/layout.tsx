import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal B2B – La Vieja Adventures",
  description: "Portal para operadores turísticos, hoteles y agentes de viaje.",
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {children}
    </div>
  );
}
