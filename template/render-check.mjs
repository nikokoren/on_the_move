// Renders the full view in real Chromium against TRMNL's own framework and
// MapLibre, with payloads built by the Worker from the real data (working
// method rule 1). Page structure and asset loading follow nearby-nextbike
// template/browser-check.mjs.
//
//     cd template && npm i && node render-check.mjs [outdir]
//
// Writes one PNG per case and prints what it measured. Needs network (the
// framework, MapLibre and the map tiles).
import fs from "fs";
import os from "os";
import path from "path";
import { Liquid } from "liquidjs";
import { chromium } from "playwright";
import { buildFull } from "../worker/src/view.js";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.argv[2] || path.join(os.tmpdir(), "otm-render");
const CACHE = path.join(os.tmpdir(), "trmnl-assets");
const ASSETS = {
  "plugins.css": "https://usetrmnl.com/css/latest/plugins.css",
  "plugins.js": "https://usetrmnl.com/js/latest/plugins.js"
};
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
for (const [name, url] of Object.entries(ASSETS)) {
  const at = path.join(CACHE, name);
  if (fs.existsSync(at) && fs.statSync(at).size > 0) continue;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  fs.writeFileSync(at, Buffer.from(await res.arrayBuffer()));
}

const data = JSON.parse(fs.readFileSync(path.join(HERE, "../worker/data/featured.json")));
const liquid = new Liquid();
const tpl = fs.readFileSync(path.join(HERE, "full.liquid"), "utf8");

// Every featured species on one day in English, plus German and other days
// for the ones whose state changes (travelling, staying, live).
const DAY = process.env.OTM_DAY || "2026-09-28";
let cases = data.species.map((s) => [s.taxon, process.env.OTM_LANG || "en", DAY]);
cases.push(["Ciconia ciconia", "de", "2026-08-25"], ["Lanius collurio", "de", "2026-10-10"],
           ["Streptopelia turtur", "de", "2026-10-05"], ["Numenius madagascariensis", "en", "2026-08-20"]);
// OTM_ONLY="Ciconia ciconia" renders only that species' cases.
if (process.env.OTM_ONLY) cases = cases.filter((c) => c[0] === process.env.OTM_ONLY);
// The screen's classes: model and bit-depth mode, e.g. OTM_SCREEN="screen--ogv2" or
// "screen--og screen--2bit". The device's depth changes how the framework paints the map.
const SCREEN = process.env.OTM_SCREEN || "screen--og";

function chromiumPath() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !fs.existsSync(root)) return undefined;
  const dir = fs.readdirSync(root).find((d) => /^chromium-\d/.test(d));
  const at = dir && path.join(root, dir, "chrome-linux", "chrome");
  return at && fs.existsSync(at) ? at : undefined;
}
const browser = await chromium.launch({
  executablePath: chromiumPath(),
  args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"]
});

