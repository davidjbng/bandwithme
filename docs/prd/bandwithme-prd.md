# Band With Me — Product Requirements Document

## Problem Statement

Bands organisieren Proben, Auftritte, Songideen und Rückmeldungen oft verteilt über Chat, Kalender, Notizen und Bauchgefühl. Dadurch gehen Zusagen verloren, aktuelle Prioritäten sind unklar, wiederkehrende Proben werden umständlich gepflegt und Setlists für Auftritte entstehen ohne gemeinsamen, sichtbaren Stand.

**Band With Me** soll für eine Band ein gemeinsames, angenehm benutzbares Zuhause schaffen: Termine planen, Teilnahme erfassen, Songs priorisieren und Auftritte vorbereiten — in einer App, die sich leicht, modern und lebendig anfühlt.

## Solution

Band With Me wird eine web-first Expo-App mit nativer Produktlogik, die zuerst für Davids eigene Band entwickelt wird, aber später auf weitere Bands erweitert werden kann. Die erste Version konzentriert sich auf vier Kernbereiche:

1. **Terminplanung** für Proben und Auftritte
2. **Teilnahme-Status** mit sichtbaren offenen, Ja- und Nein-Zuständen
3. **Song Voting** für neue oder relevante Songs
4. **Profile & Mitgliedschaft** mit Magic-Link-Login, Instrumenten und spielerischen Avataren

Zusätzlich soll die App bei konkreten Terminen eine **„Zum Kalender hinzufügen“-Integration des Betriebssystems** anbieten, damit Mitglieder Einzeltermine mit vorausgefüllten Daten in ihren persönlichen Kalender übernehmen können.

Die erste Version priorisiert **schnell nutzbaren Mehrwert und starke UX** über technische Perfektion oder Funktionsbreite.

## Product Goals

- Proben und Auftritte in einer einzigen Band-App planbar machen
- Für jedes Bandmitglied in Sekunden sichtbar machen, **was als Nächstes ansteht**
- Song-Priorisierung direkt mit Proben- und Auftrittsplanung verbinden
- Eine hochwertige, moderne, freundliche Experience liefern
- Web, Tablet und Mobile gleichermaßen sauber unterstützen
- Mit Expo Go kompatibel bleiben, solange das sinnvoll möglich ist

## Non-Goals for V1

- Keine Bandkasse / Schuldenerfassung
- Keine Push-Reminder oder In-App-Erinnerungen
- Keine Kommentare auf Zusagen
- Kein Social Login (Google, Apple)
- Kein E-Mail+Passwort-Login
- Keine Gast-Rolle
- Keine Song-Kategorien oder komplexes Tagging
- Keine Aufgaben-/To-do-Engine für Auftritte
- Keine tiefe Analytics-, Reporting- oder Historien-Auswertung
- Keine Multi-Band-SaaS-Verwaltung im UI
- Kein Probefokus als eigener Bereich oder eigene Domäne

## Users and Roles

### Primary users
- **Bandmitglied**: nimmt an Proben und Auftritten teil, stimmt über Songs ab, pflegt Profil und Zusagen
- **Admin**: kann Mitglieder einladen und verwalten sowie übergeordnete Bandverwaltung übernehmen

### Future users (not V1)
- weitere Bands / öffentliche Store-Nutzer
- feinere Rollenmodelle

## User Stories

