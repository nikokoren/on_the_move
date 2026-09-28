// Measures the full view's text slots in real Chromium with TRMNL's framework
// CSS: characters per line and the lines each slot can take, for R16
// (docs/TEXT_REQUIREMENTS.md). Uses a real payload from the Worker.
//
//     node measure-slots.mjs
import fs from "fs";
import os from "os";
import path from "path";
import { Liquid } from "liquidjs";
import { chromium } from "playwright";
import { buildFull } from "../worker/src/view.js";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const CACHE = path.join(os.tmpdir(), "trmnl-assets");
const data = JSON.parse(fs.readFileSync(path.join(HERE, "../worker/data/featured.json")));
const v = buildFull(data, { species: "Ciconia ciconia", lang: "de", now: new Date("2026-08-25T12:00:00Z") });
const html = await new Liquid().parseAndRender(fs.readFileSync(path.join(HERE, "full.liquid"), "utf8"), v);
const file = path.join(os.tmpdir(), "otm-measure.html");
fs.writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${path.join(CACHE, "plugins.css")}"><script src="file://${path.join(CACHE, "plugins.js")}"></script>
<style>html,body{margin:0}</style></head><body class="trmnl"><div class="screen screen--og"><div class="view view--full">${html}</div></div></body></html>`);
const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
const exe = root && path.join(root, fs.readdirSync(root).find((d) => /^chromium-\d/.test(d)), "chrome-linux", "chrome");
const b = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
const t = await b.newPage({ viewport: { width: 800, height: 480 } });
await t.route(/^(https:|file:\/\/\/fonts\/)/, async (route) => {
  let url = route.request().url();
  if (url.startsWith("file:///fonts/")) url = "https://usetrmnl.com" + url.slice(7);
  try { const r = await fetch(url); await route.fulfill({ status: r.status, body: Buffer.from(await r.arrayBuffer()), headers: { "content-type": r.headers.get("content-type") || "application/octet-stream", "access-control-allow-origin": "*" } }); } catch { await route.abort(); }
});
await t.goto("file://" + file);
await t.waitForTimeout(5000);
const SAMPLE = "Mindestens 3.415 km im Jahr zwischen den Aufenthaltsorten. Covers at least 3,415 km a year between places it stays.";
const got = await t.evaluate((sample) => {
  const box = document.getElementById("otm-box");
  const cs = getComputedStyle(box);
  const inner = box.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
  const maxBox = parseFloat(getComputedStyle(box).maxWidth);
  const out = {};
  for (const el of box.querySelectorAll("span")) {
    // The real element, briefly unwrapped: its full width over its own text.
    const ws = el.style.whiteSpace, disp = el.style.display;
    el.style.whiteSpace = "nowrap"; el.style.display = "inline-block";
    const w = el.getBoundingClientRect().width, n = el.textContent.trim().length;
    el.style.whiteSpace = ws; el.style.display = disp;
    out[el.className] = { text: el.textContent.trim().slice(0, 40), chars: n, perCharPx: +(w / n).toFixed(2),
                          lineHeightPx: parseFloat(getComputedStyle(el).lineHeight) || null,
                          fontSizePx: parseFloat(getComputedStyle(el).fontSize) };
  }
  return { boxMaxPx: maxBox || null, boxInnerNowPx: +inner.toFixed(0), mapPx: document.getElementById("otm-map").clientWidth, slots: out };
}, SAMPLE);
console.log(JSON.stringify(got, null, 1));
await b.close();
