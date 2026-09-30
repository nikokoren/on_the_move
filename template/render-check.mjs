// Renders the recipe's views in real Chromium against TRMNL's own framework
// and MapLibre, with payloads built by the Worker from the real data (working
// method rule 1). Page structure and asset loading follow nearby-nextbike
// template/browser-check.mjs.
//
//     cd template && npm i && node render-check.mjs [outdir]
//
// Writes one PNG per case and prints what it measured. Needs network (the
// framework, MapLibre and the map tiles).
//
// Like TRMNL: shared.liquid is prepended to the layout's markup, its
// {% template %} blocks become partials for {% render %}; the smaller views
// sit in a real mashup so the framework sizes them; the screen carries the
// breakpoint class the renderer adds by device model (OG screen--md, X
// screen--lg; SOURCES.md, trmnl.com/framework/responsive, 2026-09-29).
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

// TRMNL's {% template name %}...{% endtemplate %}: lifted out of shared.liquid
// into an in-memory file system that {% render "name" %} reads from.
const partials = {};
const shared = fs.readFileSync(path.join(HERE, "shared.liquid"), "utf8")
  .replace(/{%-?\s*template\s+([\w/]+)\s*-?%}([\s\S]*?){%-?\s*endtemplate\s*-?%}/g, (_, name, body) => { partials[name] = body; return ""; });
const memfs = {
  readFileSync: (f) => partials[f], readFile: async (f) => partials[f],
  existsSync: (f) => f in partials, exists: async (f) => f in partials,
  contains: () => true, resolve: (_root, file) => file, sep: "/"
};
const liquid = new Liquid({ fs: memfs, root: ["/"], extname: "", relativeReference: false });

// Where each view sits: the mashup that holds it and how many cells it has.
const MASHUP = {
  full: null,
  half_horizontal: ["mashup--1Tx1B", 2],
  half_vertical: ["mashup--1Lx1R", 2],
  quadrant: ["mashup--2x2", 4]
};
const VIEWS = (process.env.OTM_VIEWS || "full").split(",");
const LAYOUT = process.env.OTM_LAYOUT || "single";

