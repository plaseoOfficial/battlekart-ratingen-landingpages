#!/usr/bin/env node
/* =========================================================
   Unterseite prüfen, bevor sie live geht
     node werkzeuge/pruefen.mjs gutschein/index.html
   Ausgabe: {"ok":bool,"fehler":[…],"hinweise":[…]}  ·  Exit 1 bei Fehlern, 2 bei falschem Aufruf.
   Fehler blockieren, Hinweise nicht. Die Sätze richten sich an die Gestalterin.
   ========================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL, DOMAIN, ohneKommentare, inneres, titelAus, metaAus, tags, text } from './html.mjs';

const TELEFON_TEXT = '02102 445500';
const TELEFON_LINK = 'tel:+492102445500';
const MAX_BILD = 300 * 1024;

const datei = process.argv[2];
if (!datei || !fs.existsSync(datei)) {
  console.log(JSON.stringify({ ok: false, fehler: [`Datei nicht gefunden: ${datei || '(keine angegeben)'}. Aufruf: node werkzeuge/pruefen.mjs <slug>/index.html`], hinweise: [] }));
  process.exit(2);
}
const absolut = path.resolve(datei);
const ordner = path.dirname(absolut);
const rel = path.relative(WURZEL, absolut).split(path.sep).join('/');
const pfad = rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`;

const roh = fs.readFileSync(absolut, 'utf8');
const html = ohneKommentare(roh);
const inhalt = inneres(html, 'main') ?? '';
const fehler = [], hinweise = [];
const kurz = (s, n = 60) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/* ---------- Titel + Beschreibung ---------- */
const titel = titelAus(html), beschreibung = metaAus(html, 'description');
if (!titel) fehler.push('Der Seitentitel (<title>) fehlt. Er soll 30–65 Zeichen haben.');
else if (titel.length < 30 || titel.length > 65)
  fehler.push(`Der Seitentitel hat ${titel.length} Zeichen, er soll 30–65 haben (sonst schneidet Google ihn ab oder er wirkt leer): »${titel}«`);
if (!beschreibung) fehler.push('Die Beschreibung (meta description) fehlt. Sie soll 70–160 Zeichen haben.');
else if (beschreibung.length < 70 || beschreibung.length > 160)
  fehler.push(`Die Beschreibung (meta description) hat ${beschreibung.length} Zeichen, sie soll 70–160 haben: »${kurz(beschreibung, 80)}«`);

/* ---------- Überschriften, canonical, noindex ---------- */
const h1 = tags(html, 'h1').length;
if (h1 !== 1) fehler.push(h1 === 0
  ? 'Die Seite hat keine Hauptüberschrift (h1). Es braucht genau eine.'
  : `Die Seite hat ${h1} Hauptüberschriften (h1). Es darf nur eine geben, die anderen bitte als h2.`);
if (!tags(html, 'h2').length) hinweise.push('Es gibt keine Zwischenüberschrift (h2). Gliedere den Text mit h2, das hilft Lesern und Google.');

const canonical = tags(html, 'link').find((t) => (t.attr.rel || '').toLowerCase().split(/\s+/).includes('canonical'));
const sollCanonical = DOMAIN + pfad;
if (!canonical) fehler.push(`Der canonical-Link fehlt. Er muss ${sollCanonical} sein.`);
else if (canonical.attr.href !== sollCanonical)
  fehler.push(`Der canonical-Link zeigt auf ${canonical.attr.href}, die Seite liegt aber unter ${sollCanonical}.`);

const robots = tags(html, 'meta').filter((t) => /^(robots|googlebot)$/i.test(t.attr.name || ''));
if (robots.some((t) => /noindex/i.test(t.attr.content || '')))
  fehler.push('Die Seite ist auf »noindex« gesetzt und würde nie bei Google erscheinen.');

/* ---------- Buchungslink + Telefon (nur im Inhalt, Header und Buchungsleiste haben sie immer) ---------- */
const links = tags(inhalt, 'a');
if (!links.some((t) => /(^|\s)js-book(\s|$)/.test(t.attr.class || '') && t.attr.href))
  fehler.push('Im Inhalt fehlt ein Buchungsknopf. Mindestens ein Link braucht class="js-book" und die Buchungsadresse, z. B. <a class="btn btn--book js-book" href="https://www.battlekart.com/de/duesseldorf-ratingen/booking?confirmed=1">Jetzt buchen</a>.');