const rows = [];
for (const [taxon, lang, day] of cases) {
  // Photos from worker/photos (what the Worker serves at /photo/); OTM_PHOTO=0 renders without.
  const photoBase = process.env.OTM_PHOTO === "0" ? null : "file://" + path.join(HERE, "../worker/photos") + "/";
  const v = buildFull(data, { species: taxon, lang, now: new Date(day + "T12:00:00Z"), photoBase });
  const html = await liquid.parseAndRender(tpl, v);
  const page = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${path.join(CACHE, "plugins.css")}">
<script src="file://${path.join(CACHE, "plugins.js")}"></script>
<style>html,body{margin:0;padding:0}</style></head><body class="trmnl">
<div class="screen ${SCREEN}"><div class="view view--full">${html}</div></div></body></html>`;
  const file = path.join(OUT, "page.html");
  fs.writeFileSync(file, page);
  const tab = await browser.newPage({ viewport: { width: 800, height: 480 } });
  const errors = [];
  tab.on("pageerror", (e) => errors.push(e.message));
  // Network requests go through Node's fetch, which verifies TLS against this
  // environment's proxy CA; Chromium here does not have that CA. The framework
  // stylesheet asks for /fonts/..., which on TRMNL is its own host.
  await tab.route(/^(https:|file:\/\/\/fonts\/)/, async (route) => {
    let url = route.request().url();
    if (url.startsWith("file:///fonts/")) url = "https://usetrmnl.com" + url.slice(7);
    try {
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
      const body = Buffer.from(await res.arrayBuffer());
      await route.fulfill({ status: res.status, body,
        headers: { "content-type": res.headers.get("content-type") || "application/octet-stream",
                   "access-control-allow-origin": "*" } });
    } catch (e) {
      await route.abort();
    }
  });
  await tab.goto("file://" + file);
  await tab.waitForTimeout(6000);
  const got = await tab.evaluate(() => {
    const map = window.__otmMap;
    const r = (el) => el && el.getBoundingClientRect();
    const box = r(document.getElementById("otm-box"));
    const tags = [...document.querySelectorAll("#otm-map > .absolute.inset--2")].map((w) => r(w.firstChild));
    const screen = r(document.querySelector(".screen"));
    const attrib = r(document.querySelector(".map__attribution, .maplibregl-ctrl-attrib"));
    const hits = (t, b) => b && !(t.right < b.left || t.left > b.right || t.bottom < b.top || t.top > b.bottom);
    const overlap = tags.some((t) => hits(t, box) || hits(t, attrib));
    const inside = (b) => b.left >= screen.left && b.top >= screen.top && b.right <= screen.right + 0.5 && b.bottom <= screen.bottom + 0.5;
    return {
      drawn: !!map && !!map.getLayer("trmnl-dot-animal"),
      photo: (() => { const im = document.querySelector("#otm-box img"); return im ? `${Math.round(im.getBoundingClientRect().width)}x${Math.round(im.getBoundingClientRect().height)}${im.naturalWidth ? "" : " NOT LOADED"}` : "none"; })(),
      waitingShown: getComputedStyle(document.getElementById("otm-map-waiting")).display !== "none",
      zoom: map ? +map.getZoom().toFixed(2) : null,
      callouts: tags.length, overlap, boxInside: inside(box), tagsInside: tags.every(inside),
      // What the framework's map pass left: its canvases (the dither layer is one)
      // and whether the map settled. Printed with OTM_DEBUG=1.
      debug: {
        ready: window.TRMNL_PLUGINS_READY, loaded: map && map.loaded(), tiles: map && map.areTilesLoaded(),
        depth: getComputedStyle(document.querySelector(".screen")).getPropertyValue("--framework-bit-depth"),
        canvases: [...document.querySelectorAll("#otm-map canvas")].map((c) => `${c.className || "-"}:${c.width}x${c.height}:${c.style.visibility || "visible"}`)
      }
    };
  });
  const png = path.join(OUT, `${taxon.replace(/ /g, "_")}_${lang}_${day}.png`);
  await tab.locator(".screen").screenshot({ path: png });
  await tab.close();
  rows.push({ taxon, lang, day, kind: v.kind, errors: errors.length, ...got, png: path.basename(png) });
}
await browser.close();

let bad = 0;
for (const r of rows) {
  const ok = r.drawn && !r.waitingShown && !r.overlap && r.boxInside && r.tagsInside && !r.errors && !/NOT LOADED/.test(r.photo);
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${r.taxon.padEnd(26)} ${r.lang} ${r.day} ${r.kind.padEnd(5)} zoom ${r.zoom} callouts ${r.callouts} overlap ${r.overlap} photo ${r.photo} errors ${r.errors}`);
  if (process.env.OTM_DEBUG) console.log("     " + JSON.stringify(r.debug));
}
console.log(`\n${rows.length} cases, ${bad} failed. PNGs in ${OUT}`);
process.exit(bad ? 1 : 0);
