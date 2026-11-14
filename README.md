# Band With Me

Expo SDK 58, React Native and Convex. Product scope: [PRD](docs/prd/bandwithme-prd.md).

## Local development

Use Node 24.15+ and the pinned pnpm version from `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm ios
```

`pnpm ios` builds and installs the Expo development client on an existing iOS simulator. A native rebuild is required after an Expo SDK or native dependency change. Generated `ios/` and `android/` directories stay uncommitted.

For subsequent JavaScript changes, reuse the installed client:

```sh
pnpm start
```

Metro runs on localhost, normally port 8081. Press `i` to open the client. The regular app uses the Convex configuration from `.env.local`; configure a development backend before exercising authenticated flows. Never commit environment secrets.

## Interactive design prototype

In a development build, choose **Design-Prototyp öffnen** on Home, or open `/prototype` through the `bandwithme://prototype` deep link after connecting the client to Metro.

The selected **Tour Notes** design includes:

- a band overview with reversible rehearsal attendance;
- chronological, filterable rehearsal and performance lists;
- song search, voting and an archive with restore;
- a performance detail with notes and an ordered setlist;
- a member roster and demo reset.

All data is fictional and changes last only for the current session. Selecting a song for the Stadtgarten performance archives it from voting while retaining its setlist reference. The prototype makes no Convex writes and is disabled in production builds. Authentication, real calendar handoff, new-event/song forms and persistent backend behavior remain in their existing implementation or product plan.

Design decisions live in [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md) and `.impeccable/surfaces/`.

## Checks

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:design-demo
```

The existing Playwright suite needs the local web app and development Convex backend. Native prototype checks use `agent-device` with an installed local development client; run `agent-device test e2e/native/design-demo.ad` after connecting the client to Metro and opening the prototype.

Next implementation slices and the agreed local workflow: [Local design workflow](docs/agents/local-design-workflow.md).
