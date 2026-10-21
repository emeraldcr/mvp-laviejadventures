import { cache } from "react";
import { readPublicTours } from "./public-catalog";

export const getPublicTours = cache(async () => {
  try { return await readPublicTours(); }
  catch { console.error("Public tour catalog unavailable"); return []; }
});