1. Als Bandmitglied möchte ich nach dem Öffnen der App sofort sehen, was als Nächstes ansteht, damit ich ohne Suchen den aktuellen Band-Kontext verstehe.
2. Als Bandmitglied möchte ich die nächsten Proben und Auftritte getrennt erkennen, damit ich Alltagsproben nicht mit Konzerten verwechsle.
3. Als Bandmitglied möchte ich sehen, wer für einen Termin zugesagt oder abgesagt hat, damit ich den Besetzungsstand schnell erfassen kann.
4. Als Bandmitglied möchte ich für einen Termin mit genau einer Ja/Nein-Entscheidung antworten, damit die Rückmeldung schnell und eindeutig ist.
5. Als Bandmitglied möchte ich meine Zusage jederzeit ändern können, damit die Planung aktuell bleibt.
6. Als Bandmitglied möchte ich wiederkehrende Proben als Serie erleben, damit regelmäßige Bandtermine nicht jedes Mal neu gepflegt werden müssen.
7. Als Bandmitglied möchte ich einen einzelnen Probentermin anlegen, damit spontane Zusatzproben geplant werden können.
8. Als Bandmitglied möchte ich einen wiederkehrenden Probentermin anlegen, damit Standardproben effizient eingerichtet sind.
9. Als Bandmitglied möchte ich einen Auftritt mit Datum, Uhrzeit, Ort und optionalem Titel anlegen, damit die Band alle gig-relevanten Infos an einer Stelle hat.
10. Als Bandmitglied möchte ich einen Einzeltermin per Betriebssystem-Funktion zu meinem Kalender hinzufügen können, damit ich außerhalb der App den Überblick behalte.
11. Als Bandmitglied möchte ich beim Hinzufügen zum Kalender die vorausgefüllten Informationen direkt in meiner Kalender-App sehen, damit ich nur noch feinjustieren muss.
12. Als Bandmitglied möchte ich eine Liste aller anstehenden Termine sehen, damit ich nach Zeit sortiert planen kann.
13. Als Bandmitglied möchte ich auf dem Desktop bequem mit mehr Überblick arbeiten, damit die Web-App auch am Rechner nützlich ist.
14. Als Bandmitglied möchte ich dieselben Informationen auf dem Smartphone verdichtet sehen, damit die App mobil schnell benutzbar bleibt.
15. Als Bandmitglied möchte ich zwischen Light und Dark Mode eine gute Experience haben, damit die App unabhängig von Systempräferenz hochwertig wirkt.
16. Als Bandmitglied möchte ich mich per Magic Link anmelden, damit ich kein zusätzliches Passwort verwalten muss.
17. Als Admin möchte ich einen bandgebundenen Einladungslink teilen können, damit nur echte Bandmitglieder Zugang erhalten.
18. Als neuer Nutzer möchte ich direkt zwischen „Band erstellen“ und „Band beitreten“ wählen können, damit mein Einstieg klar ist.
19. Als Ersteller einer neuen Band möchte ich automatisch Admin werden, damit ich die Band sofort verwalten kann.
20. Als Bandmitglied möchte ich mein Profil selbst bearbeiten können, damit Name, Instrumente und Darstellung aktuell bleiben.
21. Als Bandmitglied möchte ich mehrere Instrumente und ein Hauptinstrument in meinem Profil hinterlegen, damit bei Terminen klarer ist, wer welche Rolle abdeckt.
22. Als Bandmitglied möchte ich einen sympathischen Avatar oder ein Bild haben, damit Zusagen persönlicher und schneller erfassbar sind.
23. Als Bandmitglied möchte ich sehen, welche Songs aktuell zur Abstimmung stehen, damit ich weiß, woran die Band als Nächstes arbeiten könnte.
24. Als Bandmitglied möchte ich für Songs stimmen können, damit die Band Prioritäten demokratisch setzen kann.
25. Als Bandmitglied möchte ich nur als eingeloggtes Mitglied abstimmen können, damit das Voting nicht von Außenstehenden beeinflusst wird.
26. Als Bandmitglied möchte ich Songs manuell anlegen können, damit neue Ideen direkt in den Pool gelangen.
27. Als Bandmitglied möchte ich einem Song genau einen Link wie Spotify, YouTube oder eine andere Quelle hinzufügen können, damit alle dieselbe Referenz hören können.
28. Als Bandmitglied möchte ich Songs für einen Auftritt auswählen können, damit aus dem Repertoire eine Setlist entsteht.
29. Als Bandmitglied möchte ich die Reihenfolge einer Setlist festlegen können, damit der Auftritt sinnvoll strukturiert ist.
30. Als Bandmitglied möchte ich erkennen, welche Songs bereits für einen kommenden Auftritt vorgesehen sind, damit ich zielgerichtet übe.
31. Als Bandmitglied möchte ich auf einem Auftritt Zusatzinfos wie Dresscode oder Location-Hinweise sehen, damit ich vorbereitet bin.
32. Als Bandmitglied möchte ich Auftrittsinfos in kompakter, scanbarer Form sehen, damit ich sie unterwegs schnell verstehe.
33. Als Bandmitglied möchte ich leere Zustände verständlich und motivierend erleben, damit die App auch am Anfang nicht tot wirkt.
34. Als Bandmitglied möchte ich, dass Hauptaktionen mit wenigen Taps erreichbar sind, damit die App sich leicht und schnell anfühlt.
35. Als Bandmitglied möchte ich, dass visuelle Animationen subtil und unterstützend sind, damit die App lebendig wirkt ohne anstrengend zu werden.
36. Als Bandmitglied möchte ich Proben und Auftritte als unterschiedliche Objekttypen mit gemeinsamem Planungsfundament anlegen können, damit die Datenstruktur einfach bleibt und die Darstellung trotzdem klar getrennt ist.
37. Als Bandmitglied möchte ich offene Zusagen als eigenen sichtbaren Zustand sehen, damit unbeantwortete Termine sofort erkennbar sind.
38. Als Bandmitglied möchte ich über einen Einladungslink meiner Band beitreten können, damit der Zugang in Chats und Gruppen einfach verteilt werden kann.
39. Als Admin möchte ich Profile anderer Mitglieder bei Bedarf korrigieren können, damit Banddaten konsistent bleiben.
40. Als Bandmitglied möchte ich sehen, wenn ein aktueller oder zukünftiger Termin abgesagt oder geändert wurde, damit ich mich nicht auf veraltete Planung verlasse.
41. Als Bandmitglied möchte ich, dass vergangene Termine aus der Standardansicht verschwinden, damit die Planungsliste sauber bleibt.
42. Als Bandmitglied möchte ich, dass ein Song nach Übernahme in eine Setlist aus dem Voting verschwindet, damit das Voting nur neue oder offene Kandidaten zeigt.
43. Als Bandmitglied möchte ich eine Band selbst verlassen können, damit ich meine Zugehörigkeit eigenständig verwalten kann.
44. Als Admin möchte ich andere Bandmitglieder aus der Band entfernen können, damit die Mitgliederliste korrekt bleibt.
45. Als Admin möchte ich eine Band nur nach expliziter Bestätigung durch Eingabe des Bandnamens löschen können, damit diese destruktive Aktion nicht versehentlich passiert.
46. Als Bandmitglied möchte ich bei einem geänderten Termin kurz sehen, was sich geändert hat, damit ich den Unterschied ohne Historie verstehe.
47. Als Bandmitglied möchte ich archivierte Songs wieder ins Voting zurückholen können, damit frühere Ideen später erneut priorisiert werden können.
48. Als Nutzer mit mehreren Bands im Datenmodell möchte ich beim erneuten Einstieg automatisch in meiner zuletzt aktiven Band landen, damit ich ohne Wechsel-UI direkt weiterarbeiten kann.
49. Als Entwicklerteam möchten wir web-first entwickeln können, damit Iteration und Feinschliff im Browser schnell erfolgen.
50. Als Entwicklerteam möchten wir die erste Version entlang weniger, klarer Domänenobjekte umsetzen, damit die Umsetzung schnell bleibt.
51. Als Entwicklerteam möchten wir die App so schneiden, dass spätere Erweiterungen wie Bandkasse, Aufgaben oder Multi-Band-Support möglich bleiben.
52. Als Bandmitglied möchte ich nicht mit unnötigen Feldern oder komplexen Workflows überladen werden, damit die App im Alltag tatsächlich benutzt wird.

