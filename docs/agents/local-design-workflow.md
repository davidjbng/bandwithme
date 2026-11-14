> Update 2026-11-14: Tour Notes is now the active app, including shared songs, voting and setlists. See [the implementation and validation record](tour-notes-production.md). The incremental roadmap below is historical; recurrence series, calendar export and event editing remain future work.

# Lokaler Design- und Entwicklungsablauf

Stand: 14. November 2026. Tour Notes ist die vom Nutzer gewählte und als Grundlage übernommene Designrichtung. Die interaktive Referenz bleibt unter `/prototype`; die authentifizierten Produktflächen werden in den nächsten Schritten darauf umgestellt.

## Einmal einrichten, dann schnell iterieren

- Node 24.15+, pnpm laut `package.json`, Expo SDK 58.0.25. Versionen mit `expo install` auf SDK-Kompatibilität halten.
- `pnpm install --frozen-lockfile`, anschließend `pnpm ios` für den lokalen Dev Client. Bestehenden Simulator wiederverwenden.
- Danach reicht `pnpm start`: genau ein Metro auf localhost:8081 und derselbe installierte Dev Client. Native Pakete/SDK geändert: neu bauen. Nur TS/JS/Styles geändert: Fast Refresh.
- Metro vor Paketinstallationen stoppen und danach neu starten; sonst können alte Modulpfade und irreführende LogBox-Fehler stehen bleiben.
- Remote-Zugriff bleibt bei Bedarf separat über den erhaltenen `pnpm start:tunnel` möglich. Ein Tunnel ist kein Bestandteil der lokalen Simulator-Prüfung.
- Convex-Umgebung vor echten Schreibtests prüfen. Der Prototyp braucht keine Backend-Schreibzugriffe und bleibt klar als Demo erkennbar.

## Ein Feature pro überprüfbarem Schritt

1. Ausgangsstand und bestehende Aufrufer prüfen; die nächste vollständige Benutzerhandlung festlegen. Produktentscheidungen aus PRD und ADRs übernehmen.
2. Bestehende Komponenten/Logik verwenden. Tour Notes in `DESIGN.md` und der Referenz unter `/prototype` erhalten; neue UI direkt im Dev Client prüfen.
3. Verhalten auf der tatsächlichen Hermes-Laufzeit testen. Ein grüner Typecheck beweist keine Laufzeit-API-Unterstützung; `Array.toSorted()` ist hier beispielsweise nicht verfügbar. Kopie plus `sort()` erhält bestehende Arrays.
4. `pnpm typecheck`, `pnpm lint`, `pnpm test` und `pnpm test:design-demo`; bei Änderungen am Web-Verhalten zusätzlich Web-Export und passende Playwright-Tests. Kein wiederholter Volltest ohne neue Änderung oder offenen Befund.
5. Native Prüfung mit `agent-device`: öffnen, semantische Ziele aus dem Snapshot benutzen, Aktionen mit `--settle` und konkrete Erwartungen mit `wait` prüfen. Vor Texteingaben das Feld drücken und seinen Fokus prüfen; vor weiteren Eingaben stabile Layouts abwarten. Keine parallelen Agenten oder Automatisierungswerkzeuge auf demselben Simulator.
6. Für den reproduzierbaren Prototyp-Test erst die interaktive Sitzung mit `agent-device close` freigeben, dann `agent-device test e2e/native/design-demo.ad`. Der Dev Client muss bereits mit Metro verbunden sein und den Prototyp geöffnet haben. `.ad`-Dateien verwenden `open <bundle-id>` ohne das nur interaktiv gültige `--foreground`.
7. Screenshots nach beendetem Refresh aufnehmen, öffnen und auf Inhalt/Dateinamen prüfen. Auf dem Duo die tatsächlich aktive Anzeige beachten. Light/Dark, große Schrift und erreichbare Aktionen prüfen; anschließend Systemeinstellungen zurückstellen. Screenshots bleiben uncommittete Artefakte.
8. Gemäß aktueller `AGENTS.md` pro Aufgabe auf einem eigenen lokalen GitButler-Branch arbeiten und nur eigene zusammengehörige Änderungen committen. Kleine lokale Korrekturen in den passenden unveröffentlichten Commit aufnehmen; veröffentlichte Historie erhalten. Vor einer autorisierten Veröffentlichung `but pull` einschließlich Worktree-Updates ausführen, Konflikte unter Erhalt beider Absichten lösen und validieren. Anschließend nur den Aufgaben-Branch mit `but land <task-branch> --yes` auf `origin/main` landen; keine fremden Änderungen mitveröffentlichen.

## Nächste Umsetzung

| Reihenfolge | Ergebnis                                              | Abnahmekriterium                                                                                                                                         |
| ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1           | Tour Notes auf echte Übersicht und Termine übertragen | Echte Banddaten statt Fixtures; Auth/Einladungsflows bleiben erhalten; Laden/Fehler/Leerzustand; Zusage und Absage funktionieren im Dev Client.          |
| 2           | Termindomäne fertigstellen                            | Offene Antwort gemäß PRD; echte Detailseite; Änderungen/Absagen mit Notiz; Vergangenheit aus Standardliste; wiederkehrende Probe als erstklassige Serie. |
| 3           | Songs mit echtem Voting                               | Bandgebundene Songs mit einem Referenzlink; eine Stimme je Mitglied; Archivieren und Wiederherstellen; Zugriffstests.                                    |
| 4           | Setlists an echte Auftritte binden                    | Auswahl archiviert Voting-Kandidaten, erhält Referenzen und speichert Reihenfolge; mehrere Mitglieder sehen denselben Stand.                             |
| 5           | Kalender und Geräteabschluss                          | Kalender-Handoff für Einzeltermine mit vorausgefüllten Feldern; Fehler/Abbruch; echte Geräte- und Tablet-Prüfung sowie VoiceOver.                        |

Die bestehende Backend-Basis enthält bereits Bands, Mitgliedschaft, Einladungen, Einzeltermine und Antworten. Songs/Setlists sind noch keine Backend-Domänen. `repeat` ist aktuell ein Termin-Feld, keine eigenständige Serie. Das vorhandene Backend kennt `yes / maybe / no`, während das PRD `open / yes / no` vorsieht: vorhandene `maybe`-Daten vor einer Migration ausdrücklich berücksichtigen und die gewünschte Übernahme festlegen.

Erster nächster Arbeitsschritt: eine echte Probe vom Home-Screen öffnen, Teilnehmer sehen und die eigene Antwort ändern – vollständig im angenommenen Design, ohne den restlichen MVP gleichzeitig umzubauen.
