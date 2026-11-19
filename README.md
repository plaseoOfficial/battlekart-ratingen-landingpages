# BattleKart Düsseldorf-Ratingen – Google-Ads-Landingpage

Entwurf, nicht für die Google-Suche gedacht (`noindex`). Ziel der Seite: Buchung.

- `ga/kart/index.html` – Kart-Seite inkl. Preisrechner (bis 11.11.2026 `index.html`). Anzeigen-Varianten über `?anlass=jga | geburtstag | firma | weihnachtsfeier | freunde`.
- `ga/gutscheine/index.html` – Gutschein-Seite für die Gutschein-Kampagne (noindex), Ziel: Gutschein kaufen. Überschrift je Anzeigengruppe über `?gruppe=kart | gamer | erlebnis | lastminute`. Klick auf »Gutschein kaufen« meldet die Conversion »LP Klick Gutschein kaufen« (Label `gutschein` in `BK_ADS`, seit 16.11.2026).
- `impressum.html`, `datenschutz.html` – Vorlagen, Stellen mit [ANPASSEN] vor dem Livegang füllen.
- `fonts/`, `img/` – Schriften und Bilder lokal (kein Abruf bei Google Fonts).
- Tracking: Google Tag Manager lädt erst mit eingetragener ID (`window.BK_GTM_ID`) und nach Einwilligung (Consent Mode v2).

Stand: 15.10.2026

## Unterseiten

SEO-Unterseiten liegen als `/<slug>/index.html` und werden aus Tamys HTML gebaut: `node werkzeuge/bauen.mjs --slug gutschein --quelle tamy.html` nimmt nur den Inhalt (`<main>`, sonst `<body>`, ohne Skripte, Header und Footer) und setzt ihn in `_geruest/seite.html` ein (Kopf, Tracking, Einwilligung, Header, Footer; CSS in `css/seite.css`). Danach `node werkzeuge/pruefen.mjs gutschein/index.html` und erst bei `"ok": true` committen. `sitemap.xml` und `robots.txt` schreibt bauen.mjs jedes Mal neu; `index.html` (Ads-Landingpage, `noindex`) bleibt unberührt.
Alle Ads-Seiten liegen unter `/ga/` (Bens Vorgabe 11.11.2026), damit `/` frei wird für die Startseite.
Übergang: `vercel.json` zeigt `/` per Rewrite (keine Weiterleitung, Adresse bleibt) auf `/ga/kart/`, damit die laufenden
Anzeigen mit Zieladresse `battlekart-ratingen.de/?anlass=…` weiterlaufen. Erst die Zieladressen in Google Ads auf
`/ga/kart/?anlass=…` umstellen, dann den Rewrite durch die Startseite ersetzen.
Bilder und Schriften immer mit absolutem Pfad (`/img/…`, `/fonts/…`).

Stand: 11.11.2026

## Anlass-Seiten (seit 19.11.2026)

Strategie: `battlekart-ratingen.de` rankt nicht gegen `battlekart.com/de/duesseldorf-ratingen`. Hier stehen nur einzelne
Seiten für Anlässe und Geschenke, jede führt zum Buchen oder Gutscheinkauf auf battlekart.com. Keine Seite zielt auf
»Kartbahn Düsseldorf«, »BattleKart Düsseldorf« oder Kart-Preise. Preise und Öffnungszeiten werden verlinkt, nicht
abgeschrieben.

**Keine eigene Startseite (Ben, 19.11.2026).** Alles, was eine Startseite wäre, geht zu battlekart.com:
- `/` leitet auf `https://www.battlekart.com/de/duesseldorf-ratingen` um (`vercel.json`, vorläufige Weiterleitung).
  Ausnahme: Kommt der Aufruf mit `anlass`, `gclid`, `gbraid`, `wbraid` oder `utm_source`, wird weiter die Ads-Seite
  `/ga/kart/` ausgeliefert, damit Anzeigen mit der alten Zieladresse `/?anlass=…` weiterlaufen. Sobald alle Anzeigen
  auf `/ga/kart/` zeigen, kann die Ausnahme weg.
- Logo und Kopfzeile führen zu battlekart.com. Die Kopfzeile hat dieselben Punkte wie dort: Gut zu wissen, Spielmodi,
  Veranstaltungen, Geschenkkarten, F.A.Q., Kontakt (`css/nav.css`, Links im Gerüst und in `gutschein/index.html`).
- Untereinander verlinkt sind die eigenen Seiten im Fuß und im Abschnitt »Auch für«.
- Die Ads-Seiten unter `/ga/` haben kein Menü.

| Adresse | Quelle | Bauen |
|---|---|---|
| `/jga/` | `_inhalt/jga.html` | `node werkzeuge/bauen.mjs --slug jga --quelle _inhalt/jga.html` |
| `/teamevent/` | `_inhalt/teamevent.html` | `node werkzeuge/bauen.mjs --slug teamevent --quelle _inhalt/teamevent.html` |
| `/geburtstag/` | `_inhalt/geburtstag.html` | `node werkzeuge/bauen.mjs --slug geburtstag --quelle _inhalt/geburtstag.html` |
| `/gutschein/` | `gutschein/index.html` (eigenständige Seite mit Rechner, von Hand gepflegt) | – |

- Texte ändern: Datei in `_inhalt/` bearbeiten, bauen, `node werkzeuge/pruefen.mjs <slug>/index.html`.
- Strukturdaten: `<script type="application/ld+json">` in der Quelle bleibt beim Bauen erhalten (Fragen der Seite).

Stand: 19.11.2026
