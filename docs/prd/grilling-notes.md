# Band With Me — Grilling Notes

Diese Datei sammelt die aktuell noch offenen Schärfungsfragen aus der zweiten Grilling-Runde.

## Offene Fragen

1. Dürfen Bandmitglieder ihre **eigene Band verlassen**, und wenn ja: direkt selbst oder nur mit Einschränkungen?
2. Soll es für einen **Auftritt** zusätzlich zu Datum/Uhrzeit/Ort noch ein Pflichtfeld wie Titel/Name geben, oder reicht ein generierter Standardname?
3. Wie genau wird ein **geänderter Termin** dargestellt: nur Badge/Status oder zusätzlich mit Änderungsvermerk wie „früher 19:30, jetzt 20:00“?
4. Sollen **archivierte Songs** später wieder ins Voting zurückgeholt werden können?

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
- **Neue Nutzer sehen in V1 zwei klare Einstiege:** Band erstellen oder Band beitreten.
- **Der Ersteller einer Band wird automatisch Admin.**
- **Mehrfach-Band-Mitgliedschaft ist nur im Datenmodell vorgesehen.** In der V1-UI gibt es keinen Bandwechsel.
- **Auftritts-Detailinfos werden auf der Auftritts-Detailseite gepflegt.**
- **Songs werden nicht hart gelöscht, sobald sie relevant genutzt wurden.** Verwendete Songs werden archiviert statt gelöscht.
- **Wenn ein Song in eine Setlist übernommen wird, verschwindet er aus dem Song-Voting durch Archivierung.**

## Aktuelle Empfehlung

Als Nächstes sollten **Austritt aus Bands**, **Darstellung von Terminänderungen**, **Pflichtfelder bei Auftritten** und der **Lebenszyklus archivierter Songs** geschärft werden. Diese Entscheidungen betreffen die Alltagstauglichkeit der V1 stärker als zusätzliche große Features.
