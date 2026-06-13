export type MundialStage =
  | "group"
  | "round32"
  | "round16"
  | "quarterfinal"
  | "semifinal"
  | "thirdPlace"
  | "final";

export type MundialMatch = {
  id: string;
  number: number;
  stage: MundialStage;
  stageLabel: string;
  group?: string;
  date: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeSeed?: string;
  awaySeed?: string;
  sortOrder: number;
};

type GroupFixture = {
  number: number;
  id?: string;
  date: string;
  group: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
};

type KnockoutFixture = {
  number: number;
  stage: Exclude<MundialStage, "group">;
  date: string;
  homeSeed: string;
  awaySeed: string;
};

const STAGE_LABELS: Record<MundialStage, string> = {
  group: "Grupos",
  round32: "32avos",
  round16: "16avos",
  quarterfinal: "Cuartos",
  semifinal: "Semis",
  thirdPlace: "Tercer lugar",
  final: "Final",
};

export const MUNDIAL_TOTAL_MATCHES = 104;

export const GROUPS = [
  {
    group: "A",
    teams: ["Mexico", "South Africa", "Korea Republic", "Czechia"],
  },
  {
    group: "B",
    teams: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  },
  {
    group: "C",
    teams: ["Brazil", "Morocco", "Haiti", "Scotland"],
  },
  {
    group: "D",
    teams: ["USA", "Paraguay", "Australia", "Turkiye"],
  },
  {
    group: "E",
    teams: ["Germany", "Curacao", "Cote d'Ivoire", "Ecuador"],
  },
  {
    group: "F",
    teams: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  },
  {
    group: "G",
    teams: ["Belgium", "Egypt", "IR Iran", "New Zealand"],
  },
  {
    group: "H",
    teams: ["Spain", "Cabo Verde", "Saudi Arabia", "Uruguay"],
  },
  {
    group: "I",
    teams: ["France", "Senegal", "Iraq", "Norway"],
  },
  {
    group: "J",
    teams: ["Argentina", "Algeria", "Austria", "Jordan"],
  },
  {
    group: "K",
    teams: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"],
  },
  {
    group: "L",
    teams: ["England", "Croatia", "Ghana", "Panama"],
  },
] as const;