## Scope Summary (V1)

### In Scope
- Magic-Link-Login
- Admin + Bandmitglied
- Startscreen mit den Optionen „Band erstellen“ oder „Band beitreten“
- Mitgliedereinladung durch bandgebundenen Einladungslink
- Profilverwaltung mit Name, Hauptinstrument, weiteren Instrumenten, Bild/Avatar
- Band selbst verlassen
- Bandmitglieder durch Admin entfernbar
- Band löschen durch Admin mit Bestätigung und Bandnamen-Eingabe
- Terminliste
- Einzeltermine für Proben und Auftritte
- Serientermine für Proben
- offene / Ja / Nein-Zusagen
- Übersicht der Zusagen pro Termin
- Song Voting mit manuell angelegten Songs
- ein Song-Link pro Song (z. B. Spotify, YouTube oder andere Quelle)
- Archivierung von Songs statt Löschung, sobald sie relevant verwendet werden
- Setlist-Auswahl für Auftritte
- Reihenfolge in Setlists
- abgesagt / geändert markierte aktuelle und zukünftige Termine
- Änderungsbadge mit kurzer Änderungsnotiz
- Betriebssystem-Integration „Zum Kalender hinzufügen“ für Einzeltermine
- responsive Web-UX für Mobile / Tablet / Desktop
- Light & Dark Mode

