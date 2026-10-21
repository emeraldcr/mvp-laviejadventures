import SiteRoot, { metadata as siteMetadata } from "@/app/SiteRoot";
export const metadata = { ...siteMetadata, description: "Local nature and adventure tours in San Carlos, Costa Rica." };

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteRoot locale="en">{children}</SiteRoot>;
}
