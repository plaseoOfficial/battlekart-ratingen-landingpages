// Vorschau: startet einen kleinen Webserver für die Landingpages.
// Start: npm run vorschau  (oder: node vorschau.mjs)
// Danach im Browser: http://localhost:4321
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ORDNER = resolve(fileURLToPath(new URL(".", import.meta.url)));
const PORT = Number(process.env.PORT) || 4321;
const NICHT_ZEIGEN = new Set(["gemeinsam", "fotos", "node_modules"]);

const TYPEN = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
};

async function seitenListe() {
  const eintraege = await readdir(ORDNER, { withFileTypes: true });
  const seiten = [];
  for (const e of eintraege) {
    if (!e.isDirectory() || NICHT_ZEIGEN.has(e.name) || e.name.startsWith(".") || e.name.startsWith("_")) continue;
    try {
      await stat(join(ORDNER, e.name, "index.html"));
      seiten.push(e.name);
    } catch {}
  }
  const links = seiten.map((s) => `<li><a href="/${s}/">${s}</a></li>`).join("\n");
  return `<!doctype html><html lang="de"><meta charset="utf-8"><title>Landingpages</title>
<body style="font:18px/1.5 system-ui;max-width:40rem;margin:3rem auto;padding:0 1rem">
<h1>Landingpages BattleKart Düsseldorf-Ratingen</h1>
<p>Alles hier ist ein Entwurf und nur auf diesem Rechner sichtbar.</p>
<ul>${links}</ul></body></html>`;
}

const server = createServer(async (req, res) => {
  try {
    const pfad = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (pfad === "/") {
      res.writeHead(200, { "content-type": TYPEN[".html"] });
      return res.end(await seitenListe());
    }
    let datei = normalize(join(ORDNER, pfad));
    if (datei !== ORDNER && !datei.startsWith(ORDNER + sep)) {
      res.writeHead(403);
      return res.end("Nicht erlaubt");
    }
    if ((await stat(datei)).isDirectory()) datei = join(datei, "index.html");
    const inhalt = await readFile(datei);
    res.writeHead(200, {
      "content-type": TYPEN[extname(datei).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(inhalt);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Diese Seite gibt es nicht.");
  }
});

server.listen(PORT, () => {
  console.log(`Vorschau läuft: http://localhost:${PORT}`);
  console.log("Beenden mit Strg+C.");
});
