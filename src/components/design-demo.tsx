import { Button, Host, Text as NativeText } from "@expo/ui";
import SegmentedControl from "@expo/ui/community/segmented-control";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  createContext,
  useContext,
  useReducer,
  useState,
  type PropsWithChildren,
  type ComponentProps,
} from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  useWindowDimensions,
  type TextProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  demoEvents,
  demoMembers,
  demoReducer,
  durationLabel,
  initialDemo,
  type Attendance,
  type DemoSong,
} from "@/lib/design-demo-model";

const palettes = {
  light: {
    background: "#EAF0ED",
    surface: "#F8FAF8",
    text: "#202E2D",
    secondary: "#526562",
    tint: "#164D4F",
    line: "#C7D4CE",
    accent: "#AD4937",
    soft: "#F3DCD4",
    hero: "#164D4F",
    onHero: "#F8FAF8",
    heroMuted: "#C8DFD7",
  },
  dark: {
    background: "#141F1F",
    surface: "#1F302F",
    text: "#EEF4F0",
    secondary: "#B0C4BC",
    tint: "#B6DCD0",
    line: "#3B514D",
    accent: "#F0AA95",
    soft: "#54372F",
    hero: "#214C4D",
    onHero: "#F8FAF8",
    heroMuted: "#C8DFD7",
  },
};

function useDemoValue() {
  const [state, dispatch] = useReducer(demoReducer, initialDemo);
  const dark = useColorScheme() === "dark";
  return { state, dispatch, colors: palettes[dark ? "dark" : "light"], dark };
}
const DemoContext = createContext<ReturnType<typeof useDemoValue> | null>(null);
export function DemoProvider({ children }: PropsWithChildren) {
  const value = useDemoValue();
  return <DemoContext value={value}>{children}</DemoContext>;
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("Design demo requires DemoProvider");
  return value;
}

