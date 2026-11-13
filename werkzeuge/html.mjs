/* =========================================================
   Gemeinsame Helfer für bauen.mjs und pruefen.mjs
   Nur Node-Bordmittel, kein npm install nötig. Kein echter HTML-Parser:
   reicht für Tamys Seiten und unser Gerüst, nicht für beliebiges HTML.
   ========================================================= */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DOMAIN = 'https://battlekart-ratingen.de';
export const GERUEST = path.join(WURZEL, '_geruest', 'seite.html');
/* Verzeichnisse, die keine Seiten sind (für Slug-Prüfung und Sitemap) */
export const KEINE_SEITEN = new Set(['_geruest', 'werkzeuge', 'css', 'img', 'fonts', 'node_modules', '.git', '.vercel']);

export function ohneKommentare(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

/* Ganze Elemente <tag …>…</tag> entfernen, verschachtelte gleiche Tags werden mitgezählt. Gibt [html, anzahl] zurück. */
export function entferneElemente(html, tag) {
  const re = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, 'gi');
  let aus = '', pos = 0, tiefe = 0, start = -1, anzahl = 0, m;
  while ((m = re.exec(html))) {
    if (!m[1]) {
      if (tiefe === 0) { aus += html.slice(pos, m.index); start = m.index; }
      tiefe++;
    } else if (tiefe > 0) {
      tiefe--;
      if (tiefe === 0) { pos = m.index + m[0].length; anzahl++; }
    }
  }
  if (tiefe > 0) { anzahl++; pos = html.length; }   // nicht geschlossen: Rest fällt weg
  else if (start === -1) return [html, 0];
  return [aus + html.slice(pos), anzahl];
}

/* Inneres des ersten <tag …> bis zum letzten </tag>, sonst null */
export function inneres(html, tag) {
  const auf = new RegExp(`<${tag}(?=[\\s>])[^>]*>`, 'i').exec(html);
  if (!auf) return null;
  const zu = html.toLowerCase().lastIndexOf(`</${tag}>`);
  const anfang = auf.index + auf[0].length;
  return html.slice(anfang, zu >= anfang ? zu : html.length);
}

export function entitaetenLoesen(s) {
  const benannt = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', ndash: '–', mdash: '—',
    auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', euro: '€', hellip: '…',
    bdquo: '„', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', middot: '·' };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (t, n) => {
    if (n[0] === '#') {
      const c = n[1] === 'x' || n[1] === 'X' ? parseInt(n.slice(2), 16) : parseInt(n.slice(1), 10);
      return Number.isFinite(c) ? String.fromCodePoint(c) : t;
    }
    return Object.prototype.hasOwnProperty.call(benannt, n) ? benannt[n] : t;
  });
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Attribute eines Start-Tags als Objekt (Namen klein geschrieben) */
export function attribute(tag) {
  const a = {};
  const re = /([^\s=/<>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  const rumpf = tag.replace(/^<\s*[^\s>/]+/, '').replace(/\/?>$/, '');
  let m;
  while ((m = re.exec(rumpf))) a[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return a;
}

/* Alle Start-Tags eines Typs mit Attributen */
export function tags(html, tag) {
  const re = new RegExp(`<${tag}(?=[\\s>/])[^>]*>`, 'gi');
  return [...html.matchAll(re)].map((m) => ({ roh: m[0], attr: attribute(m[0]) }));
}

export function titelAus(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? entitaetenLoesen(m[1]).replace(/\s+/g, ' ').trim() : '';
}

export function metaAus(html, name) {
  const t = tags(html, 'meta').find((x) => (x.attr.name || '').toLowerCase() === name);
  return t ? entitaetenLoesen(t.attr.content || '').replace(/\s+/g, ' ').trim() : '';
}

/* Sichtbarer Text (ohne Skripte, Styles, SVG) */
export function text(html) {
  let s = ohneKommentare(html);
  for (const t of ['script', 'style', 'svg', 'noscript', 'template']) s = entferneElemente(s, t)[0];
  return entitaetenLoesen(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}
