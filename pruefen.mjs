// Prüfung: sucht in allen Landingpages nach Regelverstößen und offenen Stellen.
// Start: npm run pruefen            (Entwurf: offene Platzhalter sind nur Hinweise)
//        npm run pruefen -- --live  (vor Veröffentlichung: offene Platzhalter sind Fehler)
// Regeln stammen aus akte/regeln.md und dem Schreibstil in CLAUDE.md.
import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ORDNER = resolve(fileURLToPath(new URL(".", import.meta.url)));
const NICHT_PRUEFEN = new Set(["gemeinsam", "fotos", "node_modules"]);
const LIVE = process.argv.includes("--live");

function sichtbarerText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function umfeld(text, wort, vorher, nachher) {
  const treffer = [];
  for (const m of text.matchAll(wort)) {
    treffer.push({
      stelle: text.slice(Math.max(0, m.index - vorher), m.index + nachher),
      ausschnitt: text.slice(Math.max(0, m.index - 40), m.index + 60).trim(),
    });
  }
  return treffer;
}

function pruefeSeite(html) {
  const fehler = [];
  const hinweise = [];
  const offen = [];
  const ohneKommentare = html.replace(/<!--[\s\S]*?-->/g, " ");
  const text = sichtbarerText(html);

  // Marke und CI
  if (/mario\s*-?\s*kart/i.test(ohneKommentare)) fehler.push("„Mario Kart“ steht auf der Seite. Das ist laut CI verboten.");

  // Schreibstil
  if (text.includes("—")) fehler.push("Langer Gedankenstrich (—) im Text. Punkt, Komma oder Doppelpunkt nehmen.");
  const floskeln = text.match(/\b(beste[nrs]?|größte[nrs]?|einzigartig\w*|ultimativ\w*|unvergesslich\w*|innovativ\w*|maßgeschneidert\w*|ganzheitlich\w*|führende[nrs]?)\b/gi);
  if (floskeln) hinweise.push(`Werbe-Floskeln oder Superlative: ${[...new Set(floskeln)].join(", ")}. CI will keine Superlative.`);

  // Regel 7: Geburtstag nur mit „ab 12“
  for (const { stelle, ausschnitt } of umfeld(text, /geburtstag/gi, 200, 200)) {
    if (!/ab 12/i.test(stelle)) {
      fehler.push(`„Geburtstag“ ohne „ab 12 Jahren“ in der Nähe: „…${ausschnitt}…“`);
      break;
    }
  }

  // Regel 4: keine Anreize für Bewertungen
  for (const { stelle } of umfeld(text, /bewert/gi, 150, 150)) {
    if (/gratis|kostenlos|rabatt|gutschein|verlos|gewinn|geschenk/i.test(stelle)) {
      fehler.push("Bewertung steht neben einem Vorteil (gratis, Rabatt, Verlosung …). Das verbietet Google.");
      break;
    }
  }

  // Technik und Google Ads
  const titel = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!titel || !titel[1].trim()) fehler.push("Kein Seitentitel (<title>).");
  else if (titel[1].trim().length > 65) hinweise.push(`Seitentitel ist ${titel[1].trim().length} Zeichen lang. Unter 65 bleibt er in Google vollständig.`);
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) fehler.push("Keine Kurzbeschreibung (meta description).");
  const h1 = (ohneKommentare.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) fehler.push(`Die Seite hat ${h1} Hauptüberschriften (h1). Es muss genau eine sein.`);
  if (!/<html[^>]*\slang="de"/i.test(html)) hinweise.push("Sprache fehlt: <html lang=\"de\">.");
  if (!/<meta\s+name="viewport"/i.test(html)) fehler.push("Handy-Einstellung fehlt (meta viewport).");
  for (const img of ohneKommentare.match(/<img\b[^>]*>/gi) || []) {
    if (!/\salt="[^"]+"/i.test(img)) fehler.push(`Bild ohne Beschreibung (alt): ${img.slice(0, 80)}`);
  }
  if (!/noindex/i.test(html)) hinweise.push("Kein „noindex“. Anzeigen-Seiten sollen nicht bei Google erscheinen, sonst doppelt mit der HQ-Seite.");
  if (!/impressum/i.test(text)) fehler.push("Kein Link zum Impressum. Pflicht für jede veröffentlichte Seite.");
  if (!/datenschutz/i.test(text)) fehler.push("Kein Link zur Datenschutzerklärung. Pflicht für jede veröffentlichte Seite.");
  for (const m of ohneKommentare.matchAll(/<(script|link|iframe)\b[^>]*(src|href)="(https?:)?\/\/[^"]+"/gi)) {
    hinweise.push(`Lädt etwas von einem fremden Server: ${m[0].slice(0, 90)}. Datenschutz mit Ben klären.`);
  }
  if (/gtag\(|googletagmanager/i.test(ohneKommentare)) hinweise.push("Google-Tag eingebaut. Braucht Cookie-Einwilligung, nur nach Freigabe durch Ben.");

  // Offene Stellen
  const platzhalter = ohneKommentare
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .match(/\[[A-ZÄÖÜ][A-ZÄÖÜ0-9 \-\/.]+\]/g);
  if (platzhalter) for (const p of new Set(platzhalter)) offen.push(`Platzhalter ${p}`);
  const fotos = (ohneKommentare.match(/class="[^"]*foto-platzhalter/g) || []).length;
  if (fotos) offen.push(`${fotos} Foto(s) fehlen noch (nur echte Fotos vom Standort, keine KI-Bilder)`);

  return { fehler, hinweise, offen };
}

const seiten = [];
for (const e of await readdir(ORDNER, { withFileTypes: true })) {
  if (!e.isDirectory() || NICHT_PRUEFEN.has(e.name) || e.name.startsWith(".") || e.name.startsWith("_")) continue;
  const datei = join(ORDNER, e.name, "index.html");
  try {
    await stat(datei);
    seiten.push([e.name, datei]);
  } catch {}
}

let fehlerGesamt = 0;
for (const [name, datei] of seiten) {
  const { fehler, hinweise, offen } = pruefeSeite(await readFile(datei, "utf8"));
  if (LIVE) fehler.push(...offen.map((o) => `Noch offen: ${o}`));
  fehlerGesamt += fehler.length;
  console.log(`\n=== ${name} ===`);
  if (!fehler.length && !hinweise.length && !offen.length) console.log("✅ Alles in Ordnung.");
  for (const f of fehler) console.log(`❌ ${f}`);
  for (const h of hinweise) console.log(`⚠️  ${h}`);
  if (!LIVE) for (const o of offen) console.log(`⏳ ${o}`);
}

console.log(
  fehlerGesamt
    ? `\n${fehlerGesamt} Fehler. Bitte beheben, bevor die Seite an Ben geht.`
    : LIVE
      ? "\nKeine Fehler. Die Seite kann Ben zur Freigabe vorgelegt werden."
      : "\nKeine Fehler. ⏳ zeigt, was noch fehlt, bevor die Seite live gehen kann."
);
process.exit(fehlerGesamt ? 1 : 0);
