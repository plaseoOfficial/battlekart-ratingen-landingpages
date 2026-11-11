# BattleKart Düsseldorf-Ratingen – Google-Ads-Landingpage

Entwurf, nicht für die Google-Suche gedacht (`noindex`). Ziel der Seite: Buchung.

- `index.html` – Seite inkl. Preisrechner. Anzeigen-Varianten über `?anlass=jga | geburtstag | firma | weihnachtsfeier | freunde`.
- `ga-gutschein/index.html` – Gutschein-Seite für die Gutschein-Kampagne (noindex), Ziel: Gutschein kaufen. Überschrift je Anzeigengruppe über `?gruppe=kart | gamer | erlebnis | lastminute`. Conversion-Label `gutschein` in `BK_ADS` noch leer.
- `impressum.html`, `datenschutz.html` – Vorlagen, Stellen mit [ANPASSEN] vor dem Livegang füllen.
- `fonts/`, `img/` – Schriften und Bilder lokal (kein Abruf bei Google Fonts).
- Tracking: Google Tag Manager lädt erst mit eingetragener ID (`window.BK_GTM_ID`) und nach Einwilligung (Consent Mode v2).

Stand: 15.10.2026
