export type Attendance = "open" | "yes" | "no";
export type DemoSong = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  votes: number;
  voted: boolean;
  archived: boolean;
};

export const demoEvents = [
  {
    id: "rehearsal",
    title: "Ab in den Proberaum.",
    kind: "Probe",
    day: "16",
    month: "NOV",
    date: "Montag, 16. November",
    time: "19:00–21:30",
    location: "Studio Ehrenfeld",
    note: "Wie jede Woche: zusammen ankommen, einspielen und die Songs für den Stadtgarten proben.",
    yes: 4,
    no: 0,
  },
  {
    id: "gig",
    title: "Live im Stadtgarten",
    kind: "Auftritt",
    day: "28",
    month: "NOV",
    date: "Samstag, 28. November",
    time: "20:00–21:00",
    location: "Stadtgarten · Köln",
    note: "Soundcheck um 17:30. Eingang über den Hinterhof. Dunkle Kleidung, alles andere darf leuchten.",
    yes: 3,
    no: 1,
  },
  {
    id: "next-rehearsal",
    title: "Montagsprobe",
    kind: "Probe",
    day: "23",
    month: "NOV",
    date: "Montag, 23. November",
    time: "19:00–21:30",
    location: "Studio Ehrenfeld",
    note: "Zweiter Termin unserer wöchentlichen Probenserie.",
    yes: 2,
    no: 0,
  },
] as const;

export const demoMembers = [
  { name: "David", initials: "DJ", instrument: "Gitarre & Gesang", color: "#DAE5C0" },
  { name: "Mira", initials: "MI", instrument: "Gesang", color: "#F1C8B8" },
  { name: "Jonas", initials: "JO", instrument: "Bass", color: "#CBCBEB" },
  { name: "Lea", initials: "LE", instrument: "Keys", color: "#C2DDD8" },
  { name: "Ben", initials: "BE", instrument: "Schlagzeug", color: "#E8D6B1" },
];

export type DemoState = {
  attendance: Record<string, Attendance>;
  setlist: string[];
  songs: DemoSong[];
};

export const initialDemo: DemoState = {
  attendance: {},
  setlist: ["s4", "s5"],
  songs: [
    {
      id: "s1",
      title: "Dreams",
      artist: "Fleetwood Mac",
      duration: 257,
      votes: 3,
      voted: false,
      archived: false,
    },
    {
      id: "s2",
      title: "Ain’t No Sunshine",
      artist: "Bill Withers",
      duration: 125,
      votes: 2,
      voted: false,
      archived: false,
    },
    {
      id: "s3",
      title: "Come Together",
      artist: "The Beatles",
      duration: 259,
      votes: 1,
      voted: false,
      archived: false,
    },
    {
      id: "s4",
      title: "Valerie",
      artist: "Amy Winehouse",
      duration: 219,
      votes: 4,
      voted: false,
      archived: true,
    },
    {
      id: "s5",
      title: "Use Somebody",
      artist: "Kings of Leon",
      duration: 231,
      votes: 3,
      voted: false,
      archived: true,
    },
  ] satisfies DemoSong[],
};

export type DemoAction =
  | { type: "rsvp"; event: string; status: Attendance }
  | { type: "vote"; song: string }
  | { type: "setlist"; song: string }
  | { type: "move"; song: string; direction: -1 | 1 }
  | { type: "restore"; song: string }
  | { type: "reset" };

// shortcut: demo state lasts for this session only; replace with authorized Convex flows after design approval.
// oxlint-disable-next-line typescript/consistent-return -- The action union is exhaustively handled below.
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "reset":
      return initialDemo;
    case "rsvp":
      return { ...state, attendance: { ...state.attendance, [action.event]: action.status } };
    case "vote":
      return {
        ...state,
        songs: state.songs.map((song) =>
          song.id === action.song && !song.archived
            ? { ...song, voted: !song.voted, votes: song.votes + (song.voted ? -1 : 1) }
            : song,
        ),
      };
    case "setlist": {
      if (
        state.setlist.includes(action.song) ||
        !state.songs.some((song) => song.id === action.song)
      )
        return state;
      return {
        ...state,
        setlist: [...state.setlist, action.song],
        songs: state.songs.map((song) =>
          song.id === action.song ? { ...song, archived: true } : song,
        ),
      };
    }
    case "move": {
      const index = state.setlist.indexOf(action.song);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= state.setlist.length) return state;
      const setlist = [...state.setlist];
      [setlist[index], setlist[target]] = [setlist[target], setlist[index]];
      return { ...state, setlist };
    }
    case "restore":
      return {
        ...state,
        songs: state.songs.map((song) =>
          song.id === action.song ? { ...song, archived: false } : song,
        ),
      };
  }
}

export function durationLabel(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