// Every featured species on one day, plus other days for the ones whose state
// changes. The multi layout follows all species; its cases are refresh slots
// over one day, so the shown species and the page move.
const DAY = process.env.OTM_DAY || "2026-09-28";
const LANG = process.env.OTM_LANG || "en";
let cases;
if (LAYOUT === "multi") {
  const n = Number(process.env.OTM_SLOTS || 6);
  // OTM_SLOT_STEP=1 with OTM_SLOTS=18 expands every species once.
  const step = Number(process.env.OTM_SLOT_STEP) || Math.ceil(96 / n);
  cases = Array.from({ length: n }, (_, i) => ["*", LANG, DAY, i * step]);
} else {
  cases = data.species.map((s) => [s.taxon, LANG, DAY, 0]);
  cases.push(["Ciconia ciconia", "de", "2026-08-25", 0], ["Lanius collurio", "de", "2026-10-10", 0],
             ["Streptopelia turtur", "de", "2026-10-05", 0], ["Numenius madagascariensis", "en", "2026-08-20", 0]);
}
// OTM_ONLY="Ciconia ciconia" renders only that species' cases.
if (process.env.OTM_ONLY) cases = cases.filter((c) => c[0] === process.env.OTM_ONLY);
// The screen's classes: model and orientation, e.g. "screen--og screen--portrait".
// The breakpoint class follows the model, as TRMNL's renderer adds it.
const SCREENS = (process.env.OTM_SCREENS || process.env.OTM_SCREEN || "screen--og").split(";");
const withSize = (s) => /screen--(sm|md|lg)\b/.test(s) ? s : s + (/screen--v2\b/.test(s) ? " screen--lg" : " screen--md");

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
for (const view of VIEWS) for (const screen of SCREENS) for (const [taxon, lang, day, slot] of cases) {
  // OTM_TPL=path/to/variant.liquid renders a variant (a mock-up) in the view's place.
  const tpl = shared + fs.readFileSync(process.env.OTM_TPL || path.join(HERE, view + ".liquid"), "utf8");
  // Photos from worker/photos (what the Worker serves at /photo/); OTM_PHOTO=0 renders without.
  const photoBase = process.env.OTM_PHOTO === "0" ? null : "file://" + path.join(HERE, "../worker/photos") + "/";
  const species = taxon === "*" ? data.species.map((s) => s.taxon) : taxon;
  const now = new Date(Date.parse(day + "T00:00:00Z") + (12 * 4 + slot) * 900000);
  const v = buildFull(data, { species, lang, now, photoBase, layout: LAYOUT });
  const html = await liquid.parseAndRender(tpl, v);
  const cls = withSize(screen);
  const [mashup, cells] = MASHUP[view] || [null, 1];
  const inner = mashup
    ? `<div class="mashup ${mashup}"><div class="view view--${view}" id="otm-view">${html}</div>${`<div class="view view--${view}"></div>`.repeat(cells - 1)}</div>`
    : `<div class="view view--full" id="otm-view">${html}</div>`;
  const page = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${path.join(CACHE, "plugins.css")}">
<script src="file://${path.join(CACHE, "plugins.js")}"></script>
<style>html,body{margin:0;padding:0}</style></head><body class="trmnl">
<div class="screen ${process.env.OTM_LATE_SIZE ? screen : cls}">${inner}</div>${process.env.OTM_LATE_SIZE ? `<script>setTimeout(function () { document.querySelector(".screen").className = "screen ${cls}"; }, ${Number(process.env.OTM_LATE_SIZE) || 300});</script>` : ""}</body></html>`;
  const file = path.join(OUT, "page.html");
  fs.writeFileSync(file, page);
  // Large enough for any screen model or orientation; the shot is the view.
  const tab = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
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
  // OTM_SWITCH="screen--og screen--portrait": change the screen's classes after the
  // first draw, the way a host can resize or rotate a rendered screen; the map is
  // rebuilt by TRMNLMaps.watch and everything must follow.
  if (process.env.OTM_SWITCH) {
    await tab.evaluate((c) => { document.querySelector(".screen").className = "screen " + c; }, withSize(process.env.OTM_SWITCH));
    await tab.waitForTimeout(6000);
  }
  const got = await tab.evaluate((multiWanted) => {
    const r = (el) => el && el.getBoundingClientRect();
    const shown = (el) => el && el.getClientRects().length > 0;
    const viewEl = document.getElementById("otm-view");
    const vr = r(viewEl);
    const inside = (b, o = vr) => b.left >= o.left - 0.5 && b.top >= o.top - 0.5 && b.right <= o.right + 0.5 && b.bottom <= o.bottom + 0.5;
    const maps = [...viewEl.querySelectorAll("[data-otm-map]")].filter(shown);
    const drawn = maps.filter((n) => n._otmMap && n._otmMap.getLayer("trmnl-dot-animal")).length;
    const waiting = [...viewEl.querySelectorAll("[data-otm-waiting]")].filter(shown).length;
    // Every word on screen must be whole: no text clipped by the view or by its list.
    const texts = [...viewEl.querySelectorAll("span, img")].filter((e) => shown(e) && !e.closest("[data-otm-toward]") && !e.closest(".maplibregl-ctrl"));
    const clipped = texts.filter((e) => !inside(r(e))).map((e) => (e.textContent || e.tagName).trim().slice(0, 30));
    const lists = [...viewEl.querySelectorAll("[data-otm-list]")].filter(shown);
    const listOver = lists.filter((l) => [...l.querySelectorAll("span, img")].some((e) => !inside(r(e), r(l)))).length;
    // The page must be the one holding the shown animal, starting on a page boundary.
    const pageBad = [...viewEl.querySelectorAll("[data-otm-page]")].filter(shown).filter((e) => {
      const [start, size, cur] = e.getAttribute("data-otm-page").split(" ").map(Number);
      return !(start % size === 0 && start <= cur && cur < start + size);
    }).length;
    const multiShown = [...viewEl.querySelectorAll("[data-otm-list], [data-otm-cards]")].some(shown);
    const current = [...viewEl.querySelectorAll("[data-otm-current], [data-otm-cards] .bg--black")].filter(shown).length;
    // The pill (full view, single): needed when the destination ring is not
    // visible (off the map or under the text box), and then shown (topic 10).
    let pillNeeded = false, pillShown = false;
    const pillMap = maps.find((n) => n.hasAttribute("data-otm-with-pill"));
    if (pillMap && pillMap._otmMap) {
      const scope = pillMap.closest("[data-otm-scope]");
      const box = r(scope.querySelector("[data-otm-box]"));
      const toward = (scope.querySelector("[data-otm-toward]") || {}).textContent || "";
      const g = JSON.parse(pillMap.getAttribute("data-geo"));
      const mb = r(pillMap);
      if (g.dest && toward) {
        // project() is in layout pixels, rects in on-screen pixels (the page may scale the screen).
        const k = pillMap.offsetWidth ? mb.width / pillMap.offsetWidth : 1;
        const q = pillMap._otmMap.project(g.dest), x = mb.left + q.x * k, y = mb.top + q.y * k;
        const m = k * 16 * (parseFloat(getComputedStyle(document.querySelector(".screen")).getPropertyValue("--content-scale")) || 1);
        const onMap = x >= mb.left + m && x <= mb.right - m && y >= mb.top + m && y <= mb.bottom - m;
        const underBox = box && x >= box.left - m && x <= box.right + m && y >= box.top - m && y <= box.bottom + m;
        pillNeeded = !(onMap && !underBox);
      }
      const tags = [...scope.querySelectorAll("[data-otm-pill]")].map(r);
      pillShown = tags.some((t) => !(box && t.left >= box.left && t.right <= box.right && t.top >= box.top && t.bottom <= box.bottom));
    }
    return {
      maps: maps.length, drawn, waiting, clipped, listOver, multiShown, current, pageBad,
      pillNeeded, pillShown,
      size: `${Math.round(vr.width)}x${Math.round(vr.height)}`,
      zoom: maps[0] && maps[0]._otmMap ? +maps[0]._otmMap.getZoom().toFixed(2) : null
    };
  }, LAYOUT === "multi");
  const tagScreen = SCREENS.length > 1 || VIEWS.length > 1 ? "_" + view + "_" + screen.replace(/screen--/g, "").replace(/ /g, "-") : "";
  const png = path.join(OUT, `${taxon === "*" ? "multi-" + slot : taxon.replace(/ /g, "_")}_${lang}_${day}${tagScreen}.png`);
  await tab.locator("#otm-view").screenshot({ path: png });
  await tab.close();
  // The multi layout shows on the X (lg) only, and only with rows in the payload.
  const multiWanted = !!v.rows && /screen--lg/.test(cls);
  rows.push({ view, screen, taxon: taxon === "*" ? `slot ${slot} ${v.species}` : taxon, lang, day, kind: v.kind, errors: errors.length, multiWanted, ...got, png: path.basename(png) });
}
await browser.close();

let bad = 0;
for (const r of rows) {
  const why = [];
  if (!r.maps || r.drawn !== r.maps) why.push(`drawn ${r.drawn}/${r.maps}`);
  // One map on screen, or the quadrant's two cards: never a hidden block showing too.
  const mapsWanted = r.multiWanted && r.view === "quadrant" ? 2 : 1;
  if (r.maps !== mapsWanted) why.push(`${r.maps} maps on screen, wanted ${mapsWanted}`);
  if (r.waiting) why.push("waiting shown");
  if (r.clipped.length) why.push(`clipped ${JSON.stringify(r.clipped.slice(0, 3))}`);
  if (r.listOver) why.push("list overflows");
  if (r.multiShown !== r.multiWanted) why.push(`multi shown ${r.multiShown}, wanted ${r.multiWanted}`);
  if (r.multiWanted && r.current !== 1) why.push(`${r.current} expanded`);
  if (r.pageBad) why.push("wrong page");
  if (r.pillNeeded !== r.pillShown) why.push(`pill needed ${r.pillNeeded} shown ${r.pillShown}`);
  if (r.errors) why.push(`${r.errors} page errors`);
  if (why.length) bad++;
  console.log(`${why.length ? "FAIL" : "ok  "} ${r.view.padEnd(15)} ${r.screen.replace(/screen--/g, "").padEnd(12)} ${r.size.padEnd(9)} ${r.taxon.padEnd(30)} ${r.lang} ${r.day} ${String(r.kind).padEnd(5)} maps ${r.maps} pill ${r.pillNeeded ? "needed" : "-"}${why.length ? "  " + why.join("; ") : ""}`);
}
console.log(`\n${rows.length} cases, ${bad} failed. PNGs in ${OUT}`);
process.exit(bad ? 1 : 0);
