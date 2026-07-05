import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const eventKind = v.union(v.literal('rehearsal'), v.literal('performance'));
const repeat = v.union(v.literal('none'), v.literal('weekly'), v.literal('biweekly'), v.literal('monthly'));
const rsvpStatus = v.union(v.literal('yes'), v.literal('maybe'), v.literal('no'));
const bandRole = v.union(v.literal('admin'), v.literal('member'));

export default defineSchema({
  ...authTables,
  bands: defineTable({
    name: v.string(),
    createdBy: v.id('users'),
  }).index('by_createdBy', ['createdBy']),
  bandMembers: defineTable({
    bandId: v.id('bands'),
    userId: v.id('users'),
    role: bandRole,
  })
    .index('by_bandId', ['bandId'])
    .index('by_userId', ['userId'])
    .index('by_bandId_and_userId', ['bandId', 'userId']),
  events: defineTable({
    kind: eventKind,
    name: v.string(),
    dateTime: v.string(),
    location: v.string(),
    repeat,
    createdBy: v.id('users'),
    bandId: v.optional(v.id('bands')),
  })
    .index('by_dateTime', ['dateTime'])
    .index('by_createdBy_and_dateTime', ['createdBy', 'dateTime']),
  eventResponses: defineTable({
    eventId: v.id('events'),
    userId: v.id('users'),
    status: rsvpStatus,
    respondedAt: v.string(),
  })
    .index('by_eventId', ['eventId'])
    .index('by_eventId_and_userId', ['eventId', 'userId'])
    .index('by_userId_and_eventId', ['userId', 'eventId']),
});