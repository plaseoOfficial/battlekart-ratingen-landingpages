# Landingpages bauen, ohne zu programmieren

Hier entstehen die Seiten, auf die unsere Google-Anzeigen führen. Du schreibst in normalen Sätzen,
was du willst. Claude baut es und zeigt dir das Ergebnis.

**Ansehen ohne Installation:** https://battlekart-ratingen-landingpages.vercel.app
Dort steht immer der Stand, den Ben zuletzt veröffentlicht hat.

## So fängst du an

1. Öffne T3 Code (oder Claude Code) im Projekt `mindoortainment`.
2. Schreib: **„Zeig mir die Landingpage Kartfahren.“** Claude startet die Vorschau und öffnet die Seite.
3. Sag, was anders sein soll. Ein Wunsch pro Nachricht klappt am besten.

## Sätze, die funktionieren

| Du willst | Du schreibst |
|---|---|
| Text ändern | „Mach die Hauptüberschrift kürzer und nenn Düsseldorf darin.“ |
| Foto einsetzen | „Ich habe `strecke.jpg` in den Ordner fotos gelegt. Setz es oben statt des Platzhalters ein.“ |
| Abschnitt verschieben | „Schieb die Fragen über die Anfahrt.“ |
| Abschnitt löschen | „Nimm den Abschnitt Junggesellenabschied raus.“ |
| Neue Seite | „/neue-landingpage“ und dann beschreiben, für welche Anzeige sie ist |
| Prüfen | „Prüf die Seite.“ |
| Handy-Ansicht | „Zeig mir die Seite, wie sie auf dem Handy aussieht.“ |
| Rückgängig | „Mach die letzte Änderung rückgängig.“ |

## Was die Prüfung bedeutet

- ❌ **Fehler:** muss weg, bevor die Seite zu Ben geht (z. B. „Mario Kart“ im Text, Geburtstag ohne „ab 12“).
- ⚠️ **Hinweis:** anschauen, oft in Ordnung.
- ⏳ **Noch offen:** Angaben, die wir vom Kunden brauchen, z. B. `[PREIS]` oder fehlende Fotos.

## Drei Regeln

1. **Keine erfundenen Fakten.** Preise, Zeiten und Rufnummer nur, wenn sie bestätigt sind.
   Sonst bleibt der Platzhalter stehen.
2. **Nur echte Fotos** vom Standort. Keine KI-Bilder.
3. **Nichts geht online ohne Ben.** Speichern ist nicht Veröffentlichen. Das macht nur Ben.

## Was wo liegt

| Ordner | Inhalt |
|---|---|
| `kartfahren/` | Erste Landingpage: Kartfahren in Ratingen, für die Anzeigengruppen rund um Kartbahn |
| `_vorlage/` | Leere Vorlage für neue Seiten |
| `gemeinsam/` | Design und Logo für alle Seiten |
| `fotos/` | Hier legst du Fotos ab |
