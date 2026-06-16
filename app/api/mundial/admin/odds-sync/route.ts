import { NextResponse } from "next/server";

import { getDb } from "@/lib/helpers/mongodb";
import { serializeBettingFavorite } from "@/lib/mundial/betting";

export const dynamic = "force-dynamic";

const MATCHES_COLLECTION = "mundial_matches";
const DEFAULT_REGIONS = "us,eu";
const MATCH_TIME_TOLERANCE_MS = 36 * 60 * 60 * 1000;

type MatchDoc = {
  id: string;
  number: number;
  kickoffAt: string;
  homeTeam: string;
  awayTeam: string;
};

type OddsOutcome = {
  name?: string;
  price?: number;
};

type OddsMarket = {
  key?: string;
  outcomes?: OddsOutcome[];
};

type OddsBookmaker = {
  key?: string;
  title?: string;
  markets?: OddsMarket[];
};

type OddsEvent = {
  commence_time?: string;
  home_team?: string;
  away_team?: string;
  bookmakers?: OddsBookmaker[];
};

const TEAM_ALIASES: Record<string, string> = {
  unitedstates: "usa",
  usmnt: "usa",
  southkorea: "korearepublic",
  czechrepublic: "czechia",
  ivorycoast: "cotedivoire",
  capeverde: "caboverde",
  drcongo: "congodr",
  congodr: "congodr",
  iran: "iriran",
  iriran: "iriran",
  netherlands: "netherlands",
  holland: "netherlands",
};

function normalizeTeam(value: string) {
  const key = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return TEAM_ALIASES[key] ?? key;
}

function eventTime(event: OddsEvent) {
  const ms = new Date(event.commence_time ?? "").getTime();
  return Number.isNaN(ms) ? null : ms;
}

function matchTime(match: MatchDoc) {
  const ms = new Date(match.kickoffAt).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function sameFixture(event: OddsEvent, match: MatchDoc) {
  if (!event.home_team || !event.away_team) return false;

  const eventHome = normalizeTeam(event.home_team);
  const eventAway = normalizeTeam(event.away_team);
  const matchHome = normalizeTeam(match.homeTeam);
  const matchAway = normalizeTeam(match.awayTeam);
  const sameTeams =
    (eventHome === matchHome && eventAway === matchAway) ||
    (eventHome === matchAway && eventAway === matchHome);
  if (!sameTeams) return false;

  const left = eventTime(event);
  const right = matchTime(match);
  if (left === null || right === null) return true;

  return Math.abs(left - right) <= MATCH_TIME_TOLERANCE_MS;
}

function average(values: number[]) {
  if (!values.length) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return Number((sum / values.length).toFixed(3));
}

function outcomeSide(event: OddsEvent, match: MatchDoc, outcomeName: string) {
  const normalized = normalizeTeam(outcomeName);
  if (normalized === "draw" || normalized === "tie" || normalized === "empate") return "draw" as const;

  const eventHome = normalizeTeam(event.home_team ?? "");
  const eventAway = normalizeTeam(event.away_team ?? "");
  const matchHome = normalizeTeam(match.homeTeam);
  const matchAway = normalizeTeam(match.awayTeam);

  if (normalized === matchHome) return "home" as const;
  if (normalized === matchAway) return "away" as const;
  if (normalized === eventHome) return eventHome === matchHome ? "home" as const : "away" as const;
  if (normalized === eventAway) return eventAway === matchAway ? "away" as const : "home" as const;
  return null;
}

function oddsForMatch(event: OddsEvent, match: MatchDoc) {
  const prices: Record<"home" | "draw" | "away", number[]> = { home: [], draw: [], away: [] };
  const bookmakerTitles = new Set<string>();

  for (const bookmaker of event.bookmakers ?? []) {
    const h2h = bookmaker.markets?.find((market) => market.key === "h2h");
    if (!h2h?.outcomes?.length) continue;

    if (bookmaker.title) bookmakerTitles.add(bookmaker.title);
    for (const outcome of h2h.outcomes) {
      if (!outcome.name || typeof outcome.price !== "number") continue;
      const side = outcomeSide(event, match, outcome.name);
      if (side) prices[side].push(outcome.price);
    }
  }

  return {
    bookmakerTitles: [...bookmakerTitles],
    homePrice: average(prices.home),
    drawPrice: average(prices.draw),
    awayPrice: average(prices.away),
  };
}

export async function POST() {
  try {
    const apiKey = process.env.ODDS_API_KEY;
    const sportKey = process.env.MUNDIAL_ODDS_SPORT_KEY;

    if (!apiKey || !sportKey) {
      return NextResponse.json(
        { error: "Configura ODDS_API_KEY y MUNDIAL_ODDS_SPORT_KEY para sincronizar cuotas." },
        { status: 400 }
      );
    }

    const url = new URL(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds/`);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("markets", "h2h");
    url.searchParams.set("oddsFormat", "decimal");
    url.searchParams.set("dateFormat", "iso");

    const bookmakers = process.env.MUNDIAL_ODDS_BOOKMAKERS?.trim();
    if (bookmakers) {
      url.searchParams.set("bookmakers", bookmakers);
    } else {
      url.searchParams.set("regions", process.env.MUNDIAL_ODDS_REGIONS || DEFAULT_REGIONS);
    }

    const response = await fetch(url, { cache: "no-store" });
    const data = (await response.json().catch(() => null)) as OddsEvent[] | { message?: string } | null;

    if (!response.ok || !Array.isArray(data)) {
      const message = data && !Array.isArray(data) ? data.message : "";
      return NextResponse.json(
        { error: message || "No se pudieron cargar cuotas desde The Odds API." },
        { status: response.status || 502 }
      );
    }

    const db = await getDb();
    const matches = await db
      .collection<MatchDoc>(MATCHES_COLLECTION)
      .find({})
      .project<MatchDoc>({ id: 1, number: 1, kickoffAt: 1, homeTeam: 1, awayTeam: 1 })
      .sort({ sortOrder: 1 })
      .toArray();

    let updated = 0;
    const now = new Date();

    for (const match of matches) {
      const event = data.find((item) => sameFixture(item, match));
      if (!event) continue;

      const odds = oddsForMatch(event, match);
      const hasPrice = odds.homePrice !== null || odds.drawPrice !== null || odds.awayPrice !== null;
      if (!hasPrice) continue;

      const bookmaker =
        odds.bookmakerTitles.length === 1
          ? odds.bookmakerTitles[0]
          : odds.bookmakerTitles.length > 1
            ? `${odds.bookmakerTitles.length} casas`
            : "";

      const bettingFavorite = serializeBettingFavorite(
        {
          source: "The Odds API",
          sourceUrl: "https://the-odds-api.com/",
          bookmaker,
          market: odds.bookmakerTitles.length > 1 ? "bookmaker_consensus" : "h2h_odds",
          homePrice: odds.homePrice,
          drawPrice: odds.drawPrice,
          awayPrice: odds.awayPrice,
          updatedAt: now,
        },
        { homeTeam: match.homeTeam, awayTeam: match.awayTeam }
      );

      await db.collection(MATCHES_COLLECTION).updateOne(
        { id: match.id },
        {
          $set: {
            bettingFavorite,
            updatedAt: now,
          },
        }
      );
      updated++;
    }

    return NextResponse.json({ ok: true, events: data.length, updated });
  } catch (error) {
    console.error("Failed to sync mundial odds", error);
    return NextResponse.json({ error: "No se pudo sincronizar cuotas." }, { status: 500 });
  }
}
