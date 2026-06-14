import { useEffect, useMemo, useState } from "react";
import { flagCdnUrl, resolveTeamFlag } from "../flags";

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
  const flag = useMemo(() => resolveTeamFlag(team), [team]);
  const flagUrl = useMemo(() => (flag.code ? flagCdnUrl(flag.code) : null), [flag.code]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [flagUrl]);

  const sizeClass = sizeMap[size];
  const classes = `${sizeClass} ${className || ""}`;

  if (!flagUrl || imageFailed) {
    return (
      <span
        className={`${classes} inline-grid place-items-center leading-none`}
        aria-label={`Bandera de ${team}`}
        role="img"
      >
        {flag.emoji}
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={`Bandera de ${team}`}
      className={`${classes} object-contain`}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}
