import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allan Rojas — CV",
  description:
    "Senior Full-Stack Software Engineer — 11+ years shipping production software across Java/Spring Boot, TypeScript/React, Python, C#/.NET and AWS.",
};

export default function AllanCvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
