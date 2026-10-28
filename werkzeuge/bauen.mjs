#!/usr/bin/env node
/* =========================================================
   Unterseite aus Tamys HTML bauen
     node werkzeuge/bauen.mjs --slug gutschein --quelle ~/tamy/gutschein.html [--titel "…"] [--beschreibung "…"]
     node werkzeuge/bauen.mjs --nur-sitemap      (nur sitemap.xml + robots.txt neu, z. B. nach dem Löschen einer Seite)
   - Aus Tamys Datei zählt nur der Inhalt: <main>, sonst <body>, sonst die ganze Datei (Fragment).
     Darin steckende <header>, <footer> und alle <script> fliegen raus, <style> und <section> bleiben.
     <style> aus ihrem <head> wird vorn in den Inhalt übernommen.
   - Titel/Beschreibung aus ihrem <title> bzw. <meta name="description">, --titel/--beschreibung gehen vor.
   - Schreibt <slug>/index.html aus _geruest/seite.html, danach sitemap.xml und robots.txt neu.
   - Ausgabe: eine JSON-Zeile. Danach prüfen: node werkzeuge/pruefen.mjs <slug>/index.html
   ========================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL, DOMAIN, GERUEST, KEINE_SEITEN, ohneKommentare, entferneElemente, inneres, titelAus, metaAus,
  escapeHtml, tags } from './html.mjs';

function argumente(liste) {
  const a = {};
  for (let i = 0; i < liste.length; i++) {
    const k = liste[i];
    if (!k.startsWith('--')) throw new Error(`Unbekanntes Argument: ${k}`);
    const name = k.slice(2);
    if (name === 'nur-sitemap') { a[name] = true; continue; }
    if (i + 1 >= liste.length || liste[i + 1].startsWith('--')) throw new Error(`--${name} braucht einen Wert`);
    a[name] = liste[++i];
  }
  return a;
}

function abbruch(meldung) {
  console.log(JSON.stringify({ ok: false, fehler: meldung }));
  process.exit(2);
}

/* Inhalt aus Tamys Datei holen und säubern */
function inhaltAus(roh) {
  const html = ohneKommentare(roh);
  let art = 'fragment', inhalt = inneres(html, 'main');
  if (inhalt !== null) art = 'main';
  else if ((inhalt = inneres(html, 'body')) !== null) art = 'body';
  else inhalt = entferneElemente(html, 'head')[0].replace(/<\/?(html|body)(?=[\s>])[^>]*>|<!doctype[^>]*>/gi, '');

  /* <style> aus ihrem <head> mitnehmen, sonst fehlt ihr Design */
  const kopf = inneres(html, 'head');
  const kopfStyles = kopf ? [...kopf.matchAll(/<style(?=[\s>])[^>]*>[\s\S]*?<\/style>/gi)].map((m) => m[0]) : [];

  const entfernt = {};
  for (const t of ['script', 'header', 'footer']) [inhalt, entfernt[t]] = entferneElemente(inhalt, t);
  /* Reste wie <title>/<meta>/<link> aus einem Fragment gehören in den Kopf des Gerüsts, nicht in den Inhalt */
  inhalt = inhalt.replace(/<(title)(?=[\s>])[^>]*>[\s\S]*?<\/\1>|<(meta|link|base)(?=[\s>/])[^>]*>/gi, () => {
    entfernt.kopfreste = (entfernt.kopfreste || 0) + 1;
    return '';
  });
  inhalt = [...kopfStyles, inhalt.trim()].join('\n');
  return { inhalt, art, entfernt, kopfStyles: kopfStyles.length };
}

/* Alle Unterordner mit index.html ohne noindex, die Wurzel nicht */
function seitenFinden(ordner = WURZEL, rel = '') {
  const seiten = [];
  for (const e of fs.readdirSync(ordner, { withFileTypes: true })) {
    if (!e.isDirectory() || KEINE_SEITEN.has(e.name) || e.name.startsWith('.')) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    const datei = path.join(ordner, e.name, 'index.html');
    if (fs.existsSync(datei)) {
      const robots = tags(ohneKommentare(fs.readFileSync(datei, 'utf8')), 'meta')
        .find((t) => (t.attr.name || '').toLowerCase() === 'robots');
      if (!/noindex/i.test(robots?.attr.content || '')) seiten.push(`/${r}/`);
    }
    seiten.push(...seitenFinden(path.join(ordner, e.name), r));
  }
  return seiten.sort();
}

function sitemapUndRobots() {
  const seiten = seitenFinden();
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...seiten.map((p) => `  <url><loc>${escapeHtml(DOMAIN + p)}</loc></url>`),
    '</urlset>', ''].join('\n');
  fs.writeFileSync(path.join(WURZEL, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(WURZEL, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
  return seiten;
}

let a;
try { a = argumente(process.argv.slice(2)); } catch (e) { abbruch(e.message); }

if (a['nur-sitemap']) {
  const seiten = sitemapUndRobots();
  console.log(JSON.stringify({ ok: true, sitemap: seiten.map((p) => DOMAIN + p), robots: 'robots.txt' }));
  process.exit(0);
}

const slug = a.slug || '';
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) abbruch('--slug fehlt oder ist ungültig: nur a–z, 0–9 und Bindestriche, z. B. "gutschein" oder "teamevent-duesseldorf"');
if (KEINE_SEITEN.has(slug)) abbruch(`--slug "${slug}" ist ein Technik-Ordner und keine Seite`);
if (!a.quelle) abbruch('--quelle fehlt (Tamys HTML-Datei)');
const quelle = path.resolve(a.quelle);
if (!fs.existsSync(quelle)) abbruch(`Quelle nicht gefunden: ${quelle}`);

const roh = fs.readFileSync(quelle, 'utf8');
const { inhalt, art, entfernt, kopfStyles } = inhaltAus(roh);
const titel = a.titel ?? titelAus(roh);
const beschreibung = a.beschreibung ?? metaAus(roh, 'description');
const pfad = `/${slug}/`;

const werte = { TITEL: escapeHtml(titel), BESCHREIBUNG: escapeHtml(beschreibung), PFAD: pfad };
/* Erst die Kopf-Platzhalter, zuletzt der Inhalt: Platzhalter in Tamys Text bleiben stehen und fallen in pruefen.mjs auf */
let seite = fs.readFileSync(GERUEST, 'utf8').replace(/\{\{(TITEL|BESCHREIBUNG|PFAD)\}\}/g, (_, k) => werte[k]);
seite = seite.replace('{{INHALT}}', () => inhalt);

const ziel = path.join(WURZEL, slug, 'index.html');
fs.mkdirSync(path.dirname(ziel), { recursive: true });
fs.writeFileSync(ziel, seite);
const seiten = sitemapUndRobots();

console.log(JSON.stringify({
  ok: true, seite: `${slug}/index.html`, url: DOMAIN + pfad, titel, beschreibung,
  inhalt_aus: art, style_aus_head: kopfStyles, entfernt,
  sitemap: seiten.map((p) => DOMAIN + p), robots: 'robots.txt',
  weiter: `node werkzeuge/pruefen.mjs ${slug}/index.html`,
}));