for (const t of links) {
  const href = (t.attr.href || '').trim();
  if (/^tel:/i.test(href) && href !== TELEFON_LINK)
    fehler.push(`Falscher Telefon-Link »${href}«. Richtig ist href="${TELEFON_LINK}".`);
}
const sichtbar = text(inhalt);
/* Unsere Nummer in jeder Schreibweise (0 2102 …, +49 (0)2102 …, 02102/44 55 00 …) muss genau "02102 445500" lauten */
const TR = '[\\s/\\-().\\u00a0]*';
const UNSERE = new RegExp(`(?:(?:\\+|00)\\s?49${TR}(?:\\(0\\))?${TR}|0${TR})` + '2102445500'.split('').join(TR), 'g');
for (const m of new Set(sichtbar.match(UNSERE) || [])) {
  if (m.replace(/\u00a0/g, ' ').trim() !== TELEFON_TEXT)
    fehler.push(`Die Telefonnummer steht als »${m.trim()}« da. Bitte genau so schreiben: ${TELEFON_TEXT}`);
}
/* Andere Telefonnummern (z. B. die fehlerhafte von battlekart.com) */
const FREMD = /(?<![\d,.])(?:(?:\+|00)\s?49[\s\u00a0]?(?:\(0\))?[\s\u00a0]?\d{2,5}|\(?0[1-9]\d{1,4}\)?)[\s\/\-\u00a0]{0,3}\d{3,}(?:[\s\-\u00a0]\d{2,}){0,3}/g;
for (const n of new Set(sichtbar.replace(UNSERE, ' ').match(FREMD) || [])) {
  const ziffern = n.replace(/\D/g, '').length;
  if (ziffern >= 9 && ziffern <= 15)
    fehler.push(`Unbekannte Telefonnummer »${n.trim()}«. BattleKart Ratingen hat nur ${TELEFON_TEXT}.`);
}

/* ---------- Altersangaben: es gibt kein Mindestalter, nur die Mindestgröße 1,45 m ---------- */
/* »Mindestalter«/»Altersgrenze« nur, wenn der Satz es nicht verneint oder fragt (»Ein Mindestalter gibt es nicht.« ist richtig) */
const ALTER_WORT = /mindest[\s-]?alter|alters(?:grenze|beschränkung|freigabe)/gi;
const ALTER = [
  /\bab\s+\d{1,2}\s*(?:jahren|jahre|jahr|j\.)/gi, /\b(?:\d{1,2}\s*)?jahre?\s+alt\b/gi, /\b(?:ab\s+)?\d{1,2}[\s-]*jährige?[nrs]?\b/gi,
  /\bim\s+alter\s+(?:von|ab)\s+\d/gi, /\bkinder\s+ab\s+\d{1,2}\b(?!\s*(?:jahr|j\.))/gi, /\bab\s+\d{1,2}\s*\+/gi,
];
const alterTreffer = new Set();
for (const satz of sichtbar.split(/(?<=[.!?])\s+/)) {
  const verneint = /\b(kein\w*|nicht|ohne)\b/i.test(satz) || satz.trim().endsWith('?');
  if (!verneint) for (const m of satz.matchAll(ALTER_WORT)) alterTreffer.add(m[0]);
  for (const re of ALTER) for (const m of satz.matchAll(re)) alterTreffer.add(m[0]);
}
for (const t of alterTreffer)
  fehler.push(`Altersangabe gefunden: »${t}«. Bei BattleKart gibt es kein Mindestalter, es zählt nur die Mindestgröße von 1,45 m.`);
for (const m of sichtbar.matchAll(/\b(1[,.]\d{2})\s?m\b|\b(1\d\d)\s?cm\b/g)) {
  if (m[1] ? m[1].replace('.', ',') !== '1,45' : m[2] !== '145')
    fehler.push(`Größenangabe »${m[0]}« passt nicht. Die Mindestgröße ist 1,45 m.`);
}

