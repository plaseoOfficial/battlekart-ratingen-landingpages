// Bauen: kopiert alle fertigen Seiten in den Ordner dist/. Den veröffentlicht Vercel.
// Läuft bei Vercel automatisch nach der Prüfung (npm run build). Lokal braucht ihr das nicht.
// Ordner mit _ am Anfang (die Vorlage), Skripte und Anleitungen werden nicht veröffentlicht.
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ORDNER = resolve(fileURLToPath(new URL(".", import.meta.url)));
const ZIEL = join(ORDNER, "dist");
const NICHT_VEROEFFENTLICHEN = new Set(["dist", "node_modules", ".vercel", ".git"]);
const BILDER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".mp4"]);

await rm(ZIEL, { recursive: true, force: true });
await mkdir(ZIEL);

const seiten = [];
for (const e of await readdir(ORDNER, { withFileTypes: true })) {
  if (!e.isDirectory() || NICHT_VEROEFFENTLICHEN.has(e.name) || e.name.startsWith(".") || e.name.startsWith("_")) continue;
  if (e.name === "gemeinsam" || e.name === "fotos") {
    await cp(join(ORDNER, e.name), join(ZIEL, e.name), {
      recursive: true,
      filter: async (quelle) => (await stat(quelle)).isDirectory() || e.name === "gemeinsam" || BILDER.has(extname(quelle).toLowerCase()),
    });
    continue;
  }
  try {
    await stat(join(ORDNER, e.name, "index.html"));
  } catch {
    continue;
  }
  await cp(join(ORDNER, e.name), join(ZIEL, e.name), { recursive: true });
  seiten.push(e.name);
}

console.log(`Veröffentlicht werden: ${seiten.join(", ")}`);
