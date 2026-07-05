# Band With Me — Epics, Features & Build Order

## Ziel dieses Dokuments

Dieses Dokument übersetzt das PRD in eine umsetzbare Reihenfolge aus:

- **Epics**
- **Features**
- **tracer-bullet vertical slices**
- **empfohlener Bau-Reihenfolge**

Es ist die Vorstufe zur späteren Veröffentlichung als echte Issues. Die Granularität ist so gewählt, dass jede Slice idealerweise demo- oder testbar ist.

---

## Build Strategy

### Grundprinzip

Wir bauen **von außen nach innen, aber in echten vertikalen Scheiben**:

1. zuerst Einstieg und grundlegende App-Struktur
2. dann Termin-Domäne und Mitgliedschaft
3. dann Zusagen und Kalender-Handoff
4. dann Songs / Voting
5. dann Auftrittsdetails und Setlists
6. danach UX-Polish und spätere Erweiterungen

### Warum diese Reihenfolge?

- Onboarding + Bandkontext sind Voraussetzung für fast alles
- Termine sind der funktionale Kern des Produkts
- Songs und Setlists hängen an einer funktionierenden Band- und Terminwelt
- Design-/Motion-Polish lohnt sich erst auf stabilen Kernflows

---

# Epics

## Epic 1 — Foundation & Band Context

Die App bekommt ihren echten Einstieg: Band erstellen, Band beitreten, aktive Band laden, Rollenmodell verankern.

## Epic 2 — Membership & Profiles

Mitglieder, Rollen, Profile, Instrumente und Austritts-/Entfernlogik werden nutzbar.

## Epic 3 — Termine Core

Proben und Auftritte als echte Terminobjekte mit gemeinsamer Basis und klarer UI-Differenzierung.

## Epic 4 — Attendance & Calendar

Offen/Ja/Nein-Zusagen, Terminstatus, Änderungsnotizen und Kalender-Handoff.

## Epic 5 — Songs & Voting

Songs anlegen, voten, archivieren und zurückholen.

## Epic 6 — Performances & Setlists

Auftrittsdetails pflegen, Songs in Setlists übernehmen, Reihenfolge bearbeiten.

## Epic 7 — UX Polish & Web-First Finish

Responsive Qualität, Empty States, visuelle Konsistenz, feinere Interaktionen.

---

# Vertical Slices / Issue Breakdown

## Slice 0 — Replace Expo starter shell with Band With Me app shell

**Blocked by:** None — can start immediately

**User stories covered:** 1, 13, 14, 33, 34, 49, 52

**What to build**

- echte App-Shell statt Expo-Starter
- Basisnavigation für Home / Termine / Profil
- Startpunkt für spätere Bandkontext- und Auth-Flows
- Web-first Layout-Grundlage für mobile + desktop

**Acceptance criteria**

- [ ] Die Expo-Starter-Inhalte auf `/` sind entfernt oder ersetzt
- [ ] Die Hauptnavigation spiegelt die Band-With-Me-Struktur wider
- [ ] Die App ist im Browser weiterhin ohne Console-Errors startbar
- [ ] Mobile und Desktop haben eine stabile Grundstruktur

---

## Slice 1 — Add band onboarding choice: create or join

**Blocked by:** Slice 0

**User stories covered:** 16, 18, 19, 38

**What to build**

- neuer Einstieg mit klarer Wahl zwischen `Band erstellen` und `Band beitreten`
- Bandbeitritt über Link als primärer Flow
- Platzhalter-/Transition-Flow für noch nicht eingeloggte Nutzer

**Acceptance criteria**

- [ ] Neue Nutzer sehen eine klare Entscheidung zwischen Band erstellen und Band beitreten
- [ ] Der Einstieg funktioniert im Web ohne Sackgassen
- [ ] Bandbeitritt ist als eigenständiger Flow vorbereitet
- [ ] Die neue Shell unterstützt den Onboarding-Flow konsistent

---

## Slice 2 — Create band and assign creator as admin

**Blocked by:** Slice 1

**User stories covered:** 17, 19, 48

**What to build**

- Band-Erstellung als echter Flow
- erste Band wird im Datenmodell angelegt
- Ersteller wird automatisch Admin
- aktive Standard-Band wird gesetzt

**Acceptance criteria**

- [ ] Eine neue Band kann erstellt werden
- [ ] Der Ersteller ist danach Admin dieser Band
- [ ] Die Band wird als aktive Standard-Band geladen
- [ ] Der Flow ist nach erfolgreicher Erstellung demo-bar

---

## Slice 3 — Join existing band through invite link

**Blocked by:** Slice 1

**User stories covered:** 17, 38

**What to build**

- bandgebundener Einladungslink
- Beitritt über Link
- Mitgliedschaft anlegen
- aktive Band nach Beitritt setzen

**Acceptance criteria**

- [ ] Ein Nutzer kann einer Band per Einladungslink beitreten
- [ ] Nach Beitritt wird eine Membership angelegt
- [ ] Die beigetretene Band wird aktive Standard-Band
- [ ] Der Beitritt ist im Browser testbar

---

## Slice 4 — Membership list with self-leave and admin-remove actions

