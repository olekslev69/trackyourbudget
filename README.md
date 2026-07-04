# Sparblick

[![CI](https://github.com/olekslev69/sparblick/actions/workflows/ci.yml/badge.svg)](https://github.com/olekslev69/sparblick/actions/workflows/ci.yml)

Ein kleiner, lokaler **Vertrags- und Budget-Tracker** als Desktop-App.
Trage dein Einkommen und deine monatlichen Zahlungen (Miete, Abos, Versicherungen,
Sport …) ein und behalte auf einen Blick, **wie viel Prozent deines Einkommens
in welche Kategorie** fließt.

Alle Daten bleiben **lokal auf deinem Gerät** – keine Cloud, keine Anmeldung.
Zum Sichern oder Übertragen gibt es Export/Import als JSON-Datei.

Die Oberfläche gibt es auf **Deutsch und Englisch** – umschaltbar oben rechts
(**DE / EN**); die Auswahl wird gemerkt.

## Funktionen

- **Übersicht (Dashboard):** Einkommen, Fixkosten, **Sparen** (echte Sparquote) und
  frei Verfügbares; Donut-Diagramm und Kategorie-Aufteilung mit Prozentanteil vom
  Einkommen. Per **Umschalter Monat / Jahr** lassen sich alle Beträge auf Monats- oder
  Jahresbasis anzeigen (Jahresübersicht = was alle Verträge pro Jahr kosten).
  Ein Bereich **„Demnächst fällig"** zeigt anstehende Zahlungen mit Datum und
  farbiger Dringlichkeit.
- **Einnahmen:** mehrere Einkommensquellen, auch pro Person.
- **Zahlungen & Verträge:** Betrag, Intervall (wöchentlich, monatlich, quartals­weise,
  halbjährlich, jährlich), Kategorie, optionales **Fälligkeitsdatum** und Notiz. Alle
  Beträge werden automatisch auf einen **Monatswert** umgerechnet; das nächste
  Fälligkeitsdatum rollt automatisch anhand des Intervalls in die Zukunft. Zahlungen
  lassen sich pausieren. Die Liste ist per **Suche, Kategorie und Sortierung filterbar**;
  eine Summenzeile zeigt Monats- und Jahreskosten der Auswahl.
- **Sparen & Anlegen:** regelmäßige Sparraten (z. B. ETF-Sparpläne, Tagesgeld,
  Altersvorsorge, Krypto) mit Betrag, Intervall, Art und Person. Fließt als echte
  Sparquote und „frei verfügbar" ins Dashboard ein.
- **Kategorien:** frei anpassbar mit eigener Farbe.
- **Personen / spätere getrennte Budgets:** Im Tab **Personen** lassen sich Personen
  anlegen, umbenennen und löschen (z. B. „Partnerin" durch den echten Namen ersetzen).
  Jede Einnahme und Zahlung kann einer Person zugeordnet werden. Über die **Ansicht**
  oben rechts lässt sich alles zusammen oder pro Person betrachten – die Grundlage für
  später vollständig getrennte Budgets. Beim Löschen einer Person werden ihre Einträge
  automatisch einer anderen Person zugewiesen (keine Daten gehen verloren).
- **Bank-Import (DKB & FYRST):** Unter **Daten** lässt sich eine **Umsatzliste (CSV)**
  einlesen – aktuell werden die Formate von **DKB** und **FYRST** erkannt. Die App erkennt
  automatisch **wiederkehrende Zahlungen** (Miete, Versicherungen inkl. Krankenkasse, Strom,
  Abos, Telefon, Auto/KFZ, Software …) und fasst alle **Lebensmitteleinkäufe** (inkl.
  Bäckereien) zu **einer pauschalen Zahlung** zusammen. Umbuchungen aufs eigene oder
  **Gemeinschaftskonto**, **Steuern**, Investitionen und Bargeld-Abhebungen werden
  **ignoriert**. Es wird nichts automatisch übernommen – jeder Vorschlag wird in einer
  **Vorschau per Häkchen bestätigt**; bereits vorhandene Zahlungen werden erkannt und nicht
  doppelt angelegt (sicher beim monatlichen Re-Import). Der Importer ist so aufgebaut, dass
  sich **weitere Banken** leicht ergänzen lassen (siehe [CONTRIBUTING.md](CONTRIBUTING.md)).
- **Daten:** vollständiges Backup als **JSON** (Export/Import) mit allen Einnahmen,
  Zahlungen, Sparraten, Kategorien und Personen. Beim Import wählbar: bestehende Daten
  **ersetzen** oder mit den importierten **zusammenführen** (ohne Duplikate) – ideal, um
  Handy und PC abzugleichen. Zurücksetzen.

> Gemeinsame Alltagsausgaben (z. B. Lebensmittel) trägst du am einfachsten als eine
> pauschale Zahlung in der Kategorie „Lebensmittel (pauschal)" ein.

## Schnell im Browser ausprobieren (ohne Installation)

Kein Tauri nötig, um die App zu testen:

```bash
npm run serve
# dann http://localhost:5173 im Browser öffnen
```

Die Daten werden dabei im `localStorage` des Browsers gespeichert.

## Am Handy nutzen (PWA)

Sparblick ist eine **Progressive Web App**: Am Handy im Browser öffnen und über das
Menü **„Zum Startbildschirm hinzufügen"** installieren – danach startet sie im Vollbild
wie eine echte App und funktioniert **offline**.

Dafür braucht das Handy eine **HTTPS-Adresse**. Dieses Repo veröffentlicht das Frontend
automatisch über **GitHub Pages** unter:

```
https://olekslev69.github.io/sparblick/
```

Einmalige Einrichtung: in GitHub unter **Settings → Pages → Source: „GitHub Actions"**
aktivieren; danach deployt der Workflow `.github/workflows/pages.yml` bei jedem Push auf
`main`.

> **Datenschutz:** Veröffentlicht wird nur die App selbst (der Code) – **keine Daten**.
> Deine Einnahmen, Zahlungen und Sparraten bleiben ausschließlich lokal auf dem jeweiligen
> Gerät. Auf einem neuen Gerät trägst du die Daten neu ein oder überträgst sie einmalig
> per JSON-Export/Import.

## Gemeinsam nutzen (Dropbox)

Sparblick hat (bewusst) keinen eigenen Server und keine automatische Synchronisierung.
Für ein **gemeinsames Familien-Budget** lässt sich aber eine einzelne JSON-Datei in einem
**geteilten Dropbox-Ordner** (oder Drive/iCloud) manuell teilen:

1. **Einrichten:** Eine Person macht **Daten → Export (JSON)** und legt die Datei als
   `sparblick.json` in einen geteilten Ordner. Alle erhalten Zugriff.
2. **Vor dem Eintragen (jedes Mal):** Datei öffnen → **Daten → Import (JSON) →
   „Zusammenführen"** (holt den aktuellen Familienstand).
3. **Eintragen / ändern.**
4. **Danach:** **Daten → Export (JSON)** → die Datei im Ordner überschreiben (gleicher Name).

**Goldene Regel:** immer **erst importieren (zusammenführen), dann exportieren** – und
möglichst nicht gleichzeitig mit jemandem bearbeiten („einer nach dem anderen"). Lege ab
und zu eine datierte Sicherungskopie an (z. B. `sparblick-2026-07.json`).

> **Grenze:** Eine einzelne geteilte Datei ist „letzter gewinnt". Neue Einträge sammeln
> sich beim Zusammenführen sicher, aber wenn zwei Personen **gleichzeitig denselben**
> Eintrag ändern oder löschen, kann eine Änderung überschrieben werden. Für echten
> automatischen Mehrgeräte-Sync (inkl. Änderungen/Löschungen) wäre eine spätere
> Ausbaustufe nötig.

## Als Desktop-App bauen (Tauri)

Die App ist ein [Tauri](https://tauri.app)-Projekt (Rust + Webview). Der
installierbare Desktop-Build wird auf deinem eigenen Rechner erzeugt.

### Voraussetzungen

- [Node.js](https://nodejs.org/) (18+)
- [Rust](https://www.rust-lang.org/tools/install)
- Systemabhängigkeiten von Tauri – siehe
  [tauri.app/start/prerequisites](https://tauri.app/start/prerequisites/):
  - **Windows:** Microsoft C++ Build Tools + WebView2 (auf Win 11 vorinstalliert)
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** u. a. `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`,
    `libayatana-appindicator3-dev`, `librsvg2-dev`

### Entwickeln & Bauen

```bash
npm install        # einmalig
npm run dev        # App im Entwicklungsmodus starten (eigenes Fenster)
npm run build      # installierbares Programm bauen
```

Das fertige Programm liegt anschließend unter
`src-tauri/target/release/` bzw. im Bundle-Ordner
`src-tauri/target/release/bundle/` (z. B. `.msi`, `.dmg`, `.AppImage`, `.deb`).

### Icon neu erzeugen (optional)

Das App-Icon liegt als `app-icon.png` (1024×1024) im Projekt und wurde per
`gen_icon.py` (reines Python, ohne Abhängigkeiten) erzeugt. Alle Icon-Formate für
die Plattformen entstehen daraus mit:

```bash
npm run icons      # entspricht: tauri icon app-icon.png
```

## Projektstruktur

```
src/                    Frontend (statisches HTML/CSS/JS, ohne Build-Schritt)
  index.html
  styles.css
  app.js                gesamte App-Logik + Übersetzungen + lokale Speicherung
  manifest.webmanifest  PWA-Manifest
  sw.js                 Service Worker (Offline-Cache)
  icons/                PWA-Icons (192/512/maskable)
scripts/serve.js        winziger Static-Server für den Browsertest
src-tauri/              Tauri-/Rust-Teil (Desktop-Fenster, Datei-Dialoge)
.github/workflows/      CI, Release (Desktop-Builds) und Pages (PWA-Deploy)
app-icon.png            Quell-Icon
gen_icon.py             erzeugt Quell- und Web-Icons
```

## Technik & Datenhaltung

- Das Frontend nutzt **kein Framework und keine externen Abhängigkeiten** – reines
  HTML/CSS/JS. Dadurch läuft es unverändert sowohl im Browser als auch im Tauri-Fenster.
- Persistenz über `localStorage` (Schlüssel `tyb_data_v1`). Im Desktop-Build bleiben
  die Daten zwischen den Programmstarts erhalten.
- **Export/Import:** Im Desktop-Fenster werden native Datei-Dialoge verwendet
  (Tauri `dialog`/`fs`-Plugin); im Browser der übliche Download bzw. die Dateiauswahl.
  Der JSON-Export ist das vollständige Backup; beim Import kann ersetzt oder
  zusammengeführt werden.

## Mitwirken

Beiträge sind willkommen – Setup, Branch- und Commit-Konventionen sowie der
Ablauf für Pull Requests stehen in [CONTRIBUTING.md](CONTRIBUTING.md).

- **CI:** Bei jedem Push/PR prüft `.github/workflows/ci.yml` die JavaScript-Syntax,
  die JSON-Konfigurationen und die Rust-Formatierung.
- **Release:** `.github/workflows/release.yml` baut die Desktop-App für macOS,
  Windows und Linux – ausgelöst durch einen Tag `v*` oder manuell.

## Datenschutz

Es werden keinerlei Daten übertragen. Alles bleibt auf dem Gerät. Für ein Backup
oder die Übertragung auf einen anderen Rechner nutze den JSON-Export.
