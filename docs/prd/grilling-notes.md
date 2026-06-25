# Band With Me — Grilling Notes

Diese Datei sammelt die aktuell noch offenen Schärfungsfragen aus der zweiten Grilling-Runde.

## Offene Fragen

1. Wie wird die **erste Band** in V1 angelegt: automatisch beim ersten Admin-Onboarding oder über einen expliziten „Band erstellen“-Schritt?
2. Wie sichtbar soll **Mehrfach-Band-Mitgliedschaft** in der V1-UI sein, wenn das Modell sie technisch schon erlaubt?
3. Sollen **vergangene Termine** sofort verschwinden oder noch kurz über einen versteckten Verlauf/Filter erreichbar sein?
4. Wie sollen **Auftritts-Detailinfos nach der Erstellung** ergänzt werden: inline auf der Detailseite oder in einem separaten Bearbeiten-Flow?

## Bereits entschiedene Punkte

- **Probenserie ist ein echtes Objekt.** Sie bleibt nach Erstellung eigenständig, kann zentral bearbeitet werden und ist nicht nur eine Erstellhilfe für kopierte Einzeltermine.
- **Setlist gehört in V1 genau zu einem Auftritt.** Es gibt keine freien Setlist-Entwürfe ohne Auftritt.
- **Alle Bandmitglieder dürfen Songs anlegen.** Song-Erstellung ist kein reines Admin-Recht.
- **Zusagen haben in der UI drei sichtbare Zustände:** offen, zugesagt, abgesagt.
- **Bandbeitritt läuft über Einladungslinks.** Ein Admin erstellt zunächst eine Band und kann danach bandgebundene Einladungslinks teilen.
- **Pro Band gibt es in V1 genau einen dauerhaften Einladungslink ohne Ablaufdatum.**
- **Profilrechte sind erweitert.** Jedes Bandmitglied kann das eigene Profil bearbeiten; Admins dürfen zusätzlich Profile anderer Mitglieder anpassen.
- **Instrumente unterstützen Mehrfachauswahl plus Hauptinstrument.**
- **Aktuelle und zukünftige Termine können abgesagt oder geändert markiert werden.** Vergangene Termine sollen nicht nachträglich als abgesagt markiert werden.
- **Alle Bandmitglieder dürfen Termine absagen und ändern.** Diese Bearbeitungsrechte sind nicht auf Admins beschränkt.
- **Kalender hinzufügen ist in V1 eine Betriebssystem-Integration für Einzeltermine.** Kein ICS-Export und kein Serienexport.
- **Ein Song kann genau einen Link haben.** Der Link darf auf beliebige Quellen zeigen; für Spotify und YouTube wird in V1 eine spezielle Erkennung/Anzeige bevorzugt.
- **Vergangene Termine verschwinden aus der regulären Ansicht.**
- **Alle Bandmitglieder dürfen Setlists bearbeiten.**
- **Mehrfach-Band-Mitgliedschaft soll technisch möglich sein, aber in der V1-UI nicht betont werden.**
- **Probefokus wird in V1 gestrichen.**

## Aktuelle Empfehlung

Als Nächstes sollten **Band-Erstellung**, **Mehrfach-Band-Mitgliedschaft**, **vergangene Termine** und die **Bearbeitungsgrenzen innerhalb der Band** geschärft werden. Diese Entscheidungen bestimmen, wie viel Struktur die V1 wirklich braucht und was bewusst unsichtbar bleiben soll.
