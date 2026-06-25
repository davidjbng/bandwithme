# Expo / EAS publishing status

## Was bereits verifiziert wurde

### Expo-Projekt / Owner
- Das lokale Projekt ist jetzt auf das aktuelle EAS-Projekt unter `@davidjbng/bandwithme` ausgerichtet.
- `app.json` wurde auf die aktuelle Projekt-ID und Update-URL konfiguriert.
- `expo-updates` wurde installiert und EAS Update wurde lokal konfiguriert.

### Erfolgreich getestete EAS-Updates
Es wurden erfolgreiche OTA-Updates auf den EAS-Branch `main` veröffentlicht.

Verifiziert wurden dabei:
- Auth mit vorhandenem `EXPO_TOKEN`
- Export/Bundling für iOS und Android
- Upload der Bundles
- Veröffentlichung auf EAS Update

### GitHub Actions
Es gibt jetzt einen Workflow unter:
- `.github/workflows/eas-update.yml`

Dieser Workflow veröffentlicht bei jedem Push auf `main` automatisch ein EAS Update auf den Branch `main`.

## Wichtige Einschränkung

### Expo Go vs. EAS Update
Der Workflow veröffentlicht **EAS Updates**. Diese sind der richtige Weg für:
- Development Builds
- Preview-/Internal Builds
- echte Standalone-Builds

Für **Expo Go** ist das aber **nicht dieselbe Test-Story** wie bei einem echten Build, der an einen EAS-Branch/Kanal gebunden ist.

Praktisch heißt das:
- **schnelles lokales Testen mit Expo Go** → weiter über `expo start`
- **OTA-Testing des gepushten Main-Stands** → sinnvoller mit einem Development Build / Preview Build

## Aktueller echter Blocker für Device-Tests

Die aktuell hinterlegten Convex-EAS-Umgebungswerte zeigen noch auf eine **lokale / anonyme Entwicklungsumgebung**.

Das reicht zum erfolgreichen Publishen eines Updates, ist aber **nicht gut genug für echte Gerätetests außerhalb dieses Rechners**, weil lokale Host-URLs auf einem externen Gerät nicht erreichbar sind.

## Was noch nötig ist, damit Main-Pushes auf Geräten wirklich sinnvoll testbar sind

1. **Remote Convex Deployment statt lokaler anonymer Dev-Instanz**
   - aktuell fehlt ein angemeldeter Convex-Account / echtes Remote-Deployment
   - `convex deployment create ...` schlägt in anonymous mode fehl

2. **Dann EAS-Env-Werte auf die Remote-Convex-URLs umstellen**
   - `CONVEX_DEPLOYMENT`
   - `EXPO_PUBLIC_CONVEX_URL`
   - `EXPO_PUBLIC_CONVEX_SITE_URL`

3. **Optional, aber empfohlen: ein Preview-/Development-Build für OTA-Tests**
   - damit veröffentlichte EAS Updates wirklich wie gedacht auf dem Gerät testbar sind

## Kurzfazit

### Ja, funktioniert bereits
- Expo-Account / EXPO_TOKEN funktioniert
- Projekt ist an das aktuelle EAS-Projekt gebunden
- OTA-Publish per `eas update` funktioniert lokal
- GitHub-Workflow für automatische Main-Push-Updates ist angelegt

### Noch nicht vollständig produktiv für Gerätetests
- Backend zeigt noch auf lokale Convex-URLs
- Für echtes OTA-Testen auf Gerät ist ein Remote-Convex-Deployment nötig
- Für den besten Flow statt Expo Go eher ein Development Build / Preview Build
