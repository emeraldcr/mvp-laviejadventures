import type { Metadata } from "next";
import type { ReactNode } from "react";

import SessionProvider from "@/app/components/SessionProvider";

export const metadata: Metadata = {
  title: "Autenticación | La Vieja Adventures",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
