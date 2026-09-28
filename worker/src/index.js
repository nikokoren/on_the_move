// Cloudflare Worker for the On the Move recipe (R1, R2). Decision V1: full
// view first.
//
//   GET /full?species=<setting>&lang=<setting>&utc_offset=<seconds>
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

const snake = (s) => String(s || "").toLowerCase().replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function speciesParam(value) {
  const v = snake(value);
  if (!v || v === "all" || v === "all_featured" || v === "alle") return "all";
  for (const sp of featured.species) {
    const keys = [sp.taxon, sp.names.en, sp.names.de].map(snake);
    if (keys.includes(v)) return sp.taxon;
  }
  return "all";
}

export function langParam(value) {
  const v = snake(value);
  return v === "de" || v === "deutsch" || v === "german" ? "de" : "en";
}

export async function handle(request, env, now = new Date()) {
  const url = new URL(request.url);
  if (url.pathname !== "/full") return new Response("not found", { status: 404 });
  const lang = langParam(url.searchParams.get("lang"));
  let body;
  try {
    // One KV read a request, never a write (Nextbike: never write on a read path).
    const live = env.KV ? await env.KV.get(LIVE_KEY, "json") : null;
    body = buildFull(withLive(featured, live), {
      species: speciesParam(url.searchParams.get("species")),
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
