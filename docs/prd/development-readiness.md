# Band With Me — Development Readiness

## Status

Die Produktdefinition für den MVP ist aktuell ausreichend geschärft, um mit der eigentlichen Web-first-Implementierung zu beginnen.

## Technisch verifiziert

- lokales Web-Setup läuft
- lokales Convex-Dev-Backend läuft
- Web-App ist unter `http://127.0.0.1:8081` erreichbar
- Browser-Checks auf `/`, `/termine` und `/user` liefen ohne Console-Errors

## Aktueller Ist-Zustand der App

- **Home (`/`)** ist noch weitgehend Expo-Starter-Inhalt
- **Termine (`/termine`)** hat bereits eine erste eigene Oberfläche
- **Profil (`/user`)** hat bereits eine erste Magic-Link-/Dev-Profil-Oberfläche
- Das Repo ist also **startbar**, aber noch klar im frühen Scaffold-/Prototype-Zustand

## Was für die Entwicklung nicht blockiert

Mit dem aktuellen Stand kann direkt begonnen werden mit:

1. App-Shell / Navigation umbauen
2. Onboarding (`Band erstellen` / `Band beitreten`)
3. Termin-Domäne und Serienmodell
4. Mitglieder-/Rollenmodell
5. Song-Voting- und Setlist-Domäne

## Was ich vom Nutzer noch brauche, um zügig und sauber weiterzubauen

### 1. Design-Freigabe für die erste Umsetzungsrichtung
Ich kann zwar schon losbauen, aber für konsistente UI-Entscheidungen brauche ich eine klare Vorab-Richtung, z. B.:
- `001-calm-cockpit` als Basis
- oder Hybrid aus `001` + `003`

### 2. Entscheidung, ob Magic-Link-E-Mails in der Entwicklung real versendet werden sollen
Im Code ist erkennbar:
- ohne gesetzten Resend-Key kann der Magic-Link lokal geloggt werden
- für echte Mail-Zustellung wird ein Resend-Key benötigt

Falls echte Mails im Dev-Flow gewünscht sind, brauche ich:
- `AUTH_RESEND_KEY` oder `RESEND_API_KEY` in der Convex-Umgebung

### 3. Spätere echte Gerätevalidierung für Betriebssystem-Kalenderintegration
Die Web-first-Entwicklung kann beginnen, aber das Verhalten von
- „Zum Kalender hinzufügen“
- nativen Kalender-Integrationen

muss später auf echten Geräten / Expo Go / Dev Build überprüft werden.

### 4. Falls echte Banddaten statt Demo-/Dev-Daten gewünscht sind
Dann brauche ich entweder:
- Seed-Daten-Vorgaben
- oder Freigabe, sinnvolle Demo-Daten selbst anzulegen

## Aktuell wichtigste offene Nicht-Blocker
Diese Punkte blockieren die Entwicklung nicht, können aber später noch UX-seitig konkretisiert werden:
- sichtbarer Archiv-Bereich für Songs oder nur implizite Archivierung
- spätere Benachrichtigungsstrategie bei Terminänderungen
- mögliche spätere UI für Multi-Band-Wechsel
- mögliche spätere Proben-Titel oder feinere Terminmetadaten

## Empfehlung für den nächsten Schritt

1. Designrichtung kurz bestätigen
2. Feature-/Epic-Breakdown schreiben
3. mit Foundation + Onboarding + Termine starten
