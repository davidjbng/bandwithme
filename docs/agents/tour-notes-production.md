# Tour Notes becomes the active app

Approved scope (2026-11-14): promote the existing Tour Notes prototype, including real shared songs, voting and performance setlists. DESIGN.md is the visual reference. Keep verified authentication, onboarding, invitation membership and private feedback. No database reset, release or new dependency.

## Implementation decisions

- Four tabs: Übersicht, Termine, Songs, Band. Profile and private feedback are reached from Band; old /user links continue working.
- Reuse the prototype's palette, typography, panels, date columns, native controls and responsive layout. Fictional data remains exclusively in the development prototype.
- Upcoming events use actual dates and the viewer's band. Event detail lists current members' yes/no/open attendance; resetting removes a response. Legacy maybe responses display as open without discarding stored data.
- Songs have title, artist, duration and one optional HTTP(S) reference. Each current member has at most one vote per song. Archived songs can return to voting.
- Select a particular performance before adding a song. Adding archives its voting candidate but keeps votes and all existing setlist references. Setlist order is stored per performance. Reordering and removal are reversible and server-authorized; no hard deletion of songs.
- All shared reads and writes check current band membership server-side. Requests for other bands' IDs fail. Bounded collections have explicit user-visible capacity errors rather than silent loss.
- Existing event creation and repeat metadata remain available. Full recurrence-series generation, event cancellation/editing and calendar export belong to the separate PRD roadmap, not to the interactive prototype being promoted.

## Work and verification

1. Add band-scoped song/vote/setlist storage and tests, and real event details/reset attendance.
2. Extract shared Tour Notes presentation; replace active screens and navigation, retain auth/onboarding/admin flows.
3. Add song creation, performance selection, shared ordered setlists, loading/empty/error states and member display.
4. Verify TypeScript, lint, backend authorization/behavior tests, browser navigation and production export. Inspect mobile/desktop light/dark renders. Record any unavailable physical-device or live multi-account checks explicitly.
5. Check in a feature changeset and local task commit with GitButler. Preserve the unrelated icon branch.

## Verification record

- `pnpm check` passes formatting, lint and native TypeScript checks; `pnpm test` passes **45 tests**. Backend cases use real Convex Auth 2 test sessions and exercise cross-band isolation, idempotent voting, archive/restore/reference preservation, ordered setlists, RSVP reset, legacy maybe-as-open and capacity guards.
- Web production export succeeds; all **10 production smoke tests** pass on desktop and mobile Chrome. Tab tests wait for the target URL before interacting with the destination.
- Development browser coverage reaches **56 passing cases with two explicit fixture skips** across the full run and the targeted recheck. The full serial run had one Expo development SSR “unknown module” error; its isolated recheck passed. Earlier parallel/cold Metro attempts hit the same intermittent module-cache issue. The two skips require a separate disposable backend and verified credentials; no such credentials were supplied.
- New browser flows intercept all Convex HTTP/WebSocket traffic with a test-only transport fixture. They drive the actual production screens through attendance, voting, archive, song creation, performance selection, setlist reorder/reload, profile navigation, dark appearance and missing-event recovery. These are UI integration checks, not evidence of a live two-device account session.
- Mobile and desktop light/dark screenshots were inspected. Local evidence is in `/tmp/bwm-tour-verification/`; no screenshots or test records are committed. Backend functions were deployed to the existing **development** deployment; no data reset or release was performed.
- A builder check and independent standards/spec reviews completed. Findings were fixed and re-reviewed: event capacity, safe capacity-error display, shared member hydration, large-text date columns and readable repeat metadata.
- Native runtime verification remains open: agent-device reached the existing iPhone Duo simulator, but the system “Open in bandwithme?” dialog did not respond to accept/dismiss or a fresh app session. The automation session was closed; no simulator was created, erased or shut down. Do not claim native runtime, physical-device, VoiceOver or live multi-account verification from this work.

## Current limits

Up to 200 stored events (including past events), 200 band members, 500 songs, 5000 stored votes per band and 200 songs per setlist. Creation/join/add operations reject overflow before changing data. Band deletion retains the pre-existing semantics: it removes the band and memberships; orphaned historical records are inaccessible through the new membership-checked APIs. No new hard-delete flow for songs is exposed.