/* ---------- Bilder, Links, Assets ---------- */
const istExtern = (u) => /^(https?:)?\/\//i.test(u);
const istSonder = (u) => /^(#|mailto:|tel:|javascript:|data:|sms:|whatsapp:)/i.test(u) || u === '';
function lokaleDatei(u) {
  let ohne = u.split('#')[0].split('?')[0];
  try { ohne = decodeURI(ohne); } catch (e) {}
  const basis = ohne.startsWith('/') ? path.join(WURZEL, ohne) : path.resolve(ordner, ohne);
  const kandidaten = ohne.endsWith('/') ? [path.join(basis, 'index.html')] : [basis, path.join(basis, 'index.html'), basis + '.html'];
  return kandidaten.find((k) => fs.existsSync(k) && fs.statSync(k).isFile()) || null;
}
const srcsetUrls = (s) => (s || '').split(',').map((x) => x.trim().split(/\s+/)[0]).filter(Boolean);

/* Bilder im Inhalt: <img src/srcset>, <source srcset>, poster, CSS url(…) */
const bilder = [];
for (const t of tags(inhalt, 'img')) {
  bilder.push(...[t.attr.src, ...srcsetUrls(t.attr.srcset)].filter(Boolean));
  if (!t.attr.alt || !t.attr.alt.trim())
    hinweise.push(`Bild ohne alt-Text: ${t.attr.src || '(ohne src)'}. Beschreibe kurz, was zu sehen ist.`);
}
for (const t of tags(inhalt, 'source')) bilder.push(...srcsetUrls(t.attr.srcset));
for (const t of tags(inhalt, 'video')) if (t.attr.poster) bilder.push(t.attr.poster);
for (const m of inhalt.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) if (!/^data:/i.test(m[1])) bilder.push(m[1]);

for (const u of new Set(bilder)) {
  if (istExtern(u)) { fehler.push(`Externes Bild »${kurz(u, 80)}«. Bilder bitte ins Repo unter /img/ legen und lokal einbinden (Tempo, Datenschutz).`); continue; }
  if (istSonder(u)) continue;
  const d = lokaleDatei(u);
  if (!d) continue;   // fehlende Dateien meldet die Linkprüfung unten
  const kb = Math.round(fs.statSync(d).size / 1024);
  if (/\.(webp|avif|jpe?g|png|gif|svg)$/i.test(d) && kb * 1024 > MAX_BILD)
    fehler.push(`Bild »${u}« ist ${kb} KB groß, erlaubt sind höchstens 300 KB. Bitte verkleinern oder als WebP speichern.`);
}

/* Alle lokalen Verweise der ganzen Seite (auch Gerüst: CSS, Schriften, Logo) müssen existieren */
const verweise = new Set(bilder);
for (const [tag, attrs] of [['a', ['href']], ['link', ['href']], ['img', ['src']], ['script', ['src']], ['source', ['src']],
  ['video', ['src', 'poster']], ['audio', ['src']], ['iframe', ['src']], ['use', ['href', 'xlink:href']]]) {
  for (const t of tags(html, tag)) for (const k of attrs) if (t.attr[k]) verweise.add(t.attr[k]);
}
for (const t of [...tags(html, 'img'), ...tags(html, 'source')]) srcsetUrls(t.attr.srcset).forEach((u) => verweise.add(u));
for (const u of verweise) {
  if (istExtern(u) || istSonder(u) || /^[a-z][a-z0-9+.-]*:/i.test(u)) continue;
  if (!lokaleDatei(u)) fehler.push(`Verweis ins Leere: »${u}« gibt es im Repo nicht. Pfad prüfen oder Datei mitliefern.`);
}

/* ---------- Übrig gebliebene Platzhalter ---------- */
const platzhalter = [...new Set(roh.match(/\{\{[^}]{0,40}\}?\}?/g) || [])];
if (platzhalter.length) fehler.push(`Übrig gebliebene Platzhalter: ${platzhalter.join(', ')}. Bitte durch echten Text ersetzen.`);

/* ---------- Textmenge ---------- */
const woerter = sichtbar.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
if (woerter < 300) hinweise.push(`Der Inhalt hat nur ${woerter} Wörter. Für Google sind 300 oder mehr gut.`);

const ergebnis = { ok: fehler.length === 0, fehler, hinweise };
console.log(JSON.stringify(ergebnis, null, 2));
process.exit(ergebnis.ok ? 0 : 1);
