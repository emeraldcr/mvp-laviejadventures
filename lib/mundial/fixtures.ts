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
  kickoffAt: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeSeed?: string;
  awaySeed?: string;
  homeFinalScore?: number;
  awayFinalScore?: number;
  actualWinner?: "home" | "away" | null;
  sortOrder: number;
};

type GroupFixture = {
  number: number;
  id?: string;
  date: string;
  kickoffAt: string;
  group: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  homeFinalScore?: number;
  awayFinalScore?: number;
};

type KnockoutFixture = {
  number: number;
  stage: Exclude<MundialStage, "group">;
  date: string;
  kickoffAt: string;
  homeSeed: string;
  awaySeed: string;
  venue?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeFinalScore?: number;
  awayFinalScore?: number;
  actualWinner?: "home" | "away" | null;
};

const STAGE_LABELS: Record<MundialStage, string> = {
  group: "Grupos",
  round32: "Dieciseisavos",
  round16: "Octavos",
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
    kickoffAt: "2026-06-11T13:00:00-06:00",
    group: "A",
    homeTeam: "Mexico",
    awayTeam: "South Africa",
    venue: "Mexico City Stadium",
    homeFinalScore: 2,
    awayFinalScore: 0,
  },
  { number: 2, date: "2026-06-11", kickoffAt: "2026-06-11T20:00:00-06:00", group: "A", homeTeam: "Korea Republic", awayTeam: "Czechia", venue: "Estadio Guadalajara", homeFinalScore: 2, awayFinalScore: 1 },
  { number: 3, date: "2026-06-12", kickoffAt: "2026-06-12T13:00:00-06:00", group: "B", homeTeam: "Canada", awayTeam: "Bosnia and Herzegovina", venue: "Toronto Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  {
    number: 4,
    date: "2026-06-12",
    kickoffAt: "2026-06-12T19:00:00-06:00",
    group: "D",
    homeTeam: "USA",
    awayTeam: "Paraguay",
    venue: "Los Angeles Stadium",
    homeFinalScore: 4,
    awayFinalScore: 1,
  },
  { number: 5, date: "2026-06-13", kickoffAt: "2026-06-13T19:00:00-06:00", group: "C", homeTeam: "Haiti", awayTeam: "Scotland", venue: "Boston Stadium", homeFinalScore: 0, awayFinalScore: 1 },
  { number: 6, date: "2026-06-13", kickoffAt: "2026-06-13T22:00:00-06:00", group: "D", homeTeam: "Australia", awayTeam: "Turkiye", venue: "BC Place Vancouver", homeFinalScore: 2, awayFinalScore: 0 },
  { number: 7, date: "2026-06-13", kickoffAt: "2026-06-13T16:00:00-06:00", group: "C", homeTeam: "Brazil", awayTeam: "Morocco", venue: "New York New Jersey Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 8, date: "2026-06-13", kickoffAt: "2026-06-13T13:00:00-06:00", group: "B", homeTeam: "Qatar", awayTeam: "Switzerland", venue: "San Francisco Bay Area Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 9, date: "2026-06-14", kickoffAt: "2026-06-14T17:00:00-06:00", group: "E", homeTeam: "Cote d'Ivoire", awayTeam: "Ecuador", venue: "Philadelphia Stadium", homeFinalScore: 1, awayFinalScore: 0 },
  { number: 10, date: "2026-06-14", kickoffAt: "2026-06-14T11:00:00-06:00", group: "E", homeTeam: "Germany", awayTeam: "Curacao", venue: "Houston Stadium", homeFinalScore: 7, awayFinalScore: 1 },
  { number: 11, date: "2026-06-14", kickoffAt: "2026-06-14T14:00:00-06:00", group: "F", homeTeam: "Netherlands", awayTeam: "Japan", venue: "Dallas Stadium", homeFinalScore: 2, awayFinalScore: 2 },
  { number: 12, date: "2026-06-14", kickoffAt: "2026-06-14T20:00:00-06:00", group: "F", homeTeam: "Sweden", awayTeam: "Tunisia", venue: "Estadio Monterrey", homeFinalScore: 5, awayFinalScore: 1 },
  { number: 13, date: "2026-06-15", kickoffAt: "2026-06-15T16:00:00-06:00", group: "H", homeTeam: "Saudi Arabia", awayTeam: "Uruguay", venue: "Miami Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 14, date: "2026-06-15", kickoffAt: "2026-06-15T10:00:00-06:00", group: "H", homeTeam: "Spain", awayTeam: "Cabo Verde", venue: "Atlanta Stadium", homeFinalScore: 0, awayFinalScore: 0 },
  { number: 15, date: "2026-06-15", kickoffAt: "2026-06-15T19:00:00-06:00", group: "G", homeTeam: "IR Iran", awayTeam: "New Zealand", venue: "Los Angeles Stadium", homeFinalScore: 2, awayFinalScore: 2 },
  { number: 16, date: "2026-06-15", kickoffAt: "2026-06-15T13:00:00-06:00", group: "G", homeTeam: "Belgium", awayTeam: "Egypt", venue: "Seattle Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 17, date: "2026-06-16", kickoffAt: "2026-06-16T13:00:00-06:00", group: "I", homeTeam: "France", awayTeam: "Senegal", venue: "New York New Jersey Stadium", homeFinalScore: 3, awayFinalScore: 1 },
  { number: 18, date: "2026-06-16", kickoffAt: "2026-06-16T16:00:00-06:00", group: "I", homeTeam: "Iraq", awayTeam: "Norway", venue: "Boston Stadium", homeFinalScore: 1, awayFinalScore: 4 },
  { number: 19, date: "2026-06-16", kickoffAt: "2026-06-16T19:00:00-06:00", group: "J", homeTeam: "Argentina", awayTeam: "Algeria", venue: "Kansas City Stadium", homeFinalScore: 3, awayFinalScore: 0 },
  { number: 20, date: "2026-06-16", kickoffAt: "2026-06-16T22:00:00-06:00", group: "J", homeTeam: "Austria", awayTeam: "Jordan", venue: "San Francisco Bay Area Stadium", homeFinalScore: 3, awayFinalScore: 1 },
  { number: 21, date: "2026-06-17", kickoffAt: "2026-06-17T17:00:00-06:00", group: "L", homeTeam: "Ghana", awayTeam: "Panama", venue: "Toronto Stadium", homeFinalScore: 1, awayFinalScore: 0 },
  { number: 22, date: "2026-06-17", kickoffAt: "2026-06-17T14:00:00-06:00", group: "L", homeTeam: "England", awayTeam: "Croatia", venue: "Dallas Stadium", homeFinalScore: 4, awayFinalScore: 2 },
  { number: 23, date: "2026-06-17", kickoffAt: "2026-06-17T11:00:00-06:00", group: "K", homeTeam: "Portugal", awayTeam: "Congo DR", venue: "Houston Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 24, date: "2026-06-17", kickoffAt: "2026-06-17T20:00:00-06:00", group: "K", homeTeam: "Uzbekistan", awayTeam: "Colombia", venue: "Mexico City Stadium", homeFinalScore: 1, awayFinalScore: 3 },
  { number: 25, date: "2026-06-18", kickoffAt: "2026-06-18T10:00:00-06:00", group: "A", homeTeam: "Czechia", awayTeam: "South Africa", venue: "Atlanta Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 26, date: "2026-06-18", kickoffAt: "2026-06-18T13:00:00-06:00", group: "B", homeTeam: "Switzerland", awayTeam: "Bosnia and Herzegovina", venue: "Los Angeles Stadium", homeFinalScore: 4, awayFinalScore: 1 },
  { number: 27, date: "2026-06-18", kickoffAt: "2026-06-18T16:00:00-06:00", group: "B", homeTeam: "Canada", awayTeam: "Qatar", venue: "BC Place Vancouver", homeFinalScore: 6, awayFinalScore: 0 },
  { number: 28, date: "2026-06-18", kickoffAt: "2026-06-18T19:00:00-06:00", group: "A", homeTeam: "Mexico", awayTeam: "Korea Republic", venue: "Estadio Guadalajara", homeFinalScore: 1, awayFinalScore: 0 },
  { number: 29, date: "2026-06-19", kickoffAt: "2026-06-19T18:30:00-06:00", group: "C", homeTeam: "Brazil", awayTeam: "Haiti", venue: "Philadelphia Stadium", homeFinalScore: 3, awayFinalScore: 0 },
  { number: 30, date: "2026-06-19", kickoffAt: "2026-06-19T16:00:00-06:00", group: "C", homeTeam: "Scotland", awayTeam: "Morocco", venue: "Boston Stadium", homeFinalScore: 0, awayFinalScore: 1 },
  { number: 31, date: "2026-06-19", kickoffAt: "2026-06-19T21:00:00-06:00", group: "D", homeTeam: "Turkiye", awayTeam: "Paraguay", venue: "San Francisco Bay Area Stadium", homeFinalScore: 0, awayFinalScore: 1 },
  { number: 32, date: "2026-06-19", kickoffAt: "2026-06-19T13:00:00-06:00", group: "D", homeTeam: "USA", awayTeam: "Australia", venue: "Seattle Stadium", homeFinalScore: 2, awayFinalScore: 0 },
  { number: 33, date: "2026-06-20", kickoffAt: "2026-06-20T14:00:00-06:00", group: "E", homeTeam: "Germany", awayTeam: "Cote d'Ivoire", venue: "Toronto Stadium", homeFinalScore: 2, awayFinalScore: 1 },
  { number: 34, date: "2026-06-20", kickoffAt: "2026-06-20T18:00:00-06:00", group: "E", homeTeam: "Ecuador", awayTeam: "Curacao", venue: "Kansas City Stadium", homeFinalScore: 0, awayFinalScore: 0 },
  { number: 35, date: "2026-06-20", kickoffAt: "2026-06-20T11:00:00-06:00", group: "F", homeTeam: "Netherlands", awayTeam: "Sweden", venue: "Houston Stadium", homeFinalScore: 5, awayFinalScore: 1 },
  { number: 36, date: "2026-06-20", kickoffAt: "2026-06-20T22:00:00-06:00", group: "F", homeTeam: "Tunisia", awayTeam: "Japan", venue: "Estadio Monterrey", homeFinalScore: 0, awayFinalScore: 4 },
  { number: 37, date: "2026-06-21", kickoffAt: "2026-06-21T16:00:00-06:00", group: "H", homeTeam: "Uruguay", awayTeam: "Cabo Verde", venue: "Miami Stadium", homeFinalScore: 2, awayFinalScore: 2 },
  { number: 38, date: "2026-06-21", kickoffAt: "2026-06-21T10:00:00-06:00", group: "H", homeTeam: "Spain", awayTeam: "Saudi Arabia", venue: "Atlanta Stadium", homeFinalScore: 4, awayFinalScore: 0 },
  { number: 39, date: "2026-06-21", kickoffAt: "2026-06-21T13:00:00-06:00", group: "G", homeTeam: "Belgium", awayTeam: "IR Iran", venue: "Los Angeles Stadium", homeFinalScore: 0, awayFinalScore: 0 },
  { number: 40, date: "2026-06-21", kickoffAt: "2026-06-21T19:00:00-06:00", group: "G", homeTeam: "New Zealand", awayTeam: "Egypt", venue: "BC Place Vancouver", homeFinalScore: 1, awayFinalScore: 3 },
  { number: 41, date: "2026-06-22", kickoffAt: "2026-06-22T18:00:00-06:00", group: "I", homeTeam: "Norway", awayTeam: "Senegal", venue: "New York New Jersey Stadium", homeFinalScore: 3, awayFinalScore: 2 },
  { number: 42, date: "2026-06-22", kickoffAt: "2026-06-22T15:00:00-06:00", group: "I", homeTeam: "France", awayTeam: "Iraq", venue: "Philadelphia Stadium", homeFinalScore: 3, awayFinalScore: 0 },
  { number: 43, date: "2026-06-22", kickoffAt: "2026-06-22T11:00:00-06:00", group: "J", homeTeam: "Argentina", awayTeam: "Austria", venue: "Dallas Stadium", homeFinalScore: 2, awayFinalScore: 0 },
  { number: 44, date: "2026-06-22", kickoffAt: "2026-06-22T21:00:00-06:00", group: "J", homeTeam: "Jordan", awayTeam: "Algeria", venue: "San Francisco Bay Area Stadium", homeFinalScore: 1, awayFinalScore: 2 },
  { number: 45, date: "2026-06-23", kickoffAt: "2026-06-23T14:00:00-06:00", group: "L", homeTeam: "England", awayTeam: "Ghana", venue: "Boston Stadium", homeFinalScore: 0, awayFinalScore: 0 },
  { number: 46, date: "2026-06-23", kickoffAt: "2026-06-23T17:00:00-06:00", group: "L", homeTeam: "Panama", awayTeam: "Croatia", venue: "Toronto Stadium", homeFinalScore: 0, awayFinalScore: 1 },
  { number: 47, date: "2026-06-23", kickoffAt: "2026-06-23T11:00:00-06:00", group: "K", homeTeam: "Portugal", awayTeam: "Uzbekistan", venue: "Houston Stadium", homeFinalScore: 5, awayFinalScore: 0 },
  { number: 48, date: "2026-06-23", kickoffAt: "2026-06-23T20:00:00-06:00", group: "K", homeTeam: "Colombia", awayTeam: "Congo DR", venue: "Estadio Guadalajara", homeFinalScore: 1, awayFinalScore: 0 },
  { number: 49, date: "2026-06-24", kickoffAt: "2026-06-24T16:00:00-06:00", group: "C", homeTeam: "Scotland", awayTeam: "Brazil", venue: "Miami Stadium", homeFinalScore: 0, awayFinalScore: 3 },
  { number: 50, date: "2026-06-24", kickoffAt: "2026-06-24T16:00:00-06:00", group: "C", homeTeam: "Morocco", awayTeam: "Haiti", venue: "Atlanta Stadium", homeFinalScore: 4, awayFinalScore: 2 },
  { number: 51, date: "2026-06-24", kickoffAt: "2026-06-24T13:00:00-06:00", group: "B", homeTeam: "Switzerland", awayTeam: "Canada", venue: "BC Place Vancouver", homeFinalScore: 2, awayFinalScore: 1 },
  { number: 52, date: "2026-06-24", kickoffAt: "2026-06-24T13:00:00-06:00", group: "B", homeTeam: "Bosnia and Herzegovina", awayTeam: "Qatar", venue: "Seattle Stadium", homeFinalScore: 3, awayFinalScore: 1 },
  { number: 53, date: "2026-06-24", kickoffAt: "2026-06-24T19:00:00-06:00", group: "A", homeTeam: "Czechia", awayTeam: "Mexico", venue: "Mexico City Stadium", homeFinalScore: 0, awayFinalScore: 3 },
  { number: 54, date: "2026-06-24", kickoffAt: "2026-06-24T19:00:00-06:00", group: "A", homeTeam: "South Africa", awayTeam: "Korea Republic", venue: "Estadio Monterrey", homeFinalScore: 1, awayFinalScore: 0 },
  { number: 55, date: "2026-06-25", kickoffAt: "2026-06-25T14:00:00-06:00", group: "E", homeTeam: "Curacao", awayTeam: "Cote d'Ivoire", venue: "Philadelphia Stadium", homeFinalScore: 0, awayFinalScore: 2 },
  { number: 56, date: "2026-06-25", kickoffAt: "2026-06-25T14:00:00-06:00", group: "E", homeTeam: "Ecuador", awayTeam: "Germany", venue: "New York New Jersey Stadium", homeFinalScore: 2, awayFinalScore: 1 },
  { number: 57, date: "2026-06-25", kickoffAt: "2026-06-25T17:00:00-06:00", group: "F", homeTeam: "Japan", awayTeam: "Sweden", venue: "Dallas Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 58, date: "2026-06-25", kickoffAt: "2026-06-25T17:00:00-06:00", group: "F", homeTeam: "Tunisia", awayTeam: "Netherlands", venue: "Kansas City Stadium", homeFinalScore: 1, awayFinalScore: 3 },
  { number: 59, date: "2026-06-25", kickoffAt: "2026-06-25T20:00:00-06:00", group: "D", homeTeam: "Turkiye", awayTeam: "USA", venue: "Los Angeles Stadium", homeFinalScore: 3, awayFinalScore: 2 },
  { number: 60, date: "2026-06-25", kickoffAt: "2026-06-25T20:00:00-06:00", group: "D", homeTeam: "Paraguay", awayTeam: "Australia", venue: "San Francisco Bay Area Stadium", homeFinalScore: 0, awayFinalScore: 0 },
  { number: 61, date: "2026-06-26", kickoffAt: "2026-06-26T13:00:00-06:00", group: "I", homeTeam: "Norway", awayTeam: "France", venue: "Boston Stadium", homeFinalScore: 1, awayFinalScore: 4 },
  { number: 62, date: "2026-06-26", kickoffAt: "2026-06-26T13:00:00-06:00", group: "I", homeTeam: "Senegal", awayTeam: "Iraq", venue: "Toronto Stadium", homeFinalScore: 5, awayFinalScore: 0 },
  { number: 63, date: "2026-06-26", kickoffAt: "2026-06-26T21:00:00-06:00", group: "G", homeTeam: "Egypt", awayTeam: "IR Iran", venue: "Seattle Stadium", homeFinalScore: 1, awayFinalScore: 1 },
  { number: 64, date: "2026-06-26", kickoffAt: "2026-06-26T21:00:00-06:00", group: "G", homeTeam: "New Zealand", awayTeam: "Belgium", venue: "BC Place Vancouver", homeFinalScore: 1, awayFinalScore: 5 },
  { number: 65, date: "2026-06-26", kickoffAt: "2026-06-26T18:00:00-06:00", group: "H", homeTeam: "Cabo Verde", awayTeam: "Saudi Arabia", venue: "Houston Stadium", homeFinalScore: 0, awayFinalScore: 0 },
  { number: 66, date: "2026-06-26", kickoffAt: "2026-06-26T18:00:00-06:00", group: "H", homeTeam: "Uruguay", awayTeam: "Spain", venue: "Estadio Guadalajara", homeFinalScore: 0, awayFinalScore: 1 },
  { number: 67, date: "2026-06-27", kickoffAt: "2026-06-27T15:00:00-06:00", group: "L", homeTeam: "Panama", awayTeam: "England", venue: "New York New Jersey Stadium", homeFinalScore: 0, awayFinalScore: 2 },
  { number: 68, date: "2026-06-27", kickoffAt: "2026-06-27T15:00:00-06:00", group: "L", homeTeam: "Croatia", awayTeam: "Ghana", venue: "Philadelphia Stadium", homeFinalScore: 2, awayFinalScore: 1 },
  { number: 69, date: "2026-06-27", kickoffAt: "2026-06-27T20:00:00-06:00", group: "J", homeTeam: "Algeria", awayTeam: "Austria", venue: "Kansas City Stadium", homeFinalScore: 3, awayFinalScore: 3 },
  { number: 70, date: "2026-06-27", kickoffAt: "2026-06-27T20:00:00-06:00", group: "J", homeTeam: "Jordan", awayTeam: "Argentina", venue: "Dallas Stadium", homeFinalScore: 1, awayFinalScore: 3 },
  { number: 71, date: "2026-06-27", kickoffAt: "2026-06-27T17:30:00-06:00", group: "K", homeTeam: "Colombia", awayTeam: "Portugal", venue: "Miami Stadium", homeFinalScore: 0, awayFinalScore: 0 },
  { number: 72, date: "2026-06-27", kickoffAt: "2026-06-27T17:30:00-06:00", group: "K", homeTeam: "Congo DR", awayTeam: "Uzbekistan", venue: "Atlanta Stadium", homeFinalScore: 3, awayFinalScore: 1 },
];

const KNOCKOUT_FIXTURES: KnockoutFixture[] = [
  { number: 73, stage: "round32", date: "2026-06-28", kickoffAt: "2026-06-28T17:00:00-04:00", homeSeed: "South Africa", awaySeed: "Canada", homeTeam: "South Africa", awayTeam: "Canada", venue: "SoFi Stadium, Los Angeles", homeFinalScore: 0, awayFinalScore: 1 },
  { number: 74, stage: "round32", date: "2026-06-29", kickoffAt: "2026-06-29T13:00:00-04:00", homeSeed: "Brazil", awaySeed: "Japan", homeTeam: "Brazil", awayTeam: "Japan", venue: "NRG Stadium, Houston", homeFinalScore: 2, awayFinalScore: 1 },
  { number: 75, stage: "round32", date: "2026-06-29", kickoffAt: "2026-06-29T16:30:00-04:00", homeSeed: "Germany", awaySeed: "Paraguay", homeTeam: "Germany", awayTeam: "Paraguay", venue: "Gillette Stadium, Foxborough", homeFinalScore: 1, awayFinalScore: 1, actualWinner: "away" },
  { number: 76, stage: "round32", date: "2026-06-29", kickoffAt: "2026-06-29T21:00:00-04:00", homeSeed: "Netherlands", awaySeed: "Morocco", homeTeam: "Netherlands", awayTeam: "Morocco", venue: "Estadio BBVA, Monterrey", homeFinalScore: 1, awayFinalScore: 1, actualWinner: "away" },
  { number: 77, stage: "round32", date: "2026-06-30", kickoffAt: "2026-06-30T13:00:00-04:00", homeSeed: "Cote d'Ivoire", awaySeed: "Norway", homeTeam: "Cote d'Ivoire", awayTeam: "Norway", venue: "AT&T Stadium, Arlington", homeFinalScore: 1, awayFinalScore: 2 },
  { number: 78, stage: "round32", date: "2026-06-30", kickoffAt: "2026-06-30T17:00:00-04:00", homeSeed: "France", awaySeed: "Sweden", homeTeam: "France", awayTeam: "Sweden", venue: "MetLife Stadium, East Rutherford", homeFinalScore: 3, awayFinalScore: 0 },
  { number: 79, stage: "round32", date: "2026-06-30", kickoffAt: "2026-06-30T21:00:00-04:00", homeSeed: "Mexico", awaySeed: "Ecuador", homeTeam: "Mexico", awayTeam: "Ecuador", venue: "Estadio Azteca, Mexico City", homeFinalScore: 2, awayFinalScore: 0 },
  { number: 80, stage: "round32", date: "2026-07-01", kickoffAt: "2026-07-01T12:00:00-04:00", homeSeed: "England", awaySeed: "Congo DR", homeTeam: "England", awayTeam: "Congo DR", venue: "Mercedes-Benz Stadium, Atlanta", homeFinalScore: 2, awayFinalScore: 1 },
  { number: 81, stage: "round32", date: "2026-07-01", kickoffAt: "2026-07-01T16:00:00-04:00", homeSeed: "Belgium", awaySeed: "Senegal", homeTeam: "Belgium", awayTeam: "Senegal", venue: "Lumen Field, Seattle", homeFinalScore: 3, awayFinalScore: 2 },
  { number: 82, stage: "round32", date: "2026-07-01", kickoffAt: "2026-07-01T20:00:00-04:00", homeSeed: "USA", awaySeed: "Bosnia and Herzegovina", homeTeam: "USA", awayTeam: "Bosnia and Herzegovina", venue: "Levi's Stadium, Santa Clara", homeFinalScore: 2, awayFinalScore: 0 },
  { number: 83, stage: "round32", date: "2026-07-02", kickoffAt: "2026-07-02T15:00:00-04:00", homeSeed: "Spain", awaySeed: "Austria", homeTeam: "Spain", awayTeam: "Austria", venue: "SoFi Stadium, Los Angeles" },
  { number: 84, stage: "round32", date: "2026-07-02", kickoffAt: "2026-07-02T19:00:00-04:00", homeSeed: "Portugal", awaySeed: "Croatia", homeTeam: "Portugal", awayTeam: "Croatia", venue: "BMO Field, Toronto" },
  { number: 85, stage: "round32", date: "2026-07-02", kickoffAt: "2026-07-02T23:00:00-04:00", homeSeed: "Switzerland", awaySeed: "Algeria", homeTeam: "Switzerland", awayTeam: "Algeria", venue: "BC Place, Vancouver" },
  { number: 86, stage: "round32", date: "2026-07-03", kickoffAt: "2026-07-03T14:00:00-04:00", homeSeed: "Argentina", awaySeed: "Cabo Verde", homeTeam: "Argentina", awayTeam: "Cabo Verde", venue: "Hard Rock Stadium, Miami" },
  { number: 87, stage: "round32", date: "2026-07-03", kickoffAt: "2026-07-03T18:00:00-04:00", homeSeed: "Colombia", awaySeed: "Ghana", homeTeam: "Colombia", awayTeam: "Ghana", venue: "Arrowhead Stadium, Kansas City" },
  { number: 88, stage: "round32", date: "2026-07-03", kickoffAt: "2026-07-03T21:30:00-04:00", homeSeed: "Australia", awaySeed: "Egypt", homeTeam: "Australia", awayTeam: "Egypt", venue: "AT&T Stadium, Arlington" },
  { number: 89, stage: "round16", date: "2026-07-04", kickoffAt: "2026-07-04T13:00:00-04:00", homeSeed: "W74", awaySeed: "W77", homeTeam: "Brazil", awayTeam: "Norway" },
  { number: 90, stage: "round16", date: "2026-07-04", kickoffAt: "2026-07-04T17:00:00-04:00", homeSeed: "W75", awaySeed: "W78", homeTeam: "Paraguay", awayTeam: "France" },
  { number: 91, stage: "round16", date: "2026-07-05", kickoffAt: "2026-07-05T13:00:00-04:00", homeSeed: "W76", awaySeed: "W73", homeTeam: "Morocco", awayTeam: "Canada" },
  { number: 92, stage: "round16", date: "2026-07-05", kickoffAt: "2026-07-05T17:00:00-04:00", homeSeed: "W79", awaySeed: "W80", homeTeam: "Mexico", awayTeam: "England" },
  { number: 93, stage: "round16", date: "2026-07-06", kickoffAt: "2026-07-06T13:00:00-04:00", homeSeed: "W84", awaySeed: "W83" },
  { number: 94, stage: "round16", date: "2026-07-06", kickoffAt: "2026-07-06T17:00:00-04:00", homeSeed: "W82", awaySeed: "W81", homeTeam: "USA", awayTeam: "Belgium" },
  { number: 95, stage: "round16", date: "2026-07-07", kickoffAt: "2026-07-07T13:00:00-04:00", homeSeed: "W86", awaySeed: "W88" },
  { number: 96, stage: "round16", date: "2026-07-07", kickoffAt: "2026-07-07T17:00:00-04:00", homeSeed: "W85", awaySeed: "W87" },
  { number: 97, stage: "quarterfinal", date: "2026-07-09", kickoffAt: "2026-07-09T14:00:00-06:00", homeSeed: "W89", awaySeed: "W90" },
  { number: 98, stage: "quarterfinal", date: "2026-07-10", kickoffAt: "2026-07-10T13:00:00-06:00", homeSeed: "W93", awaySeed: "W94" },
  { number: 99, stage: "quarterfinal", date: "2026-07-11", kickoffAt: "2026-07-11T15:00:00-06:00", homeSeed: "W91", awaySeed: "W92" },
  { number: 100, stage: "quarterfinal", date: "2026-07-11", kickoffAt: "2026-07-11T19:00:00-06:00", homeSeed: "W95", awaySeed: "W96" },
  { number: 101, stage: "semifinal", date: "2026-07-14", kickoffAt: "2026-07-14T13:00:00-06:00", homeSeed: "W97", awaySeed: "W98" },
  { number: 102, stage: "semifinal", date: "2026-07-15", kickoffAt: "2026-07-15T13:00:00-06:00", homeSeed: "W99", awaySeed: "W100" },
  { number: 103, stage: "thirdPlace", date: "2026-07-18", kickoffAt: "2026-07-18T17:00:00-04:00", homeSeed: "L101", awaySeed: "L102", venue: "Hard Rock Stadium, Miami" },
  { number: 104, stage: "final", date: "2026-07-19", kickoffAt: "2026-07-19T15:00:00-04:00", homeSeed: "W101", awaySeed: "W102", venue: "MetLife Stadium, East Rutherford" },
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
    kickoffAt: fixture.kickoffAt,
    venue: fixture.venue,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeFinalScore: fixture.homeFinalScore,
    awayFinalScore: fixture.awayFinalScore,
    sortOrder: fixture.number,
  })),
  ...KNOCKOUT_FIXTURES.map((fixture) => ({
    id: matchId(fixture.number),
    number: fixture.number,
    stage: fixture.stage,
    stageLabel: STAGE_LABELS[fixture.stage],
    date: fixture.date,
    kickoffAt: fixture.kickoffAt,
    venue: fixture.venue ?? "Por confirmar",
    homeTeam: fixture.homeTeam ?? knockoutTeam(fixture.homeSeed),
    awayTeam: fixture.awayTeam ?? knockoutTeam(fixture.awaySeed),
    homeSeed: fixture.homeSeed,
    awaySeed: fixture.awaySeed,
    homeFinalScore: fixture.homeFinalScore,
    awayFinalScore: fixture.awayFinalScore,
    actualWinner: fixture.actualWinner,
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
