import { repeatLabels } from "@/lib/events";
import SegmentedControl from "@expo/ui/community/segmented-control";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import {
  useWindowDimensions,
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useTourTheme } from "@/constants/tour-theme";
import { durationLabel, eventDate, initials, parseDuration } from "@/lib/tour-format";
import { Action, Copy, Icon, Meta, Page, SectionHeading, s } from "./tour-ui";

type Event = NonNullable<FunctionReturnType<typeof api.termine.detail>>;
type Song = FunctionReturnType<typeof api.songs.list>[number];

function useWrite() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function run(write: () => Promise<unknown>) {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await write();
      return true;
    } catch (cause) {
      setError(
        cause instanceof ConvexError && typeof cause.data === "string"
          ? cause.data
          : "Das hat nicht geklappt. Bitte prüfe deine Verbindung und versuche es erneut.",
      );
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run };
}
function WriteError({ error }: { error: string | null }) {
  const { colors } = useTourTheme();
  return error ? (
    <Copy accessibilityRole="alert" style={{ color: colors.accent }}>
      {error}
    </Copy>
  ) : null;
}
function Loading() {
  return (
    <Page>
      <ActivityIndicator accessibilityLabel="Banddaten werden geladen" />
      <Meta>Deine Band wird geladen …</Meta>
    </Page>
  );
}

