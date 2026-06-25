# Band With Me — Visual Rules & Design Ideas

## Design Intent

Band With Me soll sich **warm, modern, musikalisch und sympathisch** anfühlen — nicht wie Vereinssoftware, nicht wie ein nüchternes Projektmanagement-Tool.

Die visuelle Richtung ist:
- hochwertig, aber nicht steril
- spielerisch, aber nicht kindlich
- klar strukturiert, aber nicht bürokratisch
- mobil leichtgewichtig, auf Desktop räumlich und ruhig

## Product Feel in 5 Words

- lebendig
- klar
- warm
- musikalisch
- zugänglich

## Core UX Rules

1. **Eine Hauptaktion pro Bereich**
   - Jeder Screen braucht eine klar dominierende nächste Aktion.
2. **Termine müssen sofort scanbar sein**
   - Datum, Typ und Zusagezustand dürfen nie versteckt sein.
3. **Menschen sichtbar machen**
   - Zusagen sollen über Avatare/Badges schnell erfassbar werden.
4. **Wichtige Unterschiede visuell codieren**
   - Probe ≠ Auftritt. Beide brauchen sofort erkennbare Signale.
5. **Wenig Text, starke Hierarchie**
   - Die UI soll nicht über Erklärtexte funktionieren.
6. **Subtile Bewegung, keine Showeffekte**
   - Animation unterstützt Fokus, Status und Übergänge.
7. **Desktop ist ein eigener Qualitätsmodus**
   - Mehr Überblick, nicht nur größere Karten.

## Visual System Direction

### Palette idea

Die App bekommt ein neutrales Fundament und wenige starke Akzente.

#### Suggested neutrals
- **Light background:** `#F7F5F1`
- **Light surface:** `#FFFFFF`
- **Light muted surface:** `#EEE9E1`
- **Dark background:** `#111111`
- **Dark surface:** `#1B1B1C`
- **Dark muted surface:** `#262628`
- **Primary text light:** `#171717`
- **Primary text dark:** `#F5F4F1`
- **Secondary text light:** `#6F6A63`
- **Secondary text dark:** `#B8B2AA`

#### Suggested accents
- **Warm brown / cocoa:** `#7A4B2A`
- **Bright stage gold:** `#F4C430`
- **Electric lime accent:** `#C9FF3B`
- **Soft rose highlight (optional):** `#E58DB2`

### Usage rules
- Braun trägt Identität und Wärme.
- Gelb markiert Bühne, Status, Hervorhebung.
- Limette nur sparsam für aktive Zustände / CTA-Momente / Voting-Energie.
- Große Flächen bleiben ruhig und neutral.

## Event-Type Differentiation

### Probe
- ruhiger, funktionaler
- Badge/Farbton eher neutral + warm
- Fokus auf Anwesenheit, Wiederholung, aktueller Probefokus

### Auftritt
- energiereicher, leicht „bühnenhafter"
- mehr Kontrast, Gold-/Akzent-Nutzung
- Fokus auf Setlist, Ort, Dresscode, Besonderheiten

## Typography Direction

- Headlines: weich, modern, leicht charaktervoll
- Body: nüchtern, gut lesbar
- Meta-/Tech-Info: monospace oder kompakter Secondary Style sparsam einsetzen

### Rules
- Große Headlines nur auf Überblicks- oder Empty-State-Flächen
- Normale Produktflächen leben von mittleren Größen, nicht von riesiger Typografie
- Zahlen, Zeiten und Status müssen sehr gut scanbar sein

## Shape Language

- großzügige, weiche Radien
- Buttons und Karten eher „soft-rectangular" statt pill-only
- Avatare rund, Karten leicht gerundet, Panels stärker gerundet

### Suggested radii
- small: 10
- medium: 16
- large: 24
- hero / feature panel: 28+

## Spacing Rules

- Viel Luft zwischen Bereichen
- wenig Luft innerhalb eng zusammengehöriger Datenpunkte
- Karten nie überfüllen

### Suggested rhythm
- 4 / 8 / 12 / 16 / 24 / 32 als primäre Rhythmuswerte

## Component Rules

### Buttons
- Primärbutton stark kontrastierend
- Sekundärbutton tonal auf Surface
- min. 44px Hit Area
- Hover/Press sichtbar, aber subtil

### Cards
- Eine Karte = eine zusammenhängende Entscheidungseinheit
- Karten nicht für alles verwenden; Listen dürfen auch leichter wirken
- Termine sollten in Karten oder card-like rows funktionieren

### Avatars
- freundlich, ausdrucksstark, aber einfach
- im ersten Schritt: Bild oder farbige Initial-/Icon-Avatare
- später ausbaubar Richtung spielerischer Band-Charaktere

### Tabs / Navigation
- Bottom Tabs mobil
- auf Desktop darf die App mit mehr Header-/Sidebar-Logik experimentieren
- Navigation muss kurze, verständliche Labels haben

## Motion Rules

Erlaubt:
- sanfte Fade/Slide-Transitions
- Micro-bounce bei CTA-Bestätigung
- leichte Statusanimation bei Voting oder RSVP
- dezente Avatar-/Badge-Lebendigkeit

Vermeiden:
- permanente Loops auf Hauptflächen
- langsame, weiche Übergänge auf jedem Tap
- übermäßige Parallax-/Glass-Effekte

## Responsive Rules

### Mobile
- Einspaltig
- primäre Aktionen sticky oder sehr nah am Inhalt
- Avatare und Status kompakt

### Tablet
- mehr Luft, größere Panels
- 2-Spalten-Überblick auf Home möglich

### Desktop
- klarer Dashboard-Charakter
- links Übersicht / rechts Details oder 2-3 inhaltliche Spalten
- mehr gleichzeitiger Kontext ohne visuelle Überladung

## Screen Priorities

### Home / Cockpit
- nächste Probe
- nächster Auftritt
- aktuelle Songpriorität
- sofortige Zusage-/Bearbeiten-Aktion

### Termine
- klare Trennung Probe vs. Auftritt
- gute chronologische Scannbarkeit
- Zusage-Status schnell erreichbar

### Song Voting
- nicht wie eine nackte Tabelle
- eher wie musikalischer Ideenpool mit klaren Aktionen

### Profil
- persönlicher, freundlicher, etwas verspielter
- mehr Character als Verwaltungsformular

## Empty State Direction

Empty States sollen:
- motivierend sein
- nicht albern sein
- direkt zur nächsten Aktion führen
- leicht musikalische Sprache oder Bildsprache andeuten dürfen

## Things to Avoid

- graue Enterprise-Tabellenästhetik
- zu viele Umrandungen
- wahllose Farbvielfalt
- überladene Glaseffekte
- icon overload
- generische SaaS-Dashboard-Metriken
- visuelle Gleichbehandlung von Probe und Auftritt

## First Design Hypothesis

Die stärkste erste Richtung ist wahrscheinlich:
- ruhige neutrale Flächen
- warme braune Primäridentität
- goldene Performance-Akzente
- limettengrüne Aktiv-/Voting-Momente
- weiche Karten
- sehr klare Typo-Hierarchie
- Avatare als emotionaler Anker

## Design Exercises to Run Next

1. Drei Varianten für das Band-Cockpit
2. Eine gemeinsame Termin-Detailansicht mit Probe/Auftritt-Switching
3. Eine visuelle Zusagen-Komponente mit Avatar-Clustern
4. Eine Song-Voting-Karte mit „für Probe übernehmen“-Aktion