const GROUP_FIXTURES: GroupFixture[] = [
  {
    number: 1,
    id: "mexico-sudafrica-2026-06-11-13",
    date: "2026-06-11",
    group: "A",
    homeTeam: "Mexico",
    awayTeam: "South Africa",
    venue: "Mexico City Stadium",
  },
  { number: 2, date: "2026-06-11", group: "A", homeTeam: "Korea Republic", awayTeam: "Czechia", venue: "Estadio Guadalajara" },
  { number: 3, date: "2026-06-12", group: "B", homeTeam: "Canada", awayTeam: "Bosnia and Herzegovina", venue: "Toronto Stadium" },
  { number: 4, date: "2026-06-12", group: "D", homeTeam: "USA", awayTeam: "Paraguay", venue: "Los Angeles Stadium" },
  { number: 5, date: "2026-06-13", group: "C", homeTeam: "Haiti", awayTeam: "Scotland", venue: "Boston Stadium" },
  { number: 6, date: "2026-06-13", group: "D", homeTeam: "Australia", awayTeam: "Turkiye", venue: "BC Place Vancouver" },
  { number: 7, date: "2026-06-13", group: "C", homeTeam: "Brazil", awayTeam: "Morocco", venue: "New York New Jersey Stadium" },
  { number: 8, date: "2026-06-13", group: "B", homeTeam: "Qatar", awayTeam: "Switzerland", venue: "San Francisco Bay Area Stadium" },
  { number: 9, date: "2026-06-14", group: "E", homeTeam: "Cote d'Ivoire", awayTeam: "Ecuador", venue: "Philadelphia Stadium" },
  { number: 10, date: "2026-06-14", group: "E", homeTeam: "Germany", awayTeam: "Curacao", venue: "Houston Stadium" },
  { number: 11, date: "2026-06-14", group: "F", homeTeam: "Netherlands", awayTeam: "Japan", venue: "Dallas Stadium" },
  { number: 12, date: "2026-06-14", group: "F", homeTeam: "Sweden", awayTeam: "Tunisia", venue: "Estadio Monterrey" },
  { number: 13, date: "2026-06-15", group: "H", homeTeam: "Saudi Arabia", awayTeam: "Uruguay", venue: "Miami Stadium" },
  { number: 14, date: "2026-06-15", group: "H", homeTeam: "Spain", awayTeam: "Cabo Verde", venue: "Atlanta Stadium" },
  { number: 15, date: "2026-06-15", group: "G", homeTeam: "IR Iran", awayTeam: "New Zealand", venue: "Los Angeles Stadium" },
  { number: 16, date: "2026-06-15", group: "G", homeTeam: "Belgium", awayTeam: "Egypt", venue: "Seattle Stadium" },
  { number: 17, date: "2026-06-16", group: "I", homeTeam: "France", awayTeam: "Senegal", venue: "New York New Jersey Stadium" },
  { number: 18, date: "2026-06-16", group: "I", homeTeam: "Iraq", awayTeam: "Norway", venue: "Boston Stadium" },
  { number: 19, date: "2026-06-16", group: "J", homeTeam: "Argentina", awayTeam: "Algeria", venue: "Kansas City Stadium" },
  { number: 20, date: "2026-06-16", group: "J", homeTeam: "Austria", awayTeam: "Jordan", venue: "San Francisco Bay Area Stadium" },
  { number: 21, date: "2026-06-17", group: "L", homeTeam: "Ghana", awayTeam: "Panama", venue: "Toronto Stadium" },
  { number: 22, date: "2026-06-17", group: "L", homeTeam: "England", awayTeam: "Croatia", venue: "Dallas Stadium" },
  { number: 23, date: "2026-06-17", group: "K", homeTeam: "Portugal", awayTeam: "Congo DR", venue: "Houston Stadium" },
  { number: 24, date: "2026-06-17", group: "K", homeTeam: "Uzbekistan", awayTeam: "Colombia", venue: "Mexico City Stadium" },
  { number: 25, date: "2026-06-18", group: "A", homeTeam: "Czechia", awayTeam: "South Africa", venue: "Atlanta Stadium" },
  { number: 26, date: "2026-06-18", group: "B", homeTeam: "Switzerland", awayTeam: "Bosnia and Herzegovina", venue: "Los Angeles Stadium" },
  { number: 27, date: "2026-06-18", group: "B", homeTeam: "Canada", awayTeam: "Qatar", venue: "BC Place Vancouver" },
  { number: 28, date: "2026-06-18", group: "A", homeTeam: "Mexico", awayTeam: "Korea Republic", venue: "Estadio Guadalajara" },
  { number: 29, date: "2026-06-19", group: "C", homeTeam: "Brazil", awayTeam: "Haiti", venue: "Philadelphia Stadium" },
  { number: 30, date: "2026-06-19", group: "C", homeTeam: "Scotland", awayTeam: "Morocco", venue: "Boston Stadium" },
  { number: 31, date: "2026-06-19", group: "D", homeTeam: "Turkiye", awayTeam: "Paraguay", venue: "San Francisco Bay Area Stadium" },
  { number: 32, date: "2026-06-19", group: "D", homeTeam: "USA", awayTeam: "Australia", venue: "Seattle Stadium" },
  { number: 33, date: "2026-06-20", group: "E", homeTeam: "Germany", awayTeam: "Cote d'Ivoire", venue: "Toronto Stadium" },
  { number: 34, date: "2026-06-20", group: "E", homeTeam: "Ecuador", awayTeam: "Curacao", venue: "Kansas City Stadium" },
  { number: 35, date: "2026-06-20", group: "F", homeTeam: "Netherlands", awayTeam: "Sweden", venue: "Houston Stadium" },
  { number: 36, date: "2026-06-20", group: "F", homeTeam: "Tunisia", awayTeam: "Japan", venue: "Estadio Monterrey" },
  { number: 37, date: "2026-06-21", group: "H", homeTeam: "Uruguay", awayTeam: "Cabo Verde", venue: "Miami Stadium" },
  { number: 38, date: "2026-06-21", group: "H", homeTeam: "Spain", awayTeam: "Saudi Arabia", venue: "Atlanta Stadium" },
  { number: 39, date: "2026-06-21", group: "G", homeTeam: "Belgium", awayTeam: "IR Iran", venue: "Los Angeles Stadium" },
  { number: 40, date: "2026-06-21", group: "G", homeTeam: "New Zealand", awayTeam: "Egypt", venue: "BC Place Vancouver" },
  { number: 41, date: "2026-06-22", group: "I", homeTeam: "Norway", awayTeam: "Senegal", venue: "New York New Jersey Stadium" },
  { number: 42, date: "2026-06-22", group: "I", homeTeam: "France", awayTeam: "Iraq", venue: "Philadelphia Stadium" },
  { number: 43, date: "2026-06-22", group: "J", homeTeam: "Argentina", awayTeam: "Austria", venue: "Dallas Stadium" },
  { number: 44, date: "2026-06-22", group: "J", homeTeam: "Jordan", awayTeam: "Algeria", venue: "San Francisco Bay Area Stadium" },
  { number: 45, date: "2026-06-23", group: "L", homeTeam: "England", awayTeam: "Ghana", venue: "Boston Stadium" },
  { number: 46, date: "2026-06-23", group: "L", homeTeam: "Panama", awayTeam: "Croatia", venue: "Toronto Stadium" },
  { number: 47, date: "2026-06-23", group: "K", homeTeam: "Portugal", awayTeam: "Uzbekistan", venue: "Houston Stadium" },
  { number: 48, date: "2026-06-23", group: "K", homeTeam: "Colombia", awayTeam: "Congo DR", venue: "Estadio Guadalajara" },
  { number: 49, date: "2026-06-24", group: "C", homeTeam: "Scotland", awayTeam: "Brazil", venue: "Miami Stadium" },
  { number: 50, date: "2026-06-24", group: "C", homeTeam: "Morocco", awayTeam: "Haiti", venue: "Atlanta Stadium" },
  { number: 51, date: "2026-06-24", group: "B", homeTeam: "Switzerland", awayTeam: "Canada", venue: "BC Place Vancouver" },
  { number: 52, date: "2026-06-24", group: "B", homeTeam: "Bosnia and Herzegovina", awayTeam: "Qatar", venue: "Seattle Stadium" },
  { number: 53, date: "2026-06-24", group: "A", homeTeam: "Czechia", awayTeam: "Mexico", venue: "Mexico City Stadium" },
  { number: 54, date: "2026-06-24", group: "A", homeTeam: "South Africa", awayTeam: "Korea Republic", venue: "Estadio Monterrey" },
  { number: 55, date: "2026-06-25", group: "E", homeTeam: "Curacao", awayTeam: "Cote d'Ivoire", venue: "Philadelphia Stadium" },
  { number: 56, date: "2026-06-25", group: "E", homeTeam: "Ecuador", awayTeam: "Germany", venue: "New York New Jersey Stadium" },
  { number: 57, date: "2026-06-25", group: "F", homeTeam: "Japan", awayTeam: "Sweden", venue: "Dallas Stadium" },
  { number: 58, date: "2026-06-25", group: "F", homeTeam: "Tunisia", awayTeam: "Netherlands", venue: "Kansas City Stadium" },
  { number: 59, date: "2026-06-25", group: "D", homeTeam: "Turkiye", awayTeam: "USA", venue: "Los Angeles Stadium" },
  { number: 60, date: "2026-06-25", group: "D", homeTeam: "Paraguay", awayTeam: "Australia", venue: "San Francisco Bay Area Stadium" },
  { number: 61, date: "2026-06-26", group: "I", homeTeam: "Norway", awayTeam: "France", venue: "Boston Stadium" },
  { number: 62, date: "2026-06-26", group: "I", homeTeam: "Senegal", awayTeam: "Iraq", venue: "Toronto Stadium" },
  { number: 63, date: "2026-06-26", group: "G", homeTeam: "Egypt", awayTeam: "IR Iran", venue: "Seattle Stadium" },
  { number: 64, date: "2026-06-26", group: "G", homeTeam: "New Zealand", awayTeam: "Belgium", venue: "BC Place Vancouver" },
  { number: 65, date: "2026-06-26", group: "H", homeTeam: "Cabo Verde", awayTeam: "Saudi Arabia", venue: "Houston Stadium" },
  { number: 66, date: "2026-06-26", group: "H", homeTeam: "Uruguay", awayTeam: "Spain", venue: "Estadio Guadalajara" },
  { number: 67, date: "2026-06-27", group: "L", homeTeam: "Panama", awayTeam: "England", venue: "New York New Jersey Stadium" },
  { number: 68, date: "2026-06-27", group: "L", homeTeam: "Croatia", awayTeam: "Ghana", venue: "Philadelphia Stadium" },
  { number: 69, date: "2026-06-27", group: "J", homeTeam: "Algeria", awayTeam: "Austria", venue: "Kansas City Stadium" },
  { number: 70, date: "2026-06-27", group: "J", homeTeam: "Jordan", awayTeam: "Argentina", venue: "Dallas Stadium" },
  { number: 71, date: "2026-06-27", group: "K", homeTeam: "Colombia", awayTeam: "Portugal", venue: "Miami Stadium" },
  { number: 72, date: "2026-06-27", group: "K", homeTeam: "Congo DR", awayTeam: "Uzbekistan", venue: "Atlanta Stadium" },
];