function Copy({ style, ...props }: TextProps) {
  const { colors } = useDemo();
  return <Text selectable {...props} style={[s.body, { color: colors.text }, style]} />;
}
function Meta({ style, ...props }: TextProps) {
  const { colors } = useDemo();
  return <Copy {...props} style={[s.meta, { color: colors.secondary }, style]} />;
}
function Icon({
  name,
  color,
  size = 20,
}: {
  name: ComponentProps<typeof SymbolView>["name"];
  color?: string;
  size?: number;
}) {
  const { colors } = useDemo();
  return <SymbolView name={name} tintColor={color ?? colors.tint} size={size} />;
}
function Action({
  label,
  onPress,
  secondary = false,
  testID,
  disabled = false,
  hero = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  testID?: string;
  disabled?: boolean;
  hero?: boolean;
}) {
  const { colors, dark } = useDemo();
  return (
    <Host
      matchContents
      colorScheme={hero || dark ? "dark" : "light"}
      seedColor={hero ? colors.heroMuted : colors.tint}
      style={{ minHeight: 48 }}
    >
      <Button
        onPress={onPress}
        variant={secondary ? "outlined" : "filled"}
        disabled={disabled}
        testID={testID}
        style={{ height: 48, paddingHorizontal: 16 }}
      >
        <NativeText
          textStyle={{
            color: secondary
              ? hero
                ? colors.onHero
                : colors.tint
              : hero
                ? colors.hero
                : colors.background,
          }}
        >
          {label}
        </NativeText>
      </Button>
    </Host>
  );
}
function Page({ children }: PropsWithChildren) {
  const { colors } = useDemo();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.page}
    >
      <SafeAreaView edges={["left", "right"]} style={s.content}>
        {children}
      </SafeAreaView>
    </ScrollView>
  );
}
export function DemoSection({ title, large = true }: { title: string; large?: boolean }) {
  const { colors } = useDemo();
  return (
    <Stack
      screenOptions={{
        title,
        headerLargeTitleEnabled: large,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerLargeStyle: { backgroundColor: colors.background },
        headerTintColor: colors.tint,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
function SectionHeading({ children, aside }: PropsWithChildren<{ aside?: string }>) {
  return (
    <View style={s.sectionHeading}>
      <Copy accessibilityRole="header" style={s.heading}>
        {children}
      </Copy>
      {aside && <Meta>{aside}</Meta>}
    </View>
  );
}
function People({ hero = false }: { hero?: boolean }) {
  const { colors } = useDemo();
  return (
    <View
      style={s.people}
      accessibilityLabel="David, Mira, Jonas, Lea und Ben: fünf Bandmitglieder"
    >
      {demoMembers.map((member) => (
        <View key={member.name} style={[s.avatar, { backgroundColor: member.color }]}>
          <Text style={s.initials}>{member.initials}</Text>
        </View>
      ))}
      <Meta style={hero && { color: colors.heroMuted }}>Eure Runde.</Meta>
    </View>
  );
}
function Rsvp({ event, hero = false }: { event: (typeof demoEvents)[number]; hero?: boolean }) {
  const { state, dispatch, colors } = useDemo();
  const answer = state.attendance[event.id] ?? "open";
  const yes = event.yes + (answer === "yes" ? 1 : 0);
  const no = event.no + (answer === "no" ? 1 : 0);
  function set(status: Attendance) {
    dispatch({ type: "rsvp", event: event.id, status });
  }
  return (
    <View style={s.rsvp}>
      <Meta style={hero && { color: colors.heroMuted }} testID="attendance-count">
        {yes} dabei · {no} abgesagt · {5 - yes - no} offen
      </Meta>
      <View style={s.actions}>
        <Action
          hero={hero}
          testID={`yes-${event.id}`}
          label={answer === "yes" ? "Zugesagt" : "Bin dabei"}
          secondary={answer === "no"}
          onPress={() => set("yes")}
        />
        <Action
          hero={hero}
          testID={`no-${event.id}`}
          label={answer === "no" ? "Abgesagt" : "Kann nicht"}
          secondary={answer !== "no"}
          onPress={() => set("no")}
        />
      </View>
      {answer !== "open" && (
        <Pressable accessibilityRole="button" onPress={() => set("open")} style={s.textAction}>
          <Meta style={hero && { color: colors.heroMuted }}>Antwort zurücksetzen</Meta>
        </Pressable>
      )}
    </View>
  );
}
function EventRow({ event }: { event: (typeof demoEvents)[number] }) {
  const { colors, state } = useDemo();
  const { fontScale } = useWindowDimensions();
  const router = useRouter();
  const answer = state.attendance[event.id] ?? "open";
  return (
    <Pressable
      testID={`event-${event.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.date}, Details öffnen`}
      onPress={() => router.push({ pathname: "/prototype/event", params: { id: event.id } })}
      style={({ pressed }) => [
        s.eventRow,
        { borderColor: colors.line, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={[s.date, { width: 48 * Math.max(1, fontScale) }]}>
        <Copy style={[s.day, { color: event.kind === "Auftritt" ? colors.accent : colors.tint }]}>
          {event.day}
        </Copy>
        <Meta style={s.month}>{event.month}</Meta>
      </View>
      <View style={s.rowContent}>
        <View style={s.inline}>
          <Meta style={{ color: event.kind === "Auftritt" ? colors.accent : colors.secondary }}>
            {event.kind}
          </Meta>
          <Meta>
            {answer === "yes" ? "Zugesagt" : answer === "no" ? "Abgesagt" : "Antwort offen"}
          </Meta>
        </View>
        <Copy style={s.rowTitle}>{event.title}</Copy>
        <Meta>
          {event.time} · {event.location}
        </Meta>
      </View>
      <Icon
        name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
        size={16}
      />
    </Pressable>
  );
}

export function DemoHome() {
  const { colors, state } = useDemo();
  const router = useRouter();
  const candidateCount = state.songs.filter((song) => !song.archived).length;
  return (
    <Page>
      <View style={s.intro}>
        <Copy accessibilityRole="header" style={s.display}>
          Guter Takt.{"\n"}Gute Leute.
        </Copy>
        <Meta>The Sunday Club · Design-Demo</Meta>
      </View>
      <View style={[s.hero, { backgroundColor: colors.hero }]}>
        <Copy style={[s.heroDate, { color: colors.heroMuted }]}>Montag, 16. November</Copy>
        <Copy accessibilityRole="header" style={[s.heroTitle, { color: colors.onHero }]}>
          Ab in den{"\n"}Proberaum.
        </Copy>
        <Copy style={{ color: colors.onHero }}>19:00–21:30 · Studio Ehrenfeld</Copy>
        <People hero />
        <Rsvp event={demoEvents[0]} hero />
      </View>
      <View>
        <SectionHeading>Als Nächstes</SectionHeading>
        <EventRow event={demoEvents[1]} />
      </View>
      <Pressable
        accessibilityRole="button"
        testID="home-songs"
        onPress={() => router.push("/prototype/songs")}
        style={({ pressed }) => [
          s.songTeaser,
          { backgroundColor: colors.soft, opacity: pressed ? 0.65 : 1 },
        ]}
      >
        <View style={s.rowContent}>
          <Copy style={[s.heading, { color: colors.accent }]}>Was spielen wir?</Copy>
          <Copy style={{ color: colors.accent }}>
            {candidateCount
              ? `${candidateCount} Songideen. Deine Stimme zählt.`
              : "Alle Songs sind in der Setlist."}
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

export function DemoEvents() {
  const [filter, setFilter] = useState(0);
  const { dark } = useDemo();
  const events = [...demoEvents]
    // oxlint-disable-next-line unicorn/no-array-sort -- Hermes does not implement toSorted.
    .sort((a, b) => Number(a.day) - Number(b.day))
    .filter((event) => filter === 0 || event.kind === (filter === 1 ? "Probe" : "Auftritt"));
  return (
    <Page>
      <Meta>Euer nächster gemeinsamer Takt.</Meta>
      <SegmentedControl
        values={["Alle", "Proben", "Auftritte"]}
        selectedIndex={filter}
        onChange={(event) => setFilter(event.nativeEvent.selectedSegmentIndex)}
        appearance={dark ? "dark" : "light"}
        style={s.segment}
      />
      <View>
        <SectionHeading>November 2026</SectionHeading>
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </View>
      <Meta>
        Die Montagsprobe gehört zu einer wöchentlichen Serie. Gezeigt werden feste Beispieltermine.
      </Meta>
    </Page>
  );
}

function SongRow({ song, archived }: { song: DemoSong; archived: boolean }) {
  const { dispatch, colors, state } = useDemo();
  return (
    <View style={[s.songRow, { borderColor: colors.line }]}>
      <View style={s.songTop}>
        <View style={s.rowContent}>
          <Copy style={s.rowTitle}>{song.title}</Copy>
          <Meta>
            {song.artist} · {durationLabel(song.duration)}
          </Meta>
        </View>
        {!archived && (
          <Pressable
            testID={`vote-${song.id}`}
            accessibilityRole="button"
            accessibilityLabel={`${song.title}: ${song.voted ? "Stimme zurücknehmen" : "abstimmen"}, ${song.votes} Stimmen`}
            accessibilityState={{ selected: song.voted }}
            onPress={() => dispatch({ type: "vote", song: song.id })}
            style={({ pressed }) => [
              s.vote,
              {
                backgroundColor: song.voted ? colors.tint : colors.surface,
                opacity: pressed ? 0.6 : 1,
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
      <Pressable
        accessibilityRole="button"
        testID={`select-${song.id}`}
        onPress={() => dispatch({ type: archived ? "restore" : "setlist", song: song.id })}
        style={s.textAction}
      >
        <Copy style={[s.link, { color: colors.tint }]}>
          {archived ? "Zurück ins Voting" : "Für Stadtgarten auswählen"}
        </Copy>
      </Pressable>
      {archived && state.setlist.includes(song.id) && <Meta>In der Stadtgarten-Setlist</Meta>}
    </View>
  );
}
export function DemoSongs() {
  const { colors, dark, state } = useDemo();
  const router = useRouter();
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState("");
  const songs = state.songs
    .filter(
      (song) =>
        song.archived === (filter === 1) &&
        `${song.title} ${song.artist}`
          .toLocaleLowerCase("de")
          .includes(query.toLocaleLowerCase("de").trim()),
    )
    // oxlint-disable-next-line unicorn/no-array-sort -- filter creates a copy; Hermes lacks toSorted.
    .sort((a, b) => b.votes - a.votes);
  return (
    <Page>
      <Meta>Gute Ideen werden euer nächster Song.</Meta>
      <SegmentedControl
        values={["Im Voting", "Archiv"]}
        selectedIndex={filter}
        onChange={(event) => setFilter(event.nativeEvent.selectedSegmentIndex)}
        appearance={dark ? "dark" : "light"}
        style={s.segment}
      />
      <TextInput
        testID="song-search"
        accessibilityLabel="Songs durchsuchen"
        placeholder="Song oder Artist suchen"
        placeholderTextColor={colors.secondary}
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={[
          s.search,
          { color: colors.text, backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      />
      <View>
        <SectionHeading aside={`${songs.length} Songs`}>
          {filter === 0 ? "Eure Ideen" : "Für später aufgehoben"}
        </SectionHeading>
        {songs.map((song) => (
          <SongRow key={song.id} song={song} archived={filter === 1} />
        ))}
        {songs.length === 0 && (
          <View style={s.empty}>
            <Copy style={s.heading}>{query ? "Kein Treffer." : "Alles auf der Bühne."}</Copy>
            <Meta>
              {query
                ? "Versuch einen anderen Titel oder Artist."
                : "Eure Songideen liegen jetzt in der Setlist. Im Archiv kannst du sie zurück ins Voting holen."}
            </Meta>
            {query && <Action label="Suche leeren" onPress={() => setQuery("")} secondary />}
          </View>
        )}
      </View>
      <Action
        label="Stadtgarten-Setlist öffnen"
        onPress={() => router.push({ pathname: "/prototype/event", params: { id: "gig" } })}
        secondary
      />
      <Meta>Die Auswahl wandert ins Archiv. In der Setlist bleibt der Song erhalten.</Meta>
    </Page>
  );
}

export function DemoEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch, colors } = useDemo();
  const router = useRouter();
  const event = demoEvents.find((item) => item.id === id);
  if (!event)
    return (
      <Page>
        <Copy style={s.heading}>Termin nicht gefunden.</Copy>
        <Action label="Zur Übersicht" onPress={() => router.replace("/prototype")} />
      </Page>
    );
  const songs = state.setlist.map((songId) => state.songs.find((song) => song.id === songId)!);
  const total = songs.reduce((sum, song) => sum + song.duration, 0);
  return (
    <Page>
      <Stack.Screen
        options={{ title: event.kind === "Auftritt" ? "Euer Auftritt" : "Eure Probe" }}
      />
      <View
        style={[
          s.eventIntro,
          { backgroundColor: event.kind === "Auftritt" ? colors.soft : colors.surface },
        ]}
      >
        <Copy
          accessibilityRole="header"
          style={[s.display, { color: event.kind === "Auftritt" ? colors.accent : colors.tint }]}
        >
          {event.title}
        </Copy>
        <Copy>{event.date}</Copy>
        <Copy>{event.time}</Copy>
        <Meta>{event.location}</Meta>
      </View>
      <View>
        <SectionHeading>Wer ist dabei?</SectionHeading>
        <People />
        <Rsvp event={event} />
      </View>
      <View>
        <SectionHeading>Gut zu wissen</SectionHeading>
        <Copy>{event.note}</Copy>
      </View>
      {event.kind === "Auftritt" && (
        <View>
          <SectionHeading aside={`${songs.length} Songs · ${durationLabel(total)} min`}>
            Eure Setlist
          </SectionHeading>
          <Meta>Für Live im Stadtgarten · Reihenfolge gemeinsam planen.</Meta>
          {songs.map((song, index) => (
            <View
              key={song.id}
              testID={`setlist-${song.id}`}
              style={[s.setlistRow, { borderColor: colors.line }]}
            >
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
                {([-1, 1] as const).map((direction) => (
                  <Pressable
                    key={direction}
                    testID={`move-${song.id}-${direction}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${song.title} nach ${direction === -1 ? "oben" : "unten"}`}
                    accessibilityState={{
                      disabled: direction === -1 ? index === 0 : index === songs.length - 1,
                    }}
                    disabled={direction === -1 ? index === 0 : index === songs.length - 1}
                    onPress={() => dispatch({ type: "move", song: song.id, direction })}
                    style={({ pressed }) => [
                      s.iconAction,
                      {
                        opacity: (direction === -1 ? index === 0 : index === songs.length - 1)
                          ? 0.25
                          : pressed
                            ? 0.5
                            : 1,
                      },
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
                ))}
              </View>
            </View>
          ))}
          <View style={{ paddingTop: 20 }}>
            <Action
              label="Songs aus dem Voting auswählen"
              onPress={() => router.push("/prototype/songs")}
              secondary
            />
          </View>
        </View>
      )}
      <Meta style={s.footnote}>Design-Demo · Alle Änderungen bleiben lokal in dieser Sitzung.</Meta>
    </Page>
  );
}

export function DemoBand() {
  const { colors, dispatch } = useDemo();
  return (
    <Page>
      <View style={[s.bandIntro, { backgroundColor: colors.hero }]}>
        <Icon
          name={{ ios: "music.note.house", android: "music_note", web: "music_note" }}
          color={colors.heroMuted}
          size={36}
        />
        <Copy accessibilityRole="header" style={[s.display, { color: colors.onHero }]}>
          The Sunday Club
        </Copy>
        <Copy style={{ color: colors.heroMuted }}>Fünf Leute. Ein gemeinsamer Sound.</Copy>
      </View>
      <View>
        <SectionHeading aside="5 Mitglieder">Die Band</SectionHeading>
        {demoMembers.map((member, index) => (
          <View key={member.name} style={[s.memberRow, { borderColor: colors.line }]}>
            <View style={[s.memberAvatar, { backgroundColor: member.color }]}>
              <Text style={s.initials}>{member.initials}</Text>
            </View>
            <View style={s.rowContent}>
              <Copy style={s.rowTitle}>
                {member.name}
                {index === 0 ? " · Du" : ""}
              </Copy>
              <Meta>{member.instrument}</Meta>
            </View>
            {index === 0 && <Meta>Admin</Meta>}
          </View>
        ))}
      </View>
      <View>
        <SectionHeading>Zum Ausprobieren</SectionHeading>
        <Copy>Fiktive Band, echte Interaktionen.</Copy>
        <Meta>
          Zusagen, Voting und Setlist sind ein Design-Prototyp. Ein Neustart setzt die Beispieldaten
          zurück.
        </Meta>
      </View>
      <Action
        label="Demo zurücksetzen"
        onPress={() => dispatch({ type: "reset" })}
        secondary
        testID="reset-demo"
      />
    </Page>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120, alignItems: "center" },
  content: { width: "100%", maxWidth: 760, gap: 28 },
  body: { fontSize: 17, lineHeight: 25 },
  meta: { fontSize: 14, lineHeight: 21 },
  display: { fontSize: 34, lineHeight: 39, letterSpacing: -0.8, fontWeight: "700" },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.35 },
  intro: { gap: 10 },
  hero: { padding: 24, borderRadius: 16, borderCurve: "continuous", gap: 18 },
  heroDate: { fontSize: 15, lineHeight: 21, fontWeight: "500" },
  heroTitle: { fontSize: 30, lineHeight: 34, letterSpacing: -0.6, fontWeight: "700" },
  people: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#243A35", fontSize: 12, fontWeight: "700" },
  rsvp: { gap: 12 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  textAction: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  sectionHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  date: { width: 48, alignItems: "center", gap: 2 },
  day: { fontSize: 30, lineHeight: 34, fontWeight: "600", fontVariant: ["tabular-nums"] },
  month: { fontSize: 12, fontWeight: "600" },
  rowContent: { flex: 1, gap: 4, minWidth: 0 },
  rowTitle: { fontWeight: "600", fontSize: 18, lineHeight: 25 },
  inline: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  songTeaser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 22,
    borderRadius: 16,
    borderCurve: "continuous",
  },
  footnote: { textAlign: "center", fontSize: 12 },
  segment: { minHeight: 44 },
  search: {
    fontSize: 17,
    padding: 14,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  songRow: { paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  songTop: { flexDirection: "row", gap: 16, alignItems: "center" },
  vote: {
    minWidth: 64,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  voteCount: { fontWeight: "600", fontVariant: ["tabular-nums"] },
  link: { fontSize: 15, fontWeight: "600" },
  empty: { paddingVertical: 28, gap: 12 },
  eventIntro: { padding: 24, borderRadius: 16, borderCurve: "continuous", gap: 12 },
  setlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trackNumber: { fontSize: 20, fontWeight: "500", width: 28, fontVariant: ["tabular-nums"] },
  reorder: { flexDirection: "row" },
  iconAction: { minWidth: 44, minHeight: 48, alignItems: "center", justifyContent: "center" },
  bandIntro: { padding: 24, borderRadius: 16, gap: 18 },
  memberRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