**Blocked by:** Slice 2, Slice 3

**User stories covered:** 39, 43, 44

**What to build**

- Mitgliederliste innerhalb der Band
- eigenes Verlassen der Band
- Entfernen anderer Mitglieder durch Admin
- Schutzregel: mindestens ein Admin bleibt erhalten

**Acceptance criteria**

- [ ] Mitgliederliste zeigt die Bandmitglieder der aktiven Band
- [ ] Ein Mitglied kann sich selbst aus der Band entfernen
- [ ] Ein Admin kann andere Mitglieder entfernen
- [ ] Ein letzter verbleibender Admin kann nicht versehentlich entfernt werden

---

## Slice 5 — Band deletion with confirmation

**Blocked by:** Slice 4

**User stories covered:** 45

**What to build**

- destruktiver Band-Löschflow für Admins
- Bestätigungsdialog mit Bandnamen-Eingabe
- sauberer Rückfall in den Zustand ohne aktive Band

**Acceptance criteria**

- [ ] Nur Admins sehen die Band-löschen-Aktion
- [ ] Der Bandname muss zur Bestätigung eingegeben werden
- [ ] Nach erfolgreichem Löschen landet der Nutzer wieder im bandlosen Einstieg
- [ ] Der Flow ist gegen versehentliches Auslösen geschützt

---

## Slice 6 — Real member profile instead of dev-profile shell

**Blocked by:** Slice 2 or Slice 3

**User stories covered:** 20, 21, 22, 39

**What to build**

- echtes Profilmodell pro Mitglied
- Name, Avatar/Bild, Hauptinstrument, weitere Instrumente
- Admin kann andere Profile pflegen
- Dev-Profile-Charakter verschwindet aus dem Hauptflow

**Acceptance criteria**

- [ ] Das Profil zeigt echte Mitgliedsdaten statt reinem Dev-Seed-Verhalten
- [ ] Hauptinstrument und weitere Instrumente sind editierbar
- [ ] Admins können andere Profile bei Bedarf korrigieren
- [ ] Profilbearbeitung ist browserseitig demo-bar

---

## Slice 7 — Create and list single events (rehearsal + performance)

**Blocked by:** Slice 0, Slice 2 or Slice 3

**User stories covered:** 2, 7, 9, 12, 36

**What to build**

- Termin-Domäne mit Typ `rehearsal` / `performance`
- Anlegen einzelner Termine
- chronologische Liste
- klare visuelle Unterscheidung Probe/Auftritt

**Acceptance criteria**

- [ ] Einzeltermine für Probe und Auftritt können angelegt werden
- [ ] Die Terminliste ist chronologisch
- [ ] Probe und Auftritt sind klar unterscheidbar
- [ ] Die Liste ist auf Mobile und Desktop verständlich scanbar

---

## Slice 8 — Create and manage rehearsal series

**Blocked by:** Slice 7

**User stories covered:** 6, 8

**What to build**

- Probenserie als eigenständiges Objekt
- Wiederholungsregel + Ableitung zukünftiger Termine
- Bearbeitbarkeit der Serie

**Acceptance criteria**

- [ ] Wiederkehrende Proben können als Serie angelegt werden
- [ ] Eine Probenserie bleibt nach Erstellung bearbeitbar
- [ ] Zukünftige Probentermine leiten sich aus der Serie korrekt ab
- [ ] Die Serie ist im Datenmodell als eigener Typ / eigenes Konzept erkennbar

---

## Slice 9 — RSVP statuses (open / yes / no)

**Blocked by:** Slice 7

**User stories covered:** 3, 4, 5, 37

**What to build**

- offener Standardzustand
- Zusage / Absage pro Mitglied und Termin
- klare Darstellung in Termin-UI

**Acceptance criteria**

- [ ] Jeder Termin hat sichtbare offene / Ja / Nein-Zustände
- [ ] Mitglieder können ihre Rückmeldung ändern
- [ ] Offene Zusagen sind explizit sichtbar
- [ ] Die Darstellung ist in Terminliste oder Detailansicht verständlich

---

## Slice 10 — Event status: changed / cancelled with note

**Blocked by:** Slice 7, Slice 9

**User stories covered:** 40, 46

**What to build**

- Terminstatus für abgesagt oder geändert
- kurze Änderungsnotiz
- bestehende Zusagen bleiben unangetastet

**Acceptance criteria**

- [ ] Aktuelle und zukünftige Termine können als geändert oder abgesagt markiert werden
- [ ] Geänderte Termine zeigen eine kurze sichtbare Notiz
- [ ] Bestehende Zusagen bleiben unverändert
- [ ] Vergangene Termine werden nicht nachträglich als abgesagt markiert

---

## Slice 11 — Calendar handoff for single events

**Blocked by:** Slice 7

**User stories covered:** 10, 11

**What to build**

- „Zum Kalender hinzufügen“ pro Einzeltermin
- Betriebssystem-Handoff mit vorausgefüllten Feldern

**Acceptance criteria**

