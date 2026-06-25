# Band With Me — Grilling Notes

Diese Datei sammelt die aktuell noch offenen Schärfungsfragen aus der zweiten Grilling-Runde.

## Offene Fragen

1. Sollen **bestehende Zusagen `yes`/`no`** bei einer Terminänderung ebenfalls unverändert bestehen bleiben oder speziell markiert werden?
2. Sollen Bandmitglieder bei einer Terminänderung zusätzlich **sichtbar benachrichtigt** werden, oder reicht die Änderung in der Liste/Detailansicht?
3. Dürfen Admins auch **andere Admins** aus der Band entfernen, oder braucht es dafür eine Einschränkung?
4. Wenn ein Nutzer mehrere Bands im Datenmodell hat, welche Band ist nach erneutem Einstieg die **aktive Standard-Band**?

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
- **Admins dürfen andere Bandmitglieder aus der Band entfernen.** Mitglieder ohne Admin-Rolle können nur sich selbst entfernen.
- **Nur Admins dürfen eine Band löschen, und zwar bestätigt als bewusste Destruktiv-Aktion.** Zur Bestätigung muss der Bandname eingegeben werden.
- **Auftritte unterstützen einen Titel.** Er soll prominent angezeigt werden; für V1 behandeln wir ihn als optionales, aber wichtiges Feld.
- **Geänderte Termine zeigen einen Status-Badge plus kurze Änderungsnotiz, aber keine Historie.**
- **Archivierte Songs können jederzeit wieder ins Voting zurückgeholt werden.**
- **Die Standard-Terminliste ist chronologisch und visuell klar zwischen Probe und Auftritt unterscheidbar.**
- **Terminänderungen verändern bestehende Zusagen nicht automatisch.** Offene, zugesagte und abgesagte Zustände bleiben bestehen.

## Aktuelle Empfehlung

Als Nächstes sollten **Benachrichtigungsverhalten bei Terminänderungen**, **Admin-zu-Admin-Grenzen**, **aktive Standard-Band** und der **Umgang mit bestehenden Zusagen nach Änderungen** final geschärft werden. Diese Regeln betreffen die Alltagssicherheit der V1 stärker als zusätzliche große Feature-Bausteine.
