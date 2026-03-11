import type { Config } from "tailwindcss";

const config: Config = {
  // content paths tell Tailwind which files to scan for class names and
  // apply directives.  include app, components, src, and any other
  // directories holding JSX/TSX/MDX templates.
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
