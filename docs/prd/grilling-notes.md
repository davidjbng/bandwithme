# Band With Me — Grilling Notes

Diese Datei sammelt die aktuell noch offenen Schärfungsfragen aus der zweiten Grilling-Runde.

## Offene Fragen

1. Wer darf in V1 **Bandmitglieder aus einer Band entfernen** — nur Admins oder auch Mitglieder sich gegenseitig?
2. Wie genau funktioniert **Band löschen**: sofort nach Bestätigung oder mit zusätzlicher Sicherheitsstufe wie Texteingabe?
3. Sollen **Auftritte und Proben** in derselben Terminliste standardmäßig gemischt chronologisch erscheinen oder standardmäßig getrennt gruppiert sein?
4. Was passiert mit einer **offenen Zusage**, wenn ein Termin geändert wird: bleibt sie offen bestehen oder soll sie zurückgesetzt / besonders hervorgehoben werden?

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
- **Bandmitglieder dürfen eine Band jederzeit selbst verlassen.**
- **Nur Admins dürfen eine Band löschen, und zwar bestätigt als bewusste Destruktiv-Aktion.**
- **Auftritte unterstützen einen Titel.** Er soll prominent angezeigt werden; für V1 behandeln wir ihn als optionales, aber wichtiges Feld.
- **Geänderte Termine zeigen einen Status-Badge plus kurze Änderungsnotiz, aber keine Historie.**
- **Archivierte Songs können jederzeit wieder ins Voting zurückgeholt werden.**

## Aktuelle Empfehlung

Als Nächstes sollten **Mitgliederverwaltung innerhalb einer Band**, **Lösch-Sicherheit**, **Standarddarstellung der Terminliste** und die **Wirkung von Terminänderungen auf Zusagen** geschärft werden. Diese Regeln bestimmen den tatsächlichen Alltagsfluss stärker als neue große Feature-Bausteine.
