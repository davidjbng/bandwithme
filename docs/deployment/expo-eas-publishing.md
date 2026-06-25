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

## Aktueller Stand für Device-Tests

Die EAS-Umgebungswerte wurden jetzt auf ein **echtes Remote-Convex-Deployment** umgestellt:

- `CONVEX_DEPLOYMENT=dev/david-jebing`
- `EXPO_PUBLIC_CONVEX_URL=https://blissful-spaniel-445.eu-west-1.convex.cloud`
- `EXPO_PUBLIC_CONVEX_SITE_URL=https://blissful-spaniel-445.eu-west-1.convex.site`

Damit ist der **Client-/OTA-Pfad** jetzt korrekt auf Remote ausgerichtet und `eas update` konnte mit diesen EAS-Werten erneut erfolgreich veröffentlicht werden.

## Was noch nötig ist, damit Auth und Gerätetests vollständig sauber sind

1. **Convex-Server-Umgebung für Auth prüfen/setzen**
   - `convex/auth.config.ts` verwendet `CONVEX_SITE_URL`
   - `convex/auth.ts` verwendet für E-Mail-Magic-Links optional `SITE_URL`
   - für echte Magic-Link-Mails wird zusätzlich `AUTH_RESEND_KEY` oder `RESEND_API_KEY` in Convex benötigt

2. **Optional, aber empfohlen: ein Preview-/Development-Build für OTA-Tests**
   - damit veröffentlichte EAS Updates wirklich wie gedacht im Dev Client auf dem Gerät testbar sind

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
