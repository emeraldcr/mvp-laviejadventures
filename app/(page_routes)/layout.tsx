import SiteRoot from "@/app/SiteRoot";
export { metadata } from "@/app/SiteRoot";

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <SiteRoot locale="es">{children}</SiteRoot>;
}
