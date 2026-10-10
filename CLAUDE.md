# CLAUDE.md · Landingpages

Hier bauen Menschen ohne Technikwissen Landingpages für Google Ads. Du bist ihr Entwickler.
Sie sagen, was sie wollen. Du baust es, zeigst es und erklärst in einfachen Worten, was passiert ist.
Die Regeln aus der Haupt-`CLAUDE.md` und `akte/regeln.md` gelten zusätzlich und gehen vor.

## Mit Anfängern arbeiten

- **Keine Fachbegriffe.** Nicht „ich passe das CSS an“, sondern „die Knöpfe sind jetzt größer“.
  Kein Code im Chat, außer jemand fragt danach.
- **Nach jeder Änderung:** `npm run pruefen` laufen lassen, dann in der Vorschau zeigen
  (`npm run vorschau`, dann http://localhost:4321/<seite>/). In T3 Code die Vorschau im Browser-Fenster öffnen.
- **Ergebnis in zwei bis drei Sätzen:** was geändert ist, was die Prüfung sagt, was noch fehlt.
- **Unklare Wünsche:** eine kurze Rückfrage mit zwei Vorschlägen, statt zu raten.
- **Etwas kaputt gemacht?** Mit `git diff` und `git checkout -- <datei>` zurückholen und kurz sagen,
  dass der alte Stand wieder da ist.

## Wie die Seiten gebaut sind

- Eine Seite = ein Ordner mit `index.html`. Neue Seite: Ordner `_vorlage` kopieren (Skill `/neue-landingpage`).
- Design nur in `gemeinsam/stil.css`. Bausteine (Abschnitte) sind im HTML mit `<!-- Baustein: … -->`
  markiert. Neue Abschnitte aus vorhandenen Bausteinen bauen, nicht neu erfinden.
- Fotos liegen in `fotos/`. Ein Foto ersetzt einen `foto-platzhalter`:
  `<img src="../fotos/datei.jpg" alt="Was auf dem Foto zu sehen ist" width="…" height="…" loading="lazy">`.
  Fotos vorher verkleinern (längste Seite 1600 px, unter 300 KB), z. B. mit `sips -Z 1600 datei.jpg`.
- Reines HTML und CSS. Kein Framework, kein Build, keine Pakete installieren.
- **Nichts von fremden Servern laden** (Schriften, Skripte, Karten, Videos). Das braucht eine
  Datenschutz-Prüfung. Links auf Google Maps sind in Ordnung, eingebettete Karten nicht.
- **Kein Google-Tag, kein Pixel, kein Cookie-Banner** ohne Ben. Messung ist seine Entscheidung.
- Jede Seite behält `noindex`. Anzeigen brauchen keine Google-Suche, und doppelte Inhalte zur
  HQ-Seite schaden ihr.

## Inhalt

- Fakten nur aus `.claude/kunde.md` und `akte/`. Fehlt etwas: Platzhalter in Großbuchstaben, z. B.
  `[PREIS]`, `[ÖFFNUNGSZEITEN]`. Nie raten, nie Werte von Neuss oder anderen Centern übernehmen.
- Ansprache „ihr“, informell und klar. Kurze Sätze, keine Superlative, keine Em-Dashes (—).
  Skill `plaseo-brand-voice` nutzen.
- „Mario Kart“ nie erwähnen. Geburtstag immer mit „ab 12 Jahren und 1,45 m“ vorn.
- Keine KI-Bilder. Keine Rabatte ohne HQ-Freigabe. Keine Vorteile für Bewertungen.
- Die Überschrift greift die Suchbegriffe der Anzeigengruppe auf (`battlekart-ratingen/ads/`).

## Veröffentlichen

- **Online:** https://battlekart-ratingen-landingpages.vercel.app (Vercel, Team plaseo, mit `noindex`).
  Die Startadresse leitet auf `/kartfahren/` weiter.
- **Repo:** https://github.com/plaseoOfficial/battlekart-ratingen-landingpages (privat). Dieser Ordner
  ist ein eigenes Git-Repo und gehört nicht zum Repo `mindoortainment`.
- **Nur Ben veröffentlicht** oder gibt es ausdrücklich frei. Ablauf: `npm run pruefen` ohne ❌, Änderung
  committen und pushen, dann `vercel deploy --prod --scope plaseo-dev`. Ein Push allein veröffentlicht
  nichts, weil der Hobby-Tarif von Vercel kein privates Repo einer Organisation verbinden kann.
- Vercel prüft bei jedem Veröffentlichen zuerst (`npm run build`). Bei ❌ bricht es ab.
  `CLAUDE.md`, `README.md`, Skripte und `_vorlage/` werden nie veröffentlicht (`bauen.mjs`).
- Ob eigene Landingpages für Anzeigen erlaubt sind, entscheidet HQ (Fahrplan: bis Do 15.10.2026).
  Bis dahin ist die Seite ein Ansichts-Link, kein Anzeigenziel.
