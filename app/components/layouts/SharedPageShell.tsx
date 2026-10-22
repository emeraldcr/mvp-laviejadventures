import type { ReactNode } from "react";
import HomeNav from "@/app/components/home/HomeNav";
import SiteFooter from "@/app/components/sections/SiteFooter";

type SharedPageShellProps = {
  children: ReactNode;
  className?: string;
  footer?: boolean;
  solidNav?: boolean;
};

export default function SharedPageShell({ children, className = "", footer = true, solidNav = true }: SharedPageShellProps) {
  return (
    <main className={`min-h-screen overflow-x-hidden bg-[#FAF9F6] font-sans text-stone-900 dark:bg-[#0b0a09] dark:text-stone-100 ${className}`}>
      <HomeNav solid={solidNav} />
      {children}
      {footer && <SiteFooter />}
    </main>
  );
}

export function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <SharedPageShell className="pb-16" footer={false} solidNav>
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-28 sm:px-6 md:pb-16 md:pt-32 lg:px-8">{children}</div>
    </SharedPageShell>
  );
}
