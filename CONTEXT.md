# Band With Me

Band With Me ist eine App für die gemeinsame Organisation einer Band. Sie bündelt Terminplanung, Teilnahme, Song-Priorisierung und Auftrittsvorbereitung in einer gemeinsamen Sprache, damit die Band nicht auf Chat, Bauchgefühl und Einzellisten angewiesen ist.

## Language

**Band**:
Die primäre Gruppe, für die geplant, geprobt und aufgetreten wird.
_Avoid_: Team, Workspace, Organisation

**Mitgliedschaft**:
Die Zugehörigkeit einer Person zu einer Band inklusive ihrer Rolle in dieser Band.
_Avoid_: Einladung, Nutzerkonto, Berechtigung

**Bandmitglied**:
Eine Person mit Zugriff auf die Band-App, die an Planung, Zusagen oder Songs teilnimmt.
_Avoid_: User, Teilnehmer, Gast

**Admin**:
Ein Bandmitglied mit erweiterten Rechten für Bandverwaltung, Einladungen und übergeordnete Mitgliedspflege.
_Avoid_: Owner, Superuser

**Probe**:
Ein geplanter Bandtermin zum gemeinsamen Üben. Eine Probe gehört zur laufenden Arbeit der Band und ist kein öffentlicher Auftritt.
_Avoid_: Session, Meeting, Event

**Auftritt**:
Ein konkreter Gig oder Konzerttermin, für den die Band öffentlich oder halböffentlich spielt.
_Avoid_: Konzerttermin, Gig-Event, Show-Event

**Probenserie**:
Eine wiederkehrende Vorlage für regelmäßige Proben, aus der konkrete Probentermine entstehen oder abgeleitet werden.
_Avoid_: Wiederholung, Regel, Rhythmus

**Termin**:
Der Oberbegriff für eine konkrete Probe oder einen konkreten Auftritt.
_Avoid_: Slot, Kalenderobjekt

**Zusage**:
Die Rückmeldung eines Bandmitglieds zu einem konkreten Termin mit einem sichtbaren Status wie offen, zugesagt oder abgesagt.
_Avoid_: RSVP, Antwort, Attendance

**Offene Zusage**:
Der sichtbare Standardzustand einer noch nicht beantworteten Zusage.
_Avoid_: Unbekannt, pending, maybe

**Song**:
Ein musikalisches Stück, das von der Band gesammelt, bewertet, geprobt oder aufgeführt werden kann.
_Avoid_: Track, Nummer, Content

**Song-Voting**:
Der Bereich, in dem Bandmitglieder Songs priorisieren, indem sie Stimmen abgeben.
_Avoid_: Ranking, Poll, Songwahl

**Einladungslink**:
Ein bandgebundener Beitrittslink, über den neue Bandmitglieder in die App kommen und der Band beitreten können.
_Avoid_: Invite code, Registration link, Magic link

**Bandbeitritt**:
Der Einstieg eines Nutzers in eine bestehende Band über einen gültigen Einladungslink.
_Avoid_: Registrierung, Join Flow, Invite Accept

**Band verlassen**:
Der freiwillige Austritt eines Bandmitglieds aus einer Band aus eigener Entscheidung.
_Avoid_: Remove member, unsubscribe

**Band löschen**:
Das bewusste, bestätigungspflichtige Entfernen einer gesamten Band durch einen Admin.
_Avoid_: Reset, deactivate band

**Bandmitglied entfernen**:
Die Admin-Aktion, mit der ein anderes Mitglied aus einer Band entfernt wird; andere Admins dürfen entfernt werden, solange mindestens ein Admin verbleibt.
_Avoid_: Kick, ban, unsubscribe

**Setlist**:
Die geordnete Auswahl von Songs für einen konkreten Auftritt.
_Avoid_: Playlist, Songliste, Running Order

**Hauptinstrument**:
Das primäre Instrument eines Bandmitglieds, auch wenn zusätzlich weitere Instrumente gepflegt werden.
_Avoid_: Primary role, Main skill

**Kalender hinzufügen**:
Die Betriebssystem-Aktion, mit der ein einzelner Termin mit vorausgefüllten Daten an die persönliche Kalender-App übergeben wird.
_Avoid_: ICS-Export, Serienexport, Sync

**Terminänderung**:
Die markierte Anpassung eines bestehenden aktuellen oder zukünftigen Termins, sichtbar über Status und kurze Notiz statt über eine vollständige Historie, ohne bestehende Zusagen automatisch zu verändern.
_Avoid_: Audit log, version history

**Archivierter Song**:
Ein Song, der nicht mehr im Song-Voting auftaucht, aber erhalten bleibt und bei Bedarf wieder ins Voting zurückgeführt werden kann.
_Avoid_: Gelöschter Song, endgültig entfernter Song