const KNOCKOUT_FIXTURES: KnockoutFixture[] = [
  { number: 73, stage: "round32", date: "2026-06-28", homeSeed: "2A", awaySeed: "2B" },
  { number: 74, stage: "round32", date: "2026-06-29", homeSeed: "1E", awaySeed: "3A/B/C/D/F" },
  { number: 75, stage: "round32", date: "2026-06-30", homeSeed: "1F", awaySeed: "2C" },
  { number: 76, stage: "round32", date: "2026-06-29", homeSeed: "1C", awaySeed: "2F" },
  { number: 77, stage: "round32", date: "2026-06-30", homeSeed: "1I", awaySeed: "3C/D/F/G/H" },
  { number: 78, stage: "round32", date: "2026-06-30", homeSeed: "2E", awaySeed: "2I" },
  { number: 79, stage: "round32", date: "2026-07-01", homeSeed: "1A", awaySeed: "3C/E/F/H/I" },
  { number: 80, stage: "round32", date: "2026-07-01", homeSeed: "1L", awaySeed: "3E/H/I/J/K" },
  { number: 81, stage: "round32", date: "2026-07-02", homeSeed: "1D", awaySeed: "3B/E/F/I/J" },
  { number: 82, stage: "round32", date: "2026-07-01", homeSeed: "1G", awaySeed: "3A/E/H/I/J" },
  { number: 83, stage: "round32", date: "2026-07-03", homeSeed: "2K", awaySeed: "2L" },
  { number: 84, stage: "round32", date: "2026-07-02", homeSeed: "1H", awaySeed: "2J" },
  { number: 85, stage: "round32", date: "2026-07-03", homeSeed: "1B", awaySeed: "3E/F/G/I/J" },
  { number: 86, stage: "round32", date: "2026-07-03", homeSeed: "1J", awaySeed: "2H" },
  { number: 87, stage: "round32", date: "2026-07-04", homeSeed: "1K", awaySeed: "3D/E/I/J/L" },
  { number: 88, stage: "round32", date: "2026-07-03", homeSeed: "2D", awaySeed: "2G" },
  { number: 89, stage: "round16", date: "2026-07-04", homeSeed: "W73", awaySeed: "W75" },
  { number: 90, stage: "round16", date: "2026-07-04", homeSeed: "W74", awaySeed: "W77" },
  { number: 91, stage: "round16", date: "2026-07-05", homeSeed: "W76", awaySeed: "W78" },
  { number: 92, stage: "round16", date: "2026-07-06", homeSeed: "W79", awaySeed: "W80" },
  { number: 93, stage: "round16", date: "2026-07-06", homeSeed: "W83", awaySeed: "W84" },
  { number: 94, stage: "round16", date: "2026-07-07", homeSeed: "W81", awaySeed: "W82" },
  { number: 95, stage: "round16", date: "2026-07-07", homeSeed: "W86", awaySeed: "W88" },
  { number: 96, stage: "round16", date: "2026-07-07", homeSeed: "W85", awaySeed: "W87" },
  { number: 97, stage: "quarterfinal", date: "2026-07-09", homeSeed: "W89", awaySeed: "W90" },
  { number: 98, stage: "quarterfinal", date: "2026-07-10", homeSeed: "W93", awaySeed: "W94" },
  { number: 99, stage: "quarterfinal", date: "2026-07-11", homeSeed: "W91", awaySeed: "W92" },
  { number: 100, stage: "quarterfinal", date: "2026-07-11", homeSeed: "W95", awaySeed: "W96" },
  { number: 101, stage: "semifinal", date: "2026-07-14", homeSeed: "W97", awaySeed: "W98" },
  { number: 102, stage: "semifinal", date: "2026-07-15", homeSeed: "W99", awaySeed: "W100" },
  { number: 103, stage: "thirdPlace", date: "2026-07-18", homeSeed: "L101", awaySeed: "L102" },
  { number: 104, stage: "final", date: "2026-07-19", homeSeed: "W101", awaySeed: "W102" },
];

