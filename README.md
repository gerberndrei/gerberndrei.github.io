# gerbern drei – Hinweise zur manuellen Bearbeitung

Live-Website: https://gerberndrei.github.io/

## Welche Datei ist wofür zuständig?

| Datei / Ordner | Verwendung | Normalerweise bearbeiten? |
| --- | --- | --- |
| `content.js` | Galerie-Bilder, Bildüberschriften, Übersetzungen, NETZWERK und rechtliche Texte, Termine | **Ja, für Inhalte** |
| `images/` | Fotos, Illustrationen und Bilder für die Slides | Ja, für Bildwechsel |
| `index.html` | Seitenstruktur, Menüpunkte, Titel, Einbindung der Dateien | Nur für strukturelle Änderungen |
| `style.css` | Typografie, Einrückungen, Abstände, Slides, Hoch-/Querformat | Ja, vorsichtig |
| `script.js` | Klicks, Touch, Wischen, Maps-Karten, Sprachwechsel, Scrollen | Nur für Interaktionen |
| `.nojekyll` | Konfigurationsdatei für GitHub Pages | **Nicht ändern** |

> Neue Bilder werden **automatisch aus den sechs `images/`-Ordnern übernommen**. Für Texte, PAST EVENTS, NETZWERK und rechtliche Angaben weiterhin `content.js` bearbeiten.

## Bilder in einer Galerie ändern

Die Bildlisten der sechs Galerien `start`, `about`, `aktuell`, `solothurn`, `kontakt` und `misc` werden von der GitHub Action **Sync numbered gallery images** automatisch gepflegt.

