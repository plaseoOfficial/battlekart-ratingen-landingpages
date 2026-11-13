# BattleKart Düsseldorf-Ratingen – Google-Ads-Landingpage

Entwurf, nicht für die Google-Suche gedacht (`noindex`). Ziel der Seite: Buchung.

- `ga/kart/index.html` – Kart-Seite inkl. Preisrechner (bis 11.11.2026 `index.html`). Anzeigen-Varianten über `?anlass=jga | geburtstag | firma | weihnachtsfeier | freunde`.
- `ga/gutscheine/index.html` – Gutschein-Seite für die Gutschein-Kampagne (noindex), Ziel: Gutschein kaufen. Überschrift je Anzeigengruppe über `?gruppe=kart | gamer | erlebnis | lastminute`. Conversion-Label `gutschein` in `BK_ADS` noch leer.
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
