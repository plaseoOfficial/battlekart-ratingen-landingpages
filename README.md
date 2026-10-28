# BattleKart Düsseldorf-Ratingen – Google-Ads-Landingpage

Entwurf, nicht für die Google-Suche gedacht (`noindex`). Ziel der Seite: Buchung.

- `index.html` – Seite inkl. Preisrechner. Anzeigen-Varianten über `?anlass=jga | geburtstag | firma | weihnachtsfeier | freunde`.
- `impressum.html`, `datenschutz.html` – Vorlagen, Stellen mit [ANPASSEN] vor dem Livegang füllen.
- `fonts/`, `img/` – Schriften und Bilder lokal (kein Abruf bei Google Fonts).
- Tracking: Google Tag Manager lädt erst mit eingetragener ID (`window.BK_GTM_ID`) und nach Einwilligung (Consent Mode v2).

Stand: 15.10.2026

## Unterseiten

SEO-Unterseiten liegen als `/<slug>/index.html` und werden aus Tamys HTML gebaut: `node werkzeuge/bauen.mjs --slug gutschein --quelle tamy.html` nimmt nur den Inhalt (`<main>`, sonst `<body>`, ohne Skripte, Header und Footer) und setzt ihn in `_geruest/seite.html` ein (Kopf, Tracking, Einwilligung, Header, Footer; CSS in `css/seite.css`). Danach `node werkzeuge/pruefen.mjs gutschein/index.html` und erst bei `"ok": true` committen. `sitemap.xml` und `robots.txt` schreibt bauen.mjs jedes Mal neu; `index.html` (Ads-Landingpage, `noindex`) bleibt unberührt.