1. Bilder im passenden Ordner unter `images/` auf GitHub hinzufügen, umbenennen, ersetzen oder löschen und die Änderung committen.
2. Die Action startet durch den Upload/Commit automatisch und aktualisiert die `images`-Arrays in `content.js`. Sie sortiert numerisch nach den Präfixen `01_`, `02_`, … `12_` und übernimmt die echte Endung (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`).
3. Der Verweis auf `content.js` in `index.html` wird zur Vermeidung alter Browser-Caches aktualisiert. Danach wird der GitHub-Pages-Neuaufbau ausdrücklich angefordert. Dies kann einige Minuten dauern.

Die Dateien `01_foto_en.jpg`, `01_foto_dark.jpg`, `01_foto_phone.jpg` oder kombinierte Varianten gehören automatisch zum Grundbild `01_foto.jpg` und sind **keine zusätzlichen Slides**. Die genaue Endung einer normalen Bilddatei wird automatisch übernommen. Varianten verwenden am besten dieselbe Dateiendung wie das Grundbild. Wenn die englische Einzelvariante eine andere Endung hat, wird sie als `image_en` eingetragen.

**Höchstens 12 Slides** pro Galerie sind möglich. Bei mehr als zwölf Slides oder widersprüchlichen Basis-Dateiformaten stoppt die Action mit einer Fehlermeldung, damit kein Bild unbemerkt verschwindet. Doppelte Nummern werden gemeldet und vorerst in alphabetischer Reihenfolge angezeigt; am besten jeder Slide-Nummer genau ein Grundmotiv zuordnen.

Der Workflow ist in `.github/workflows/sync-gallery-images.yml`, das Node-Skript in `scripts/sync-gallery-images.mjs`. Unter **Actions → Sync numbered gallery images** kann der letzte Lauf kontrolliert oder bei Bedarf manuell gestartet werden (`Run workflow`). Die anderen Inhalte in `content.js` bleiben unverändert.

## NETZWERK pflegen

Am Ende von `content.js` steht das Array `network: [ ... ]`. Seit der Bereinigung steht **jede Information auf einer eigenen Zeile**:

```js
{
  label: "Miguel Guldimann, Solothurn",
  url: "https://www.zenmeditation.ch/",
  display: "www.zenmeditation.ch"
}
```

- `label` ist der sichtbare Name; `display` die angezeigte Webadresse.
- `url` ist das Linkziel.
- Optional sind `label_en`, `display_en`, `url_en` und gegebenenfalls `autoWrap`.
- Zum Ergänzen einen vollständigen Objektblock kopieren und zwischen den Objekten das Komma belassen.

## Weitere Inhalte

Unter `pastEvents` und `pastEvents_en` stehen die Termine in Textform, z. B. `2027` und danach `MÄRZ 04: Eröffnung`. **Leere Zeilen erzeugen sichtbare Abstände.** Die Leerzeile vor `2027` ist Absicht; `2027` und der erste Termin stehen direkt nacheinander.

`legal.imprint` und `legal.privacy` enthalten IMPRESSUM und DATENSCHUTZ; `imprint_en` / `privacy_en` die englischen Fassungen. Diese Texte bitte vor einer öffentlichen Freigabe selbst rechtlich prüfen.

Die **zweite und dritte KONTAKT-Slide** öffnen aktuell Google Maps (Adresse und Fussweg). Ihre Ziele findest du in `script.js` unter `contactMapLinks`. Andere Slides blättern beim Klick oder Tap weiter. Instagram- und E-Mail-Klickflächen der ersten KONTAKT-Slide werden ebenfalls in `script.js` verwaltet.

## Schrift, Abstände und Geräteansichten

`style.css` ist ein historisch gewachsenes Stylesheet mit verschiedenen **responsive Regeln**. Es wurde lesbar formatiert; die aktive Kaskaden-Reihenfolge blieb bewusst erhalten, damit die bestehende Darstellung nicht kaputtgeht. Deshalb stehen manche Selektoren mehrmals im Dokument. **Spätere Regeln und `!important` haben Vorrang.**

Beim Suchen auf diese Stichwörter achten:

- `--type-size`, `--type-leading` – Schriftgrösse und Zeilenhöhe.
- `.section-title` – Überschriften der Slides und Listen.
- `.window-group`, `.carousel`, `.dots` – Bildbreiten und Navigationspunkte.
- `#netzwerk`, `.network-links`, `.legal-links` – NETZWERK und Rechtstexte.
- `#past-events` – Termine, nur bei gerbern drei.
- `@media` – Formatwechsel, besonders `max-width:650px`, `orientation:portrait`, `orientation:landscape`, `pointer:coarse`.

**Wichtig:** Wenn du CSS änderst, die normale Desktopansicht, schmale Desktopfenster, Handy-Hochformat, Handy-Querformat und den Dunkelmodus kontrollieren. Unbedachtes Verschieben bestehender CSS-Blöcke kann ihr Verhalten verändern.

## Änderungen veröffentlichen

1. Datei im GitHub-Repository öffnen und auf das **Stift-Symbol** klicken.
2. Text oder Bildpfad ändern; danach über **Commit changes** speichern.
3. Die GitHub-Pages-Veröffentlichung unter **Actions** abwarten.
4. Falls der Browser weiterhin die alte CSS-/JavaScript-Version zeigt: In `index.html` die Versionskennung nach `?v=` für die betroffene Datei ändern (z. B. `style.css?v=meine-aenderung-2`) und neu laden.

In `index.html` steht derzeit ein `<meta name="robots" content="noindex">` mit einem Hinweis auf die Zeit vor dem öffentlichen Launch. Wenn Suchmaschinen die Seite künftig finden sollen, musst du diesen Eintrag **bewusst** entfernen oder ändern. Er wurde bei der Bereinigung **nicht** automatisch verändert.

## Checkliste nach eigenen Änderungen

- Funktionieren alle Menüpunkte sowie Deutsch/Englisch?
- Stimmen Bildformate, Slide-Punkte, Klick/Tap und Wischen?
- Öffnen die zwei KONTAKT-Karten die richtigen Google-Maps-Seiten?
- Bleiben NETZWERK, PAST EVENTS und Rechtstexte auf Desktop und Handy gut lesbar?
- Bleibt der geöffnete Bereich beim Ändern der Browserfenstergrösse stabil?

Frühere Versionen findest du jederzeit in der **Git-Commit-Historie**. Gelöschte alte Dateien sind dort ebenfalls weiterhin abrufbar.
