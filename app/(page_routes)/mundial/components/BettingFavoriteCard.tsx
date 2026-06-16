import { BadgePercent, ExternalLink, TrendingUp } from "lucide-react";
import { bettingFavoriteLabel } from "@/lib/mundial/betting";
import type { MundialMatch } from "../types";
import { cn, formatUpdatedAt, teamCode } from "../utils";
import { Flag } from "./Flag";

type BettingFavoriteCardProps = {
  match: MundialMatch;
  variant?: "featured" | "compact";
};

export function BettingFavoriteCard({ match, variant = "featured" }: BettingFavoriteCardProps) {
  const favorite = match.bettingFavorite;
  if (!favorite) return null;

  const isCompact = variant === "compact";
  const favoriteText = bettingFavoriteLabel(favorite);
  const source = favorite.bookmaker || favorite.source || favorite.marketLabel;
  const updatedAt = favorite.updatedAt ? formatUpdatedAt(favorite.updatedAt) : "";
  const sideTeam = favorite.side === "home" ? match.homeTeam : favorite.side === "away" ? match.awayTeam : "";

  if (isCompact) {
    return (
      <div className="mt-3 rounded-lg border border-[#d5ff3f]/20 bg-[#1a2206]/45 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <BadgePercent className="h-3.5 w-3.5 shrink-0 text-[#d5ff3f]" />
          <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-[#d5ff3f]/75">
            Favorito
          </span>
          <span className="min-w-0 truncate text-xs font-black text-white">{favoriteText}</span>
        </div>
        <p className="mt-1 truncate text-[10px] font-bold text-white/35">{source}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-[#d5ff3f]/30 bg-[#1a2206]/55">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/20 px-3 py-2">
        <p className="inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d5ff3f]">
          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#f0b429]" />
          <span className="truncate">Favorito mercado</span>
        </p>
        {favorite.sourceUrl ? (
          <a
            href={favorite.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[10px] font-black text-white/60 transition hover:border-[#d5ff3f] hover:text-white"
          >
            Fuente
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>

      <div className="grid gap-3 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-11 shrink-0 place-items-center rounded-md border border-white/15 bg-black">
            {sideTeam ? <Flag team={sideTeam} size="sm" /> : <span className="text-xs font-black text-white">X</span>}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl font-black text-white">{favoriteText}</p>
            <p className="mt-0.5 truncate text-xs font-bold text-white/45">
              {[source, favorite.marketLabel, updatedAt].filter(Boolean).join(" / ")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MarketCell
            label={teamCode(match.homeTeam)}
            active={favorite.side === "home"}
            price={favorite.homePrice}
            betPct={favorite.homeBetPct}
            impliedPct={favorite.homeImpliedPct}
          />
          <MarketCell
            label="EMP"
            active={favorite.side === "draw"}
            price={favorite.drawPrice}
            betPct={favorite.drawBetPct}
            impliedPct={favorite.drawImpliedPct}
          />
          <MarketCell
            label={teamCode(match.awayTeam)}
            active={favorite.side === "away"}
            price={favorite.awayPrice}
            betPct={favorite.awayBetPct}
            impliedPct={favorite.awayImpliedPct}
          />
        </div>

        {favorite.note && (
          <p className="rounded-md border border-white/10 bg-black/25 px-2 py-1.5 text-xs font-bold text-white/55">
            {favorite.note}
          </p>
        )}
      </div>
    </div>
  );
}

function MarketCell({
  label,
  active,
  price,
  betPct,
  impliedPct,
}: {
  label: string;
  active: boolean;
  price: number | null;
  betPct: number | null;
  impliedPct: number | null;
}) {
  const pct = betPct ?? impliedPct;

  return (
    <div
      className={cn(
        "min-w-0 rounded-md border px-2 py-2 text-center",
        active ? "border-[#d5ff3f]/70 bg-[#d5ff3f]/12" : "border-white/10 bg-black/25"
      )}
    >
      <p className={cn("truncate text-[10px] font-black uppercase", active ? "text-[#d5ff3f]" : "text-white/45")}>
        {label}
      </p>
      <p className="mt-1 text-sm font-black tabular-nums text-white">{pct !== null ? `${pct}%` : "--"}</p>
      {price !== null && (
        <p className="mt-0.5 text-[10px] font-bold tabular-nums text-white/35">{price.toFixed(2)}</p>
      )}
    </div>
  );
}