### Explicitly Out of Scope
- Bandkasse
- Kommentare bei Zusagen
- Reminder / Push Notifications
- Gast-Zugänge
- Social Login
- E-Mail+Passwort
- Song-Kategorien
- Aufgabenlisten für Auftritte
- komplexe Admin-Oberflächen für mehrere Bands

## Core Experience Principles

- **Sofortiger Überblick:** Die App startet nicht in abstrakten Menüs, sondern in einem klaren aktuellen Bandstatus.
- **Probe und Auftritt sauber unterscheiden:** Gemeinsame technische Basis, klar unterschiedliche UI-Signale.
- **Planen statt dokumentieren:** V1 optimiert den nächsten Schritt, nicht perfekte Archivierung.
- **Persönlich statt bürokratisch:** Avatare, freundliche Sprache, klar sichtbare Mitglieder.
- **Modern, aber nicht verspielt-chaotisch:** Subtile Bewegung, kein Effekt-Overkill.
- **Web-first polish:** Desktop darf nicht wie eine aufgeblasene Mobile-App wirken.

## Information Architecture

### 1. Home / Band-Cockpit
Empfohlener Einstiegsbereich mit:
- nächster Probentermin
- nächster Auftritt
- kurze Voting-Übersicht
- schneller Einstieg in Zusage oder Terminanlage

### 2. Termine
Unterteilt in:
- **Proben**
- **Auftritte**

Gemeinsame Basiskonzepte:
- Datum/Uhrzeit
- Serientermin-Unterstützung (für Proben)
- Zusagen
- „Zum Kalender hinzufügen“ pro Einzeltermin

### 3. Songs
Unterteilt in:
- Songs im Voting
- Songs, die in Auftritts-Setlists verwendet werden

### 4. Profil
- Name
- Bild/Avatar
- Instrumente
- Mitgliedschaft / Rolle
- Login-Verwaltung

## Domain Model (proposed)

### Band
- repräsentiert die Band als primären Mandanten
- hält Name, Basis-Einstellungen und Mitgliederbezug
- wird beim expliziten Band-erstellen-Flow erstmals angelegt

### Membership
- verbindet User mit Band
- enthält Rolle (`admin`, `member`)
- dient später als Basis für Einladungen und Rechte
- erlaubt selbstständigen Austritt eines Bandmitglieds
- erlaubt Admins das Entfernen anderer Bandmitglieder

### User Profile
- Name
- Bild/Avatar
- Hauptinstrument
- weitere Instrumente
- optionale spätere Präferenzen

### Event Series
- beschreibt wiederkehrende Probentermine als eigenständiges Domänenobjekt
- enthält Wiederholungsregel und Vorlagendaten
- bleibt nach der Erstellung bearbeitbar und ist nicht nur eine Erstellhilfe

### Event Instance
- konkrete Probe oder konkreter Auftritt
- Typ: `rehearsal` oder `performance`
- Datum/Uhrzeit, Ort, Notizen, Statusfähigkeit und Kalender-Handoff
- bei Performance zusätzlich Titel und Setlist-/Gig-Kontext

### RSVP
- Beziehung zwischen Mitglied und Event Instance
- Status: `open`, `yes` oder `no`

### Song
- Titel
- Artist / Zusatzinfo optional
- genau ein Referenzlink
- Archivstatus
- Ersteller / Timestamps

### Song Vote
- Stimme eines Mitglieds auf einen Song
- genau eine Stimme pro Mitglied pro Song

### Performance Setlist
- ausgewählte Songs für einen Auftritt
- geordnete Reihenfolge
- existiert immer im Kontext genau eines Auftritts

## Implementation Decisions

