---
name: Band With Me — Tour Notes
description: Native band planning with petrol, coral and quiet green-grey surfaces.
colors:
  background: "#EAF0ED"
  surface: "#F8FAF8"
  text: "#202E2D"
  secondary: "#526562"
  tint: "#164D4F"
  line: "#C7D4CE"
  accent: "#AD4937"
  soft: "#F3DCD4"
  hero: "#164D4F"
  on-hero: "#F8FAF8"
  hero-muted: "#C8DFD7"
  dark-background: "#141F1F"
  dark-surface: "#1F302F"
  dark-text: "#EEF4F0"
  dark-secondary: "#B0C4BC"
  dark-tint: "#B6DCD0"
  dark-line: "#3B514D"
  dark-accent: "#F0AA95"
  dark-soft: "#54372F"
  dark-hero: "#214C4D"
typography:
  display:
    fontFamily: system-ui
    fontSize: 34px
    fontWeight: 700
    lineHeight: 39px
    letterSpacing: -0.8px
  hero-title:
    fontFamily: system-ui
    fontSize: 30px
    fontWeight: 700
    lineHeight: 34px
    letterSpacing: -0.6px
  heading:
    fontFamily: system-ui
    fontSize: 22px
    fontWeight: 700
    lineHeight: 28px
    letterSpacing: -0.35px
  row-title:
    fontFamily: system-ui
    fontSize: 18px
    fontWeight: 600
    lineHeight: 25px
  body:
    fontFamily: system-ui
    fontSize: 17px
    lineHeight: 25px
  meta:
    fontFamily: system-ui
    fontSize: 14px
    lineHeight: 21px
rounded:
  search: 12px
  panel: 16px
  vote: 24px
spacing:
  detail: 4px
  small: 8px
  related: 12px
  row: 16px
  panel: 24px
  section: 28px
components:
  hero-panel:
    backgroundColor: "{colors.hero}"
    textColor: "{colors.on-hero}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  song-teaser:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.panel}"
    padding: 22px
  search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.search}"
    padding: 14px
  vote-selected:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.background}"
    rounded: "{rounded.vote}"
---

# Design System: Band With Me — Tour Notes

## Overview

**Creative North Star: "Tour Notes"**

Purposeful band planning with precise date columns, calm green-grey surfaces and petrol panels. Coral gives performances their own emphasis. The tone is friendly and direct, with German copy and people identified by names and instruments.

This documents the implemented development-only `/prototype` surface and `src/components/design-demo.tsx` on Expo SDK 58. It does not restyle the legacy authenticated app. Tokens were extracted from source and inspected in the SDK 58 development client on an iPhone Duo simulator (iOS 27.1), including light/dark appearance and large system text. Agent-device covers the core interaction flows. Physical hardware, VoiceOver and iPad are not verified.

**Key Characteristics:**

- Native navigation and controls, with system appearance.
- Spacious single-column planning and flat tonal panels.
- Explicit attendance text alongside colour and reversible actions.

## Colors

The light palette is green-grey, petrol and muted coral; dark mode preserves those roles with lighter text and accents.

### Primary

- **Petrol** (`tint`, `hero`): navigation, rehearsal emphasis and primary-control seed colour. Dark mode separates the light `dark-tint` from the deeper `dark-hero` panel.
- **Hero lettering** (`on-hero`, `hero-muted`): primary and supporting text on petrol panels; unchanged in dark mode.

### Secondary

- **Coral** (`accent`, `soft`): performance dates, gig introductions and the song-voting teaser. Dark mode uses `dark-accent` and `dark-soft`.

### Neutral

- **Green-grey ground** (`background`), **pale surface** (`surface`), **ink** (`text`), **muted ink** (`secondary`) and **divider** (`line`) establish the page and list hierarchy. Each has a corresponding `dark-` token.
- Member initials use fixed pastel identity colours from `demoMembers`; those fixture-specific colours are not an extended semantic palette.

**The Explicit State Rule.** Attendance and voting state must have text or symbols as well as colour.

## Typography

All text uses the native system font: SF on iOS, the platform default elsewhere. No display-font dependency or raster lettering is used. Frontmatter `px` values represent React Native logical units, not physical device pixels.

Display and hero titles are compact and bold; section headings step down to `heading`, list titles to `row-title`, ordinary copy to `body` and supporting detail to `meta`. Date numerals, vote counts and setlist numbering use tabular figures. Native header, tab, button and segmented-control typography remains platform-owned.

Keep text scaling enabled and allow wrapping; avoid fixed-height content panels.

## Layout

Pages are scrollable with automatic content insets. Content is a centred single column with a maximum width of 760 logical units, horizontal padding of 24, top padding of 16 and bottom padding of 120. Sections are separated by 28; related actions wrap with 12 between them.

Event rows use a fixed 48-unit date column, a flexible text column and a trailing chevron. Rows have 20 vertical padding; member and setlist rows use 18. This is a fluid layout with no custom breakpoint switch. Action groups and headings wrap for available space.

## Elevation & Depth

Custom surfaces are flat: tonal contrast and hairline list separators provide hierarchy. The prototype defines no custom shadow or animation tokens. Native controls and navigation retain system rendering and transitions; headers explicitly hide their shadow.

## Shapes

Hero panels, event introductions and the song teaser use restrained panel corners. Continuous corners are requested on those panels except the band introduction. Search fields are slightly tighter; vote controls are pill-shaped. Initial avatars are circles (32 in groups, 48 in member rows). Separators use `StyleSheet.hairlineWidth`, not a fixed CSS pixel.

## Components

### Buttons and attendance

`@expo/ui` supplies actual native `Button` controls inside `Host`, using filled or outlined variants, a height of 48 and horizontal padding of 16. Normal hosts receive the current tint as `seedColor`; hero hosts use muted hero lettering with dark appearance. Seed colours guide system styling; they are not guaranteed literal button-fill colours.

RSVP actions show “Bin dabei” / “Kann nicht” and become “Zugesagt” / “Abgesagt”. Selection changes the native variant, updates counts and exposes a reset action. Text actions have a minimum height of 44.

### Lists and voting

Event rows are pressable navigation with explicit accessible labels. Song rows show title, artist and duration; votes use a custom minimum 64 × 48 control with an up-arrow or selected checkmark and an accessible selected state. Setlist reorder buttons have minimum 44 × 48 targets, accessible direction labels and disabled endpoints. Pressed custom controls reduce opacity; no hover treatment is defined.

### Search and filtering

Search is a React Native `TextInput`, minimum height 48, with a hairline border and native editing behaviour. Event and song filters use `@expo/ui/community/segmented-control`, minimum height 44, adapting to light or dark appearance. Empty search results provide explanatory copy and a clear action.

### Navigation

Expo Router `NativeTabs` supplies Übersicht, Termine, Songs and Band with system symbols. Nested native stacks provide section titles and event detail navigation; the home header is inline while other sections use large native titles. Symbols come from `expo-symbols` / native-tab icon APIs, with SF names on iOS and Material names on Android. No raster assets ship.

## Do's and Don'ts

### Do:

- Do scope this system to `/prototype` until a broader redesign is authorized.
- Do preserve native controls, text scaling and accessible state labels.
- Do use the paired light/dark roles and explicit text for attendance state.
- Do keep fictional prototype changes local to the current session.

### Don't:

- Don't substitute HTML mock controls for native navigation or claim interaction parity.
- Don't introduce a display-font dependency, decorative imagery or custom shadows without a new design decision.
- Don't describe source inspection as completed native visual verification.
