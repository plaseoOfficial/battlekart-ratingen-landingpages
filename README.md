# BattleKart Düsseldorf-Ratingen – Google-Ads-Landingpage

Entwurf, nicht für die Google-Suche gedacht (`noindex`). Ziel der Seite: Buchung.

- `ga/kart/index.html` – Kart-Seite inkl. Preisrechner (bis 11.11.2026 `index.html`). Anzeigen-Varianten über `?anlass=jga | geburtstag | firma | weihnachtsfeier | freunde`.
- `ga/gutscheine/index.html` – Gutschein-Seite für die Gutschein-Kampagne (noindex), Ziel: Gutschein kaufen. Überschrift je Anzeigengruppe über `?gruppe=kart | gamer | erlebnis | lastminute`. Conversion-Label `gutschein` in `BK_ADS` noch leer.
- `gutschein/index.html` – SEO-Seite Gutschein (indexiert, Karte »Gutschein« MO-12). Gleicher Inhalt wie `/ga/gutscheine/`, Gliederung laut Karte. `robots.txt` und `sitemap.xml` gehören dazu.
- `impressum.html`, `datenschutz.html` – Vorlagen, Stellen mit [ANPASSEN] vor dem Livegang füllen.
- `fonts/`, `img/` – Schriften und Bilder lokal (kein Abruf bei Google Fonts).
- Tracking: Google Tag Manager lädt erst mit eingetragener ID (`window.BK_GTM_ID`) und nach Einwilligung (Consent Mode v2).

Alle Ads-Seiten liegen unter `/ga/` (Bens Vorgabe 11.11.2026), damit `/` frei wird für die Startseite.
Übergang: `vercel.json` zeigt `/` per Rewrite (keine Weiterleitung, Adresse bleibt) auf `/ga/kart/`, damit die laufenden
Anzeigen mit Zieladresse `battlekart-ratingen.de/?anlass=…` weiterlaufen. Erst die Zieladressen in Google Ads auf
`/ga/kart/?anlass=…` umstellen, dann den Rewrite durch die Startseite ersetzen.
Bilder und Schriften immer mit absolutem Pfad (`/img/…`, `/fonts/…`).

Stand: 11.11.2026