- Die erste Version sollte die Produktdomäne entlang weniger Kernobjekte schneiden: **Band, Membership, Event, RSVP, Song, Vote, Setlist**.
- Proben und Auftritte sollten kein komplett getrenntes System sein, sondern zwei Event-Typen mit gemeinsamen Basiseigenschaften und typspezifischen Erweiterungen.
- Wiederkehrende Proben sollten über ein erstklassiges Serienkonzept modelliert werden, statt nur kopierte Einzeltermine zu erzeugen.
- Eine Probenserie bleibt nach Erstellung ein eigenständiges Objekt, damit Änderungen an zukünftigen Terminen zentral gesteuert werden können.
- Kalenderintegration in V1 bedeutet: ein einzelner Termin wird mit vorausgefüllten Daten an die Betriebssystem-Kalenderfunktion übergeben; es gibt keinen ICS- oder Serienexport.
- Der Beitritt zur Band sollte über einen bandgebundenen Einladungslink in Chat- und Gruppen-Kontexten funktionieren.
- Neue Nutzer sollen in V1 explizit zwischen „Band erstellen“ und „Band beitreten“ wählen können; der Ersteller der Band wird automatisch Admin.
- Bandmitglieder dürfen ihre eigene Mitgliedschaft selbst beenden; das Löschen einer ganzen Band bleibt eine bestätigungspflichtige Admin-Aktion.
- Das Löschen einer Band verlangt in V1 einen Bestätigungsdialog mit Eingabe des Bandnamens.
- Andere Admins dürfen entfernt werden, solange mindestens ein Admin in der Band verbleibt.
- Song-Kandidaten benötigen in V1 kein komplexes Taxonomie-System; ihr Status ergibt sich aus Kontexten wie Voting und Setlist.
- Alle Bandmitglieder dürfen Songs anlegen; Song-Erstellung ist kein exklusives Admin-Recht.
- Ein Song besitzt in V1 genau einen Referenzlink; Spotify- und YouTube-Links erhalten bevorzugte Erkennung, andere Links bleiben trotzdem gültig.
- Songs werden nicht bevorzugt gelöscht, sondern bei Nutzung oder Abschluss archiviert; in Setlists referenzierte Songs bleiben erhalten.
- Setlists existieren in V1 nicht frei schwebend, sondern immer als Teil genau eines Auftritts.
- Setlists sind in V1 von allen Bandmitgliedern bearbeitbar.
- Zusagen sind im UI dreistufig sichtbar: offen, zugesagt, abgesagt.
- Aktuelle und zukünftige Termine sind von allen Bandmitgliedern bearbeitbar und können als abgesagt oder geändert markiert werden.
- Geänderte Termine zeigen eine kurze Änderungsnotiz statt einer vollständigen Änderungshistorie.
- Terminänderungen verändern bestehende Zusagen nicht automatisch.
- Bei Terminänderungen reicht in V1 die Sichtbarkeit in der App; es gibt keine zusätzlichen Benachrichtigungen oder Pushs.
- Vergangene Termine verschwinden aus der Standard-UI, statt prominent historisiert zu werden.
- Profile unterstützen ein Hauptinstrument plus weitere Instrumente; Admins dürfen bei Bedarf auch fremde Profile korrigieren.
- Zugangsmodell in V1: nur eingeladene Mitglieder mit Magic-Link-Login.
- Das Datenmodell darf mehrere Bands pro Nutzer zulassen, auch wenn die V1-UI dieses Konzept noch nicht hervorhebt.
- Wenn mehrere Bands im Datenmodell existieren, wird die zuletzt aktive Band als Standard-Band verwendet.
- Die bestehende Profilfläche sollte von einem Dev-Profil zu einer echten Mitglieds-/Bandprofil-Ansicht weiterentwickelt werden.
- Die bestehende Terminfläche ist ein sinnvoller Startpunkt für den Rehearsal/Performance-Bereich und sollte nicht komplett neu erfunden werden.
- Das erste starke UX-Seam ist ein **Band-Cockpit**, das mehrere Domänen zusammenfasst, ohne die tieferen Bereiche zu ersetzen.
- Die App sollte visuell systematisch von wenigen Design-Tokens leben: neutrale Flächen, eine warme Primärfarbe, ein leuchtender Akzent, klare Radius-/Spacing-Regeln.
- Animationen sollen vor allem Statuswechsel, Fokus und lebendige Avatare unterstützen — nicht Navigation verlangsamen.
- Web, Tablet und Mobile müssen als gleichwertige Layout-Ziele behandelt werden; Desktop ist keine nachträgliche Stretch-Version.

## Suggested Delivery Phases

### Phase 1 — Foundation
- Rollenmodell (`admin`, `member`)
- Band-erstellen- / Band-beitreten-Flow
- Einladungslink-Fluss
- Band-verlassen- / Band-löschen-Flow
- Mitglied entfernen
- echtes Mitgliedsprofil
- Basis-Navigation und Home-Cockpit-Rahmen

