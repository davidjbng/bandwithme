# Band With Me

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Band members coordinating rehearsals, performances, song choices and attendance. Admins manage invitations and membership. The first audience is David's own band.

## Product Purpose

Make the next rehearsal, attendance and gig preparation clear in seconds, instead of spreading them across chats, calendars and notes.

## Capabilities and Constraints

The product plan in `docs/prd/bandwithme-prd.md` defines events, rehearsal series, open/yes/no RSVPs, song voting, archiving, performance-bound ordered setlists, profiles and invitation-based membership. No chat, money management or push reminders in V1. Existing Expo 58 / React Native app with Convex backend; web, phone and tablet are product targets.

This design exploration is an interactive local prototype with clearly labelled fictional band data. Prototype state is in memory, never written to Convex. The user authorized free visual exploration and core-flow prototyping on 2026-11-14. It is not a request to implement the full backend roadmap.

## Brand Commitments

Product name: Band With Me. German interface, friendly and direct. No existing visual direction was made binding; the user explicitly chose free design exploration.

## Evidence on Hand

`docs/prd/bandwithme-prd.md`, `docs/prd/implementation-breakdown.md`, `docs/adr/` and the existing app. Demonstration member names, events and song selections are fictional examples, not real band records.

## Product Principles

- Show the next useful action immediately.
- Distinguish rehearsals from performances without creating separate planning systems.
- Keep open attendance visible and decisions reversible.
- Songs move from voting into a specific performance's setlist; archiving preserves references.
- Respect native navigation, accessibility and the member's system appearance.
