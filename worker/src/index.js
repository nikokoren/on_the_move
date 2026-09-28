// Cloudflare Worker for the On the Move recipe (R1). Polling endpoint for the
// full view; smaller views come later (decision V1).
//
//   GET /full?species=<taxon|all>&lang=<en|de>&utc_offset=<seconds>
//
// The featured data is bundled (worker/data/featured.json, built by
// pipeline/build_featured.py). Live positions are the pipeline's snapshot for
// now, always shown with their date (D3); the cron refresh from Movebank (R2)
// is still to do.
import data from "../data/featured.json";
import { buildFull } from "./view.js";
import { STRINGS, fill } from "./strings.js";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const lang = url.searchParams.get("lang") === "de" ? "de" : "en";
    if (url.pathname !== "/full") return new Response("not found", { status: 404 });
    let body;
    try {
      body = buildFull(data, {
        species: url.searchParams.get("species") || "all",
        lang,
        now: new Date(),
        utcOffset: Number(url.searchParams.get("utc_offset")) || 0
      });
    } catch (e) {
      body = { state: "error", status: fill(STRINGS[lang].error, { what: String(e && e.message || e).slice(0, 80) }) };
    }
    return new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "max-age=300" }
    });
  }
};