### Phase 2 — Termine
- Event-Datenmodell
- Einzeltermine
- Probenserien
- RSVP offen/Ja/Nein
- Terminliste und Detailansicht (chronologisch, aber visuell unterscheidbar)
- Status für abgesagt/geändert
- Änderungsnotiz
- Kalender-Handoff für Einzeltermine

### Phase 3 — Songs
- Songs anlegen
- Songlinks
- Voting
- Song-Archivierung

### Phase 4 — Auftritte
- Performance-spezifische Felder
- Songs in Setlist übernehmen
- Reihenfolge definieren
- Übersicht „für nächsten Auftritt vorgesehen“

### Phase 5 — Polish
- Avatar-System verbessern
- subtile Animationen
- bessere Empty States
- Light/Dark Feinschliff
- Desktop/Tablet Optimierung

## Testing Decisions

- Gute Tests prüfen **sichtbares Verhalten und Benutzerwert**, nicht interne Implementierungsdetails.
- Priorität haben Tests für Zustandsübergänge und Domänenlogik: Event-Typen, RSVP-Verhalten, Vote-Eindeutigkeit, Reihenfolge von Setlists, Serienbildung.
- UI-Tests sollten die wichtigsten Kernflows absichern:
  - Termin anlegen
  - Probe als Serie anlegen
  - zu-/absagen
  - Song anlegen und voten
  - Song einem Auftritt zuordnen
- Responsive Tests sollten mindestens Mobile- und Desktop-Layouts für die wichtigsten Oberflächen prüfen.
- Kalender-Handoff sollte auf korrekt vorausgefüllte Betriebssystem-Übergaben getestet werden.
- Profiltests sollten Rollen- und Bearbeitungsrechte absichern.
- Tests sollten offene Zusagen, abgesagte/geänderte Termine und auftrittsgebundene Setlists explizit abdecken.
- Song-Tests sollten Archivierungsregeln und das Entfernen aus dem Voting nach Setlist-Übernahme absichern.
- Mitgliedschafts-Tests sollten Selbst-Austritt und Band-Löschung mit Bestätigung absichern.
- Termin-Tests sollten absichern, dass Änderungen bestehende Zusagen nicht automatisch verändern.
- Mitgliedschafts-Tests sollten absichern, dass beim Entfernen von Admins mindestens ein Admin verbleibt.
- Falls bereits ähnliche Tests existieren, sollten neue Tests dieselbe Testtiefe und denselben Stil übernehmen, statt neue Testmuster einzuführen.
- Empfehlenswerte Test-Schwerpunkte pro Modul:
  - **Domain/Backend:** Event-, RSVP-, Vote-, Setlist-Logik
  - **UI/Flow:** Home-Cockpit, Terminformular, Voting-Liste, Auftrittsdetail
  - **Responsive Behavior:** Kartenraster, Listenverdichtung, Header-/Action-Platzierung

## Success Criteria for V1

- Eine Band kann sich einladen und einloggen.
- Proben und Auftritte können zuverlässig angelegt und angezeigt werden.
- Mitglieder können pro Termin schnell mit offen/Ja/Nein umgehen und unbeantwortete Zusagen klar erkennen.
- Der aktuelle Planungsstand ist ohne Chat-Nachfragen erkennbar.
- Songs können gesammelt, gevotet und für Auftritte weiterverwendet werden.
- Die App fühlt sich im Browser bereits hochwertig genug an, dass sie gern benutzt wird.

## Out of Scope

- Bandkasse inklusive Straf-/Schuldhistorie
- Erinnerungen oder Notification-System
- Kommentare, Diskussionen oder Chat in der App
- komplexe Aufgabenverfolgung für Auftritte
- öffentliches Self-Service-Onboarding für beliebige Bands
- granulare Rollen wie Gast, Manager, Technik etc.
- Analytics-Dashboards, Berichte oder Historien-Auswertungen
- Import bestehender Song-Bibliotheken aus Drittquellen

## Further Notes

- Konzertmeister ist als funktionale Referenz relevant, aber nicht als visuelle Vorlage.
- Die Experience soll sich eher nach einer modernen Consumer-App anfühlen als nach Vereinssoftware.
- Ein erster Design-Explorationsschritt vor größerer Implementierung ist sinnvoll und gewünscht.
- Die App sollte so geschnitten werden, dass die spätere Bandkasse ohne Domänenbruch ergänzt werden kann.