function BandGate({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.user.current, isAuthenticated ? {} : "skip");
  const band = useQuery(api.bands.myBand, isAuthenticated ? {} : "skip");
  const router = useRouter();
  if (isLoading || (isAuthenticated && (user === undefined || band === undefined)))
    return <Loading />;
  if (!isAuthenticated || !user) return <Redirect href="/sign-in" />;
  if (!user.name) return <Redirect href="/onboarding/profile" />;
  if (!band)
    return (
      <Page>
        <Copy accessibilityRole="header" style={s.display}>
          Dein Sound.{"\n"}Eure Band.
        </Copy>
        <Copy>Hallo {user.name}. Gründe eure Band oder komm über eine Einladung dazu.</Copy>
        <Action label="Band erstellen" onPress={() => router.push("/onboarding/create")} />
        <Action label="Band beitreten" onPress={() => router.push("/onboarding/join")} secondary />
        <Action label="Profil & Ideen" onPress={() => router.push("/user")} secondary />
      </Page>
    );
  return children;
}
function today() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}
function useToday() {
  const [from, setFrom] = useState(today);
  useEffect(() => {
    const timer = setInterval(() => setFrom(today()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return from;
}
function useEvents() {
  const from = useToday();
  return useQuery(api.termine.list, { from });
}
function People({ hero = false }: { hero?: boolean }) {
  const { colors } = useTourTheme();
  const members = useQuery(api.bands.listMembers);
  return (
    <View style={s.people} accessibilityLabel={members?.map((member) => member.name).join(", ")}>
      {members?.slice(0, 8).map((member) => (
        <View key={member.userId} style={[s.avatar, { backgroundColor: "#C2DDD8" }]}>
          <Text style={s.initials}>{initials(member.name)}</Text>
        </View>
      ))}
      <Meta style={hero && { color: colors.heroMuted }}>
        {members?.length ?? "…"} in eurer Runde.
      </Meta>
    </View>
  );
}
function Rsvp({ event, hero = false }: { event: Event; hero?: boolean }) {
  const { colors } = useTourTheme();
  const user = useQuery(api.user.current);
  const respond = useMutation(api.termine.setResponse);
  const { run, busy, error } = useWrite();
  const answer = event.viewerResponse;
  function set(status: "yes" | "no" | "open") {
    if (user) void run(() => respond({ userId: user.id, eventId: event.id, status }));
  }
  return (
    <View style={s.rsvp}>
      <Meta style={hero && { color: colors.heroMuted }} testID="attendance-count">
        {event.responseCounts.yes} dabei · {event.responseCounts.no} abgesagt ·{" "}
        {event.responseCounts.open} offen
      </Meta>
      <View style={s.actions}>
        <Action
          hero={hero}
          disabled={busy || !user}
          label={answer === "yes" ? "Zugesagt" : "Bin dabei"}
          secondary={answer === "no"}
          onPress={() => set("yes")}
        />
        <Action
          hero={hero}
          disabled={busy || !user}
          label={answer === "no" ? "Abgesagt" : "Kann nicht"}
          secondary={answer !== "no"}
          onPress={() => set("no")}
        />
      </View>
      {answer && (
        <Action
          label="Antwort zurücksetzen"
          hero={hero}
          secondary
          disabled={busy}
          onPress={() => set("open")}
        />
      )}
      {error && (
        <Copy accessibilityRole="alert" style={{ color: hero ? colors.onHero : colors.accent }}>
          {error}
        </Copy>
      )}
    </View>
  );
}
function EventRow({ event }: { event: Event }) {
  const { fontScale } = useWindowDimensions();
  const { colors } = useTourTheme();
  const router = useRouter();
  const date = eventDate(event.dateTime);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${date.date}, Details öffnen`}
      onPress={() => router.push({ pathname: "/event", params: { id: event.id } })}
      style={({ pressed }) => [
        s.eventRow,
        { borderColor: colors.line, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={[s.date, { width: 48 * Math.max(1, fontScale) }]}>
        <Copy
          style={[s.day, { color: event.kind === "performance" ? colors.accent : colors.tint }]}
        >
          {date.day}
        </Copy>
        <Meta style={s.month}>{date.month}</Meta>
      </View>
      <View style={s.rowContent}>
        <View style={s.inline}>
          <Meta>{event.kind === "performance" ? "Auftritt" : "Probe"}</Meta>
          <Meta>
            {event.viewerResponse === "yes"
              ? "Zugesagt"
              : event.viewerResponse === "no"
                ? "Abgesagt"
                : "Antwort offen"}
          </Meta>
        </View>
        <Copy style={s.rowTitle}>{event.name}</Copy>
        <Meta>
          {date.time} · {event.location}
        </Meta>
      </View>
      <Icon
        name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
        size={16}
      />
    </Pressable>
  );
}

export function TourHome() {
  return (
    <BandGate>
      <Home />
    </BandGate>
  );
}
function Home() {
  const { colors } = useTourTheme();
  const router = useRouter();
  const band = useQuery(api.bands.myBand);
  const events = useEvents();
  const songs = useQuery(api.songs.list);
  if (!events || !songs) return <Loading />;
  const next = events[0];
  const date = next && eventDate(next.dateTime);
  const candidates = songs.filter((song) => !song.archived).length;
  return (
    <Page>
      <View style={s.intro}>
        <Copy accessibilityRole="header" style={s.display}>
          Guter Takt.{"\n"}Gute Leute.
        </Copy>
        <Meta>{band?.name}</Meta>
      </View>
      <View style={[s.hero, { backgroundColor: colors.hero }]}>
        <Copy style={[s.heroDate, { color: colors.heroMuted }]}>
          {date?.date ?? "Platz für euren nächsten Termin"}
        </Copy>
        <Copy accessibilityRole="header" style={[s.heroTitle, { color: colors.onHero }]}>
          {next?.name ?? "Wann spielen wir wieder?"}
        </Copy>
        {next && (
          <Copy style={{ color: colors.onHero }}>
            {date?.time} · {next.location}
          </Copy>
        )}
        <People hero />
        {next ? (
          <>
            <Rsvp event={next} hero />
            <Action
              hero
              secondary
              label="Termindetails öffnen"
              onPress={() => router.push({ pathname: "/event", params: { id: next.id } })}
            />
          </>
        ) : (
          <Action hero label="Termin erstellen" onPress={() => router.push("/termine/create")} />
        )}
      </View>
      {events.length > 1 && (
        <View>
          <SectionHeading>Als Nächstes</SectionHeading>
          {events.slice(1, 4).map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/songs")}
        style={({ pressed }) => [
          s.songTeaser,
          { backgroundColor: colors.soft, opacity: pressed ? 0.65 : 1 },
        ]}
      >
        <View style={s.rowContent}>
          <Copy style={[s.heading, { color: colors.accent }]}>Was spielen wir?</Copy>
          <Copy style={{ color: colors.accent }}>
            {candidates
              ? `${candidates} Songideen. Deine Stimme zählt.`
              : "Eure nächste Songidee wartet auf dich."}
          </Copy>
        </View>
        <Icon
          name={{ ios: "arrow.up.right", android: "north_east", web: "north_east" }}
          color={colors.accent}
          size={24}
        />
      </Pressable>
      <Meta style={s.footnote}>Band With Me · Zusammen klingt’s besser.</Meta>
    </Page>
  );
}
export function TourEvents() {
  return (
    <BandGate>
      <Events />
    </BandGate>
  );
}
function Events() {
  const events = useEvents();
  const router = useRouter();
  const { dark } = useTourTheme();
  const [filter, setFilter] = useState(0);
  if (!events) return <Loading />;
  const visible = events.filter(
    (event) => filter === 0 || event.kind === (filter === 1 ? "rehearsal" : "performance"),
  );
  return (
    <Page>
      <Meta>Euer nächster gemeinsamer Takt.</Meta>
      <Action label="Termin erstellen" onPress={() => router.push("/termine/create")} />
      <SegmentedControl
        values={["Alle", "Proben", "Auftritte"]}
        selectedIndex={filter}
        onChange={(event) => setFilter(event.nativeEvent.selectedSegmentIndex)}
        appearance={dark ? "dark" : "light"}
        style={s.segment}
      />
      <View>
        <SectionHeading>Ab heute</SectionHeading>
        {visible.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
        {!visible.length && <Meta>Noch kein Termin. Plant euren nächsten gemeinsamen Moment.</Meta>}
      </View>
    </Page>
  );
}
function Reference({ url }: { url?: string }) {
  const { run, error } = useWrite();
  if (!url) return null;
  return (
    <>
      <Action
        label="Song-Link öffnen"
        secondary
        onPress={() => {
          void run(() => Linking.openURL(url));
        }}
      />
      <WriteError error={error} />
    </>
  );
}
function SongRow({
  song,
  eventId,
  selected,
}: {
  song: Song;
  eventId?: Id<"events">;
  selected: boolean;
}) {
  const { colors } = useTourTheme();
  const vote = useMutation(api.songs.setVote);
  const archive = useMutation(api.songs.archive);
  const add = useMutation(api.songs.addToSetlist);
  const { run, busy, error } = useWrite();
  return (
    <View style={[s.songRow, { borderColor: colors.line }]}>
      <View style={s.songTop}>
        <View style={s.rowContent}>
          <Copy style={s.rowTitle}>{song.title}</Copy>
          <Meta>
            {song.artist} · {durationLabel(song.duration)}
          </Meta>
        </View>
        {!song.archived && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${song.title}: ${song.voted ? "Stimme zurücknehmen" : "abstimmen"}, ${song.votes} Stimmen`}
            accessibilityState={{ selected: song.voted, disabled: busy }}
            disabled={busy}
            onPress={() => {
              void run(() => vote({ songId: song._id, voted: !song.voted }));
            }}
            style={({ pressed }) => [
              s.vote,
              {
                backgroundColor: song.voted ? colors.tint : colors.surface,
                opacity: busy || pressed ? 0.6 : 1,
              },
            ]}
          >
            <Icon
              name={{
                ios: song.voted ? "checkmark" : "arrow.up",
                android: song.voted ? "check" : "arrow_upward",
                web: song.voted ? "check" : "arrow_upward",
              }}
              color={song.voted ? colors.background : colors.tint}
              size={17}
            />
            <Copy style={[s.voteCount, { color: song.voted ? colors.background : colors.tint }]}>
              {song.votes}
            </Copy>
          </Pressable>
        )}
      </View>
      <View style={[s.actions, { marginTop: 12 }]}>
        {eventId && (
          <Action
            label={selected ? "In dieser Setlist" : "Zur Setlist hinzufügen"}
            secondary
            disabled={busy || selected}
            onPress={() => {
              void run(() => add({ eventId, songId: song._id }));
            }}
          />
        )}
        <Action
          label={song.archived ? "Zurück ins Voting" : "Archivieren"}
          secondary
          disabled={busy}
          onPress={() => {
            void run(() => archive({ songId: song._id, archived: !song.archived }));
          }}
        />
        <Reference url={song.reference} />
      </View>
      <WriteError error={error} />
    </View>
  );
}
export function TourSongs() {
  const params = useLocalSearchParams<{ event?: string }>();
  return (
    <BandGate>
      <Songs key={params.event ?? "all"} />
    </BandGate>
  );
}
function Songs() {
  const { colors, dark } = useTourTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ event?: string }>();
  const [picked, setPicked] = useState<string | undefined>();
  const songs = useQuery(api.songs.list);
  const events = useEvents();
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState("");
  const performances = events?.filter((event) => event.kind === "performance") ?? [];
  // An explicit choice prevents adding to the wrong gig when several are planned.
  const chosen = performances.find((event) => event.id === (picked ?? params.event));
  const setlist = useQuery(api.songs.setlist, chosen ? { eventId: chosen.id } : "skip");
  if (!songs || !events) return <Loading />;
  const visible = songs
    .filter(
      (song) =>
        song.archived === (filter === 1) &&
        `${song.title} ${song.artist}`
          .toLocaleLowerCase("de")
          .includes(search.trim().toLocaleLowerCase("de")),
    )
    // oxlint-disable-next-line unicorn/no-array-sort -- filter makes a copy; Hermes lacks toSorted.
    .sort((a, b) => b.votes - a.votes);
  return (
    <Page>
      <Meta>Gute Ideen werden euer nächster Song.</Meta>
      <Action label="Song vorschlagen" onPress={() => router.push("/song-create")} />
      <View>
        <SectionHeading>Für welchen Auftritt?</SectionHeading>
        {performances.length ? (
          <View style={s.actions}>
            {performances.map((event) => (
              <Action
                key={event.id}
                label={`${event.name} · ${eventDate(event.dateTime).day}. ${eventDate(event.dateTime).month}`}
                secondary={chosen?.id !== event.id}
                onPress={() => setPicked(event.id)}
              />
            ))}
          </View>
        ) : (
          <>
            <Meta>Legt einen Auftritt an, um gemeinsam seine Setlist zu planen.</Meta>
            <Action
              label="Auftritt planen"
              secondary
              onPress={() => router.push("/termine/create")}
            />
          </>
        )}
        {chosen && (
          <Action
            label={`Setlist für ${chosen.name} öffnen`}
            secondary
            onPress={() => router.push({ pathname: "/event", params: { id: chosen.id } })}
          />
        )}
      </View>
      <SegmentedControl
        values={["Im Voting", "Archiv"]}
        selectedIndex={filter}
        onChange={(event) => setFilter(event.nativeEvent.selectedSegmentIndex)}
        appearance={dark ? "dark" : "light"}
        style={s.segment}
      />
      <TextInput
        accessibilityLabel="Songs durchsuchen"
        placeholder="Song oder Artist suchen"
        placeholderTextColor={colors.secondary}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={[
          s.search,
          { color: colors.text, backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      />
      <View>
        <SectionHeading aside={`${visible.length} Songs`}>
          {filter ? "Für später aufgehoben" : "Eure Ideen"}
        </SectionHeading>
        {visible.map((song) => (
          <SongRow
            key={song._id}
            song={song}
            eventId={setlist ? chosen?.id : undefined}
            selected={setlist?.some((entry) => entry._id === song._id) ?? false}
          />
        ))}
        {!visible.length && (
          <View style={s.empty}>
            <Copy style={s.heading}>
              {search
                ? "Kein Treffer."
                : filter
                  ? "Noch nichts im Archiv."
                  : "Was wollt ihr spielen?"}
            </Copy>
            <Meta>
              {search
                ? "Versuch einen anderen Titel oder Artist."
                : filter
                  ? "Archivierte Songs bleiben hier erhalten."
                  : "Schlage euren ersten Song vor – alle in der Band können abstimmen."}
            </Meta>
            {search && <Action label="Suche leeren" secondary onPress={() => setSearch("")} />}
          </View>
        )}
      </View>
      <Meta>
        Die Auswahl für eine Setlist wandert ins Archiv. Der Song und seine Stimmen bleiben
        erhalten.
      </Meta>
    </Page>
  );
}

export function TourEvent() {
  return (
    <BandGate>
      <EventDetail />
    </BandGate>
  );
}
function EventDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const event = useQuery(api.termine.detail, { eventId: id ?? "" });
  const { colors } = useTourTheme();
  const router = useRouter();
  if (event === undefined) return <Loading />;
  if (!event)
    return (
      <Page>
        <Copy style={s.heading}>Termin nicht gefunden.</Copy>
        <Meta>Der Link ist ungültig oder der Termin gehört nicht zu deiner Band.</Meta>
        <Action label="Zu euren Terminen" onPress={() => router.replace("/termine")} />
      </Page>
    );
  const date = eventDate(event.dateTime);
  return (
    <Page>
      <Stack.Screen
        options={{ title: event.kind === "performance" ? "Euer Auftritt" : "Eure Probe" }}
      />
      <View
        style={[
          s.eventIntro,
          { backgroundColor: event.kind === "performance" ? colors.soft : colors.surface },
        ]}
      >
        <Copy
          accessibilityRole="header"
          style={[s.display, { color: event.kind === "performance" ? colors.accent : colors.tint }]}
        >
          {event.name}
        </Copy>
        <Copy>{date.date}</Copy>
        <Copy>{date.time}</Copy>
        <Meta>{event.location}</Meta>
      </View>
      <View>
        <SectionHeading>Wer ist dabei?</SectionHeading>
        <Rsvp event={event} />
        {(["yes", "no", "open"] as const).map((status) => (
          <View key={status} style={{ marginTop: 16 }}>
            <Copy style={s.rowTitle}>
              {status === "yes" ? "Dabei" : status === "no" ? "Abgesagt" : "Noch offen"}
            </Copy>
            <Meta>
              {event.participants[status].map((member) => member.name).join(", ") || "Noch niemand"}
            </Meta>
          </View>
        ))}
      </View>
      <View>
        <SectionHeading>Gut zu wissen</SectionHeading>
        <Copy>{event.note || "Noch keine Notiz zu diesem Termin."}</Copy>
        {event.repeat !== "none" && (
          <Meta>
            Probenrhythmus: {repeatLabels[event.repeat]}. Weitere Termine bitte einzeln anlegen.
          </Meta>
        )}
      </View>
      {event.kind === "performance" && <Setlist event={event} />}
    </Page>
  );
}
function Setlist({ event }: { event: Event }) {
  const list = useQuery(api.songs.setlist, { eventId: event.id });
  const move = useMutation(api.songs.move);
  const remove = useMutation(api.songs.removeFromSetlist);
  const { colors } = useTourTheme();
  const router = useRouter();
  const { run, busy, error } = useWrite();
  if (!list) return <Meta>Setlist wird geladen …</Meta>;
  return (
    <View>
      <SectionHeading
        aside={`${list.length} Songs · ${durationLabel(list.reduce((sum, song) => sum + song.duration, 0))} min`}
      >
        Eure Setlist
      </SectionHeading>
      <Meta>Für {event.name} · Reihenfolge gemeinsam planen.</Meta>
      {list.map((song, index) => (
        <View key={song._id} style={{ borderBottomColor: colors.line, borderBottomWidth: 1 }}>
          <View style={[s.setlistRow, { borderBottomWidth: 0 }]}>
            <Copy style={[s.trackNumber, { color: colors.accent }]}>
              {String(index + 1).padStart(2, "0")}
            </Copy>
            <View style={s.rowContent}>
              <Copy style={s.rowTitle}>{song.title}</Copy>
              <Meta>
                {song.artist} · {durationLabel(song.duration)}
              </Meta>
            </View>
            <View style={s.reorder}>
              {([-1, 1] as const).map((direction) => {
                const disabled =
                  busy || (direction === -1 ? index === 0 : index === list.length - 1);
                return (
                  <Pressable
                    key={direction}
                    accessibilityRole="button"
                    accessibilityLabel={`${song.title} nach ${direction === -1 ? "oben" : "unten"}`}
                    accessibilityState={{ disabled }}
                    disabled={disabled}
                    onPress={() => {
                      void run(() => move({ eventId: event.id, songId: song._id, direction }));
                    }}
                    style={({ pressed }) => [
                      s.iconAction,
                      { opacity: disabled ? 0.25 : pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Icon
                      name={{
                        ios: direction === -1 ? "arrow.up" : "arrow.down",
                        android: direction === -1 ? "arrow_upward" : "arrow_downward",
                        web: direction === -1 ? "arrow_upward" : "arrow_downward",
                      }}
                      size={18}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={[s.actions, { paddingBottom: 12 }]}>
            <Reference url={song.reference} />
            <Action
              secondary
              disabled={busy}
              label={`${song.title} aus Setlist nehmen`}
              onPress={() => {
                void run(() => remove({ eventId: event.id, songId: song._id }));
              }}
            />
          </View>
        </View>
      ))}
      {!list.length && (
        <Meta>Noch keine Songs ausgewählt. Holt eure Favoriten aus dem Voting dazu.</Meta>
      )}
      <WriteError error={error} />
      <View style={{ paddingTop: 20 }}>
        <Action
          label="Songs auswählen"
          onPress={() => router.push({ pathname: "/songs", params: { event: event.id } })}
          secondary
        />
      </View>
    </View>
  );
}
export function TourBand() {
  return (
    <BandGate>
      <Band />
    </BandGate>
  );
}
function Band() {
  const band = useQuery(api.bands.myBand);
  const user = useQuery(api.user.current);
  const members = useQuery(api.bands.listMembers);
  const { colors } = useTourTheme();
  const router = useRouter();
  if (!members) return <Loading />;
  return (
    <Page>
      <View style={[s.bandIntro, { backgroundColor: colors.hero }]}>
        <Icon
          name={{ ios: "music.note.house", android: "music_note", web: "music_note" }}
          color={colors.heroMuted}
          size={36}
        />
        <Copy accessibilityRole="header" style={[s.display, { color: colors.onHero }]}>
          {band?.name}
        </Copy>
        <Copy style={{ color: colors.heroMuted }}>
          {members.length} Leute. Ein gemeinsamer Sound.
        </Copy>
      </View>
      <View>
        <SectionHeading aside={`${members.length} Mitglieder`}>Die Band</SectionHeading>
        {members.map((member) => (
          <View key={member.userId} style={[s.memberRow, { borderColor: colors.line }]}>
            <View style={[s.memberAvatar, { backgroundColor: "#C2DDD8" }]}>
              <Text style={s.initials}>{initials(member.name)}</Text>
            </View>
            <View style={s.rowContent}>
              <Copy style={s.rowTitle}>
                {member.name}
                {member.userId === user?.id ? " · Du" : ""}
              </Copy>
              <Meta>{member.instrument || "Instrument noch offen"}</Meta>
            </View>
            {member.role === "admin" && <Meta>Admin</Meta>}
          </View>
        ))}
      </View>
      <View style={s.actions}>
        <Action label="Band verwalten" onPress={() => router.push("/band-settings")} secondary />
        <Action label="Profil & Ideen" onPress={() => router.push("/user")} secondary />
      </View>
      <Meta>
        Eine Idee für Band With Me? Teile sie über dein Profil – deine Vorschläge bleiben zunächst
        privat.
      </Meta>
    </Page>
  );
}
export function TourSongCreate() {
  return (
    <BandGate>
      <SongCreate />
    </BandGate>
  );
}
function SongCreate() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [duration, setDuration] = useState("");
  const [reference, setReference] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const create = useMutation(api.songs.create);
  const { run, busy, error } = useWrite();
  const router = useRouter();
  const { colors } = useTourTheme();
  async function save() {
    const seconds = parseDuration(duration);
    if (!title.trim() || !artist.trim() || seconds === null) {
      setValidation("Bitte gib Titel, Artist und eine Länge zwischen 0:01 und 120:00 ein.");
      return;
    }
    setValidation(null);
    if (
      await run(() =>
        create({ title, artist, duration: seconds, reference: reference.trim() || undefined }),
      )
    )
      router.replace("/songs");
  }
  return (
    <Page>
      <Copy accessibilityRole="header" style={s.display}>
        Euer nächster Song.
      </Copy>
      <Meta>Alle in deiner Band können für deinen Vorschlag stimmen.</Meta>
      {[
        { label: "Titel", value: title, set: setTitle, placeholder: "Songtitel", max: 160 },
        {
          label: "Artist",
          value: artist,
          set: setArtist,
          placeholder: "Band oder Interpret:in",
          max: 160,
        },
        {
          label: "Länge (Minuten:Sekunden)",
          value: duration,
          set: setDuration,
          placeholder: "3:45",
          max: 6,
        },
        {
          label: "Song-Link (optional)",
          value: reference,
          set: setReference,
          placeholder: "https://…",
          max: 2048,
        },
      ].map((field) => (
        <View key={field.label} style={{ gap: 8 }}>
          <Copy style={s.rowTitle}>{field.label}</Copy>
          <TextInput
            accessibilityLabel={field.label}
            value={field.value}
            onChangeText={field.set}
            placeholder={field.placeholder}
            maxLength={field.max}
            editable={!busy}
            autoCapitalize={field.label.startsWith("Song-Link") ? "none" : "sentences"}
            placeholderTextColor={colors.secondary}
            style={[
              s.search,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.line },
            ]}
          />
        </View>
      ))}
      <WriteError error={validation || error} />
      <Action
        label={busy ? "Wird gespeichert …" : "Song vorschlagen"}
        disabled={busy}
        onPress={() => {
          void save();
        }}
      />
    </Page>
  );
}
