// Cloudflare Worker for the On the Move recipe (R1, R2). Decision V1: full
// view first.
//
//   GET /full?species=<ticks, comma-separated>&lang=<setting>&photo=<true|false>&units=<metric|imperial>&layout=<single|multi>&utc_offset=<seconds>
//   GET /photo/<taxon>.jpg: the species photo (src/photos.js)
//   cron: refresh live positions from Movebank into KV (refresh.js)
//
// TRMNL sends select values snake_cased from their labels ("White stork" ->
// white_stork, "Deutsch" -> deutsch; Nextbike PROJECT.md), so both those and
// the plain taxon are accepted.
import featured from "../data/featured.json";
import whitelist from "../data/studies.json";
import { buildFull } from "./view.js";
import { refresh, withLive, LIVE_KEY } from "./refresh.js";
import { STRINGS, fill } from "./strings.js";
import { speciesParam as mapSpecies, speciesList as mapSpeciesList, photoParam, langParam, unitsParam, layoutParam } from "./params.js";
import { PHOTOS } from "./photos.js";

// The settings' values mapped to a taxon or language (src/params.js). Older
// labels stay accepted: a device keeps the value it was set up with.
export const speciesParam = (value) => mapSpecies(value, featured.species);
export const speciesList = (value) => mapSpeciesList(value, featured.species);
export { langParam, photoParam, unitsParam, layoutParam };

// The species photos (pipeline/build_photos.py), served here so the template
// can load them from the Worker's own origin.
function photo(name) {
  const b64 = PHOTOS[name];
  if (!b64) return new Response("not found", { status: 404 });
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Response(bytes, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=604800" } });
}

// Usage counts (owner, 2026-10-03): one anonymous data point per poll in Workers
// Analytics Engine (binding STATS), so we learn which settings people choose.
// Only the settings themselves: no IP, no device, no UTC offset. STATS_SAMPLE=N
// writes 1 poll in N (default every poll; the free plan takes 100,000 a day);
// double1 is the weight, so SUM(double1) counts polls. Never breaks a poll.
export function recordPoll(env, settings, random = Math.random) {
  try {
    if (!env.STATS || typeof env.STATS.writeDataPoint !== "function") return false;
    const every = Math.max(1, Math.floor(Number(env.STATS_SAMPLE) || 1));
    if (every > 1 && random() * every >= 1) return false;
    env.STATS.writeDataPoint({
      indexes: ["poll"],
      blobs: [settings.species.length ? settings.species.join(",") : "all", settings.lang, settings.units, settings.layout, settings.photo ? "photo" : "no_photo"],
      doubles: [every, settings.species.length]
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function handle(request, env, now = new Date()) {
  const url = new URL(request.url);
  const m = url.pathname.match(/^\/photo\/([a-z_]+)\.jpg$/);
  if (m) return photo(m[1]);
  if (url.pathname !== "/full") return new Response("not found", { status: 404 });
  const lang = langParam(url.searchParams.get("lang"));
  let body;
  try {
    recordPoll(env, {
      species: speciesList(url.searchParams.getAll("species").join(",")),
      lang,
      units: unitsParam(url.searchParams.get("units")),
      layout: layoutParam(url.searchParams.get("layout")),
      photo: photoParam(url.searchParams.get("photo"))
    });
    // One KV read a request, never a write (Nextbike: never write on a read path).
    const live = env.KV ? await env.KV.get(LIVE_KEY, "json") : null;
    body = buildFull(withLive(featured, live), {
      species: speciesList(url.searchParams.getAll("species").join(",")),
      photoBase: photoParam(url.searchParams.get("photo")) ? url.origin + "/photo/" : null,
      units: unitsParam(url.searchParams.get("units")),
      layout: layoutParam(url.searchParams.get("layout")),
      lang,
      now,
      utcOffset: Number(url.searchParams.get("utc_offset")) || 0
    });
  } catch (e) {
    // Always 200 with something renderable: a recipe has no other channel (Nextbike).
    body = { state: "error", status: fill(STRINGS[lang].error, { what: String((e && e.message) || e).slice(0, 80) }) };
  }
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "max-age=300" }
  });
}

export default {
  fetch: (request, env) => handle(request, env),
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refresh(env, { featured, whitelist, now: new Date(event.scheduledTime) }));
  }
};