function matchId(number: number) {
  return `world-cup-2026-match-${String(number).padStart(3, "0")}`;
}

function knockoutTeam(seed: string) {
  return seed
    .replace(/^W(\d+)$/, "Ganador $1")
    .replace(/^L(\d+)$/, "Perdedor $1")
    .replace(/^1([A-L])$/, "1ro Grupo $1")
    .replace(/^2([A-L])$/, "2do Grupo $1")
    .replace(/^3(.+)$/, "3ro Grupo $1");
}

export const MUNDIAL_MATCHES: MundialMatch[] = [
  ...GROUP_FIXTURES.map((fixture) => ({
    id: fixture.id ?? matchId(fixture.number),
    number: fixture.number,
    stage: "group" as const,
    stageLabel: STAGE_LABELS.group,
    group: fixture.group,
    date: fixture.date,
    venue: fixture.venue,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    sortOrder: fixture.number,
  })),
  ...KNOCKOUT_FIXTURES.map((fixture) => ({
    id: matchId(fixture.number),
    number: fixture.number,
    stage: fixture.stage,
    stageLabel: STAGE_LABELS[fixture.stage],
    date: fixture.date,
    venue: "Por confirmar",
    homeTeam: knockoutTeam(fixture.homeSeed),
    awayTeam: knockoutTeam(fixture.awaySeed),
    homeSeed: fixture.homeSeed,
    awaySeed: fixture.awaySeed,
    sortOrder: fixture.number,
  })),
];

export const MUNDIAL_STAGE_ORDER: MundialStage[] = [
  "group",
  "round32",
  "round16",
  "quarterfinal",
  "semifinal",
  "thirdPlace",
  "final",
];

export const MUNDIAL_BRACKET_STAGES: MundialStage[] = [
  "round32",
  "round16",
  "quarterfinal",
  "semifinal",
  "thirdPlace",
  "final",
];
