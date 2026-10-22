import type { ReactNode } from "react";
import SiteHeader from "@/app/components/navigation/SiteHeader";
import PageFooter from "@/app/components/sections/PageFooter";

type SharedPageShellProps = {
  children: ReactNode;
  className?: string;
  footer?: boolean;
  solidNav?: boolean;
};

export default function SharedPageShell({ children, className = "", footer = true, solidNav = true }: SharedPageShellProps) {
  return (
    <main className={`lva-public-shell min-h-screen overflow-x-hidden font-sans ${className}`}>
      <SiteHeader solid={solidNav} />
      {children}
      {footer && <PageFooter />}
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
