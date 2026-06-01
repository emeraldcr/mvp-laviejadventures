import type { Metadata } from "next";
import type { ReactNode } from "react";

import SessionProvider from "@/app/components/SessionProvider";

export const metadata: Metadata = {
  title: "Dashboard | La Vieja Adventures",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