- [ ] Ein Einzeltermin kann an die Betriebssystem-Kalenderfunktion übergeben werden
- [ ] Datum, Uhrzeit und relevante Basisinfos sind vorausgefüllt
- [ ] Kein ICS-Export und kein Serienexport in V1
- [ ] Der Flow ist im Browser und später auf Gerät nachvollziehbar vorbereitet

---

## Slice 12 — Hide past events from default list

**Blocked by:** Slice 7

**User stories covered:** 41

**What to build**

- Standardliste zeigt nur relevante aktuelle / zukünftige Termine
- vergangene Termine verschwinden aus der primären Sicht

**Acceptance criteria**

- [ ] Vergangene Termine werden nicht mehr in der Hauptliste gezeigt
- [ ] Aktuelle und zukünftige Termine bleiben korrekt sichtbar
- [ ] Die Liste wirkt dadurch aufgeräumter statt informationsärmer

---

## Slice 13 — Create songs and vote on them

**Blocked by:** Slice 2 or Slice 3

**User stories covered:** 23, 24, 25, 26

**What to build**

- Songs anlegen
- genau ein Link pro Song
- Voting pro Mitglied
- Basisliste der Voting-Kandidaten

**Acceptance criteria**

- [ ] Bandmitglieder können Songs anlegen
- [ ] Pro Song gibt es genau einen Referenzlink
- [ ] Mitglieder können auf Songs stimmen
- [ ] Pro Mitglied ist pro Song nur eine Stimme wirksam

---

## Slice 14 — Archive and restore songs

**Blocked by:** Slice 13

**User stories covered:** 42, 47

**What to build**

- Songs archivieren statt löschen
- archivierte Songs aus dem Voting entfernen
- bei Bedarf zurück ins Voting holen

**Acceptance criteria**

- [ ] Songs können archiviert werden
- [ ] Archivierte Songs verschwinden aus dem aktiven Voting
- [ ] Archivierte Songs können wieder reaktiviert werden
- [ ] Archivierung zerstört keine Referenzen

---

## Slice 15 — Create performance detail page

**Blocked by:** Slice 7

**User stories covered:** 9, 31, 32

**What to build**

- Auftritts-Detailseite
- Titel, Ort, Uhrzeit, Notizen/Dresscode/Hinweise
- Bearbeitung direkt auf dieser Oberfläche

**Acceptance criteria**

- [ ] Ein Auftritt hat eine dedizierte Detailansicht
- [ ] Titel ist prominent sichtbar
- [ ] Auftrittsspezifische Zusatzinfos sind dort pflegbar
- [ ] Die Oberfläche ist auf Mobile und Desktop verständlich

---

## Slice 16 — Build editable setlists on performances

**Blocked by:** Slice 13, Slice 15

**User stories covered:** 28, 29, 30

**What to build**

- Songs einem Auftritt als Setlist zuordnen
- Reihenfolge ändern
- Übernahme in Setlist archiviert Song aus Voting

**Acceptance criteria**

- [ ] Songs können einem Auftritt als Setlist hinzugefügt werden
- [ ] Die Reihenfolge ist bearbeitbar
- [ ] Alle Bandmitglieder dürfen die Setlist bearbeiten
- [ ] Ein übernommener Song verschwindet aus dem Voting

---

## Slice 17 — Empty states and visual polish for MVP-critical screens

**Blocked by:** Slices 6–16 (mindestens Kernflows vorhanden)

**User stories covered:** 33, 34, 35

**What to build**

- bessere Empty States
- konsistente CTA-Hierarchie
- leichte Motion / Micro-Feedback
- visuelle Schärfung der wichtigsten Screens

**Acceptance criteria**

- [ ] Home, Termine, Songs und Profil haben verständliche Empty States
- [ ] Primäre Aktionen sind auf den Kernscreens klar erkennbar
- [ ] Animationen unterstützen Status/Fokus, ohne die App zu verlangsamen
- [ ] Die App wirkt im Browser nicht mehr wie ein Scaffold

---

# Empfohlene Reihenfolge

## Phase A — App Foundation

1. Slice 0
2. Slice 1
3. Slice 2
4. Slice 3

## Phase B — Membership

5. Slice 4
6. Slice 5
7. Slice 6

## Phase C — Termine Kern

8. Slice 7
9. Slice 8
10. Slice 9
11. Slice 10
12. Slice 11
13. Slice 12

## Phase D — Songs

14. Slice 13
15. Slice 14

## Phase E — Auftritte

16. Slice 15
17. Slice 16

## Phase F — Finish

18. Slice 17

---

# Meine Einschätzung zur Granularität

Die Aufteilung ist **bewusst mittel-fein**:

- nicht so grob, dass ein Ticket „halbe App bauen“ bedeutet
- nicht so fein, dass wir 40 Mini-Issues erzeugen, die kaum eigenständig demo-bar sind

Wenn wir echte GitHub-Issues daraus machen, würde ich genau diese Slices in Issues überführen — ggf. mit sehr kleinen Zusammenlegungen bei den Foundation-Schritten.

---

# Empfehlung für den direkten nächsten Schritt

1. **Designrichtung aus den HTML-Varianten auswählen**
2. dann **Slice 0–3** bauen
3. danach mit **Termine Core** weitermachen
