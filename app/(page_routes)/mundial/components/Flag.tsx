import { useMemo } from "react";
import { normalizeTeamName } from "../utils";

const COUNTRY_CODES: Record<string, string> = {
  argentina: "ar",
  brasil: "br",
  brazil: "br",
  mexico: "mx",
  "estados unidos": "us",
  usa: "us",
  "united states": "us",
  canada: "ca",
  uruguay: "uy",
  colombia: "co",
  chile: "cl",
  ecuador: "ec",
  peru: "pe",
  paraguay: "py",
  venezuela: "ve",
  bolivia: "bo",
  "costa rica": "cr",
  panama: "pa",
  honduras: "hn",
  jamaica: "jm",
  "el salvador": "sv",
  guatemala: "gt",
  haiti: "ht",
  "trinidad y tobago": "tt",
  "trinidad and tobago": "tt",
  curazao: "cw",
  curacao: "cw",
  "cabo verde": "cv",
  "cape verde": "cv",
  alemania: "de",
  germany: "de",
  francia: "fr",
  france: "fr",
  espana: "es",
  spain: "es",
  portugal: "pt",
  "paises bajos": "nl",
  netherlands: "nl",
  holanda: "nl",
  belgica: "be",
  belgium: "be",
  italia: "it",
  italy: "it",
  croacia: "hr",
  croatia: "hr",
  serbia: "rs",
  polonia: "pl",
  poland: "pl",
  suiza: "ch",
  switzerland: "ch",
  dinamarca: "dk",
  denmark: "dk",
  suecia: "se",
  sweden: "se",
  ucrania: "ua",
  ukraine: "ua",
  turquia: "tr",
  turkey: "tr",
  turkiye: "tr",
  austria: "at",
  noruega: "no",
  norway: "no",
  "bosnia y herzegovina": "ba",
  "bosnia and herzegovina": "ba",
  hungria: "hu",
  hungary: "hu",
  albania: "al",
  eslovenia: "si",
  slovenia: "si",
  rumania: "ro",
  romania: "ro",
  eslovaquia: "sk",
  slovakia: "sk",
  "republica checa": "cz",
  "czech republic": "cz",
  czechia: "cz",
  grecia: "gr",
  greece: "gr",
  japon: "jp",
  japan: "jp",
  "corea del sur": "kr",
  "south korea": "kr",
  "korea republic": "kr",
  "arabia saudita": "sa",
  "saudi arabia": "sa",
  iran: "ir",
  "ir iran": "ir",
  australia: "au",
  china: "cn",
  indonesia: "id",
  uzbekistan: "uz",
  qatar: "qa",
  irak: "iq",
  iraq: "iq",
  jordania: "jo",
  jordan: "jo",
  marruecos: "ma",
  morocco: "ma",
  senegal: "sn",
  nigeria: "ng",
  ghana: "gh",
  camerun: "cm",
  cameroon: "cm",
  tunez: "tn",
  tunisia: "tn",
  egipto: "eg",
  egypt: "eg",
  argelia: "dz",
  algeria: "dz",
  "costa de marfil": "ci",
  "ivory coast": "ci",
  "cote d'ivoire": "ci",
  mali: "ml",
  "rd congo": "cd",
  "congo dr": "cd",
  sudafrica: "za",
  "south africa": "za",
  "nueva zelanda": "nz",
  "new zealand": "nz",
  england: "gb-eng",
  inglaterra: "gb-eng",
  scotland: "gb-sct",
  escocia: "gb-sct",
  wales: "gb-wls",
  gales: "gb-wls",
};

type FlagProps = {
  team: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
};

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  "2xl": "h-32 w-32",
  "3xl": "h-56 w-56",
  "4xl": "h-96 w-96",
};

export function Flag({ team, size = "md", className }: FlagProps) {
  const countryCode = useMemo(() => {
    const normalized = normalizeTeamName(team);
    return COUNTRY_CODES[normalized] || null;
  }, [team]);

  const flagUrl = useMemo(() => {
    if (!countryCode) return null;
    return `https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/${countryCode}.svg`;
  }, [countryCode]);

  const sizeClass = sizeMap[size];

  if (!flagUrl) {
    return <span className={`${sizeClass} ${className || ""}`}>🏳️</span>;
  }

  return (
    <img
      src={flagUrl}
      alt={`Bandera de ${team}`}
      className={`${sizeClass} object-cover ${className || ""}`}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
