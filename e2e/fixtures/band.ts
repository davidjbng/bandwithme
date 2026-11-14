import type { Page } from "@playwright/test";

// Browser-only transport fixture. Every Convex connection is intercepted; this
// never creates an account, writes live data, or adds an auth bypass to the app.
export async function bandFixture(page: Page, initiallyAuthenticated = true) {
  let signedIn = initiallyAuthenticated;
  const now = Math.floor(Date.now() / 1000);
  const jwt = `${Buffer.from("{}").toString("base64url")}.${Buffer.from(JSON.stringify({ iat: now, exp: now + 3600, sub: "fixture" })).toString("base64url")}.fixture`;
  if (initiallyAuthenticated)
    await page.addInitScript((token) => {
      // oxlint-disable-next-line typescript/unbound-method -- Called below with the original Storage receiver.
      const original = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key) {
        if (key.startsWith("__convexAuthJWT_")) return token;
        if (key.startsWith("__convexAuthRefreshToken_")) return "fixture-refresh";
        return original.call(this, key);
      };
    }, jwt);
  await page.route(/https?:\/\/[^/]*\.convex\.(cloud|site)\//, async (route) => {
    const path = route.request().postDataJSON()?.path;
    mutations.push(path);
    if (
      path === "auth:completeSignUpWithEmailPassword" &&
      route.request().postData()?.includes("invalid-code")
    ) {
      await route.fulfill({
        json: {
          status: "success",
          value: { status: "error", userError: { error: "INVALID_CHALLENGE" } },
          logLines: [],
        },
      });
      return;
    }
    if (path === "auth:signInWithIdentifier" || path === "auth:completeSignUpWithEmailPassword") {
      signedIn = true;
      await route.fulfill({
        json: {
          status: "success",
          value: {
            status: "complete",
            tokens: { accessToken: jwt, refreshToken: "fixture-refresh", userId: "member-a" },
          },
          logLines: [],
        },
      });
    } else if (path === "auth:signOut") {
      signedIn = false;
      await route.fulfill({ json: { status: "success", value: null, logLines: [] } });
    } else if (path === "auth:refreshSession") {
      await route.fulfill({
        json: {
          status: "success",
          value: {
            kind: "rotated",
            tokens: { accessToken: jwt, refreshToken: "fixture-refresh", userId: "member-a" },
          },
          logLines: [],
        },
      });
    } else await route.abort();
  });
  const user = {
    username: "",
    id: "member-a",
    name: "Mira Winter",
    email: "mira@example.test",
    instrument: "Gesang",
  };
  const members = [
    {
      id: "membership-a",
      userId: user.id,
      name: user.name,
      role: "admin",
      email: null,
      instrument: "Gesang",
    },
    {
      id: "membership-b",
      userId: "member-b",
      name: "Jonas Berg",
      role: "member",
      email: null,
      instrument: "Bass",
    },
  ];
  let response: string | null = null;
  const songs = [
    {
      _id: "song-a",
      _creationTime: 1,
      bandId: "band-a",
      createdBy: user.id,
      title: "Dreams",
      artist: "Fleetwood Mac",
      duration: 257,
      reference: "https://example.com/song",
      archived: false,
      votes: 1,
      voted: false,
    },
    {
      _id: "song-b",
      _creationTime: 2,
      bandId: "band-a",
      createdBy: user.id,
      title: "Valerie",
      artist: "Amy Winehouse",
      duration: 219,
      reference: "",
      archived: false,
      votes: 0,
      voted: false,
    },
  ];
  const setlist: string[] = [];
  const mutations: string[] = [];
  const event = () => ({
    id: "gig-a",
    kind: "performance",
    name: "Live im Stadtgarten",
    dateTime: "2099-11-28T19:00:00Z",
    location: "Stadtgarten · Köln",
    repeat: "none",
    note: "Soundcheck um 17:30.",
    viewerResponse: response,
    responseCounts: {
      yes: response === "yes" ? 2 : 1,
      no: response === "no" ? 1 : 0,
      open: response ? 0 : 1,
    },
    participants: {
      yes: [
        ...(response === "yes" ? [{ id: user.id, name: user.name }] : []),
        { id: "member-b", name: "Jonas Berg" },
      ],
      no: response === "no" ? [{ id: user.id, name: user.name }] : [],
      open: response ? [] : [{ id: user.id, name: user.name }],
    },
  });
  function query(name: string, args: Record<string, unknown>) {
    switch (name) {
      case "auth:isAuthenticated":
        return signedIn;
      case "user:current":
        return signedIn ? user : null;
      case "bands:myBand":
        return { id: "band-a", name: "The Sunday Club", role: "admin" };
      case "bands:listMembers":
        return members;
      case "termine:list":
        return [event()];
      case "termine:detail":
        return args.eventId === "gig-a" ? event() : null;
      case "bands:previewInvite":
        return { bandName: "The Sunday Club" };
      case "ideas:mine":
        return [];
      case "songs:list":
        return songs;
      case "songs:setlist":
        return setlist.map((id) => songs.find((song) => song._id === id));
      default:
        throw new Error(`Missing fixture query: ${name}`);
    }
  }
  await page.routeWebSocket(/wss?:\/\/[^/]*\.convex\.cloud\//, (socket) => {
    let tick = 1n;
    const ts = () => {
      const bytes = Buffer.alloc(8);
      bytes.writeBigUInt64LE(tick);
      return bytes.toString("base64");
    };
    let version = { querySet: 0, identity: 0, ts: ts() };
    const queries = new Map<number, { udfPath: string; args: Record<string, unknown>[] }>();
    const send = (data: unknown) => socket.send(JSON.stringify(data));
    function transition(next: Partial<typeof version> = {}) {
      tick += 1n;
      const end = { ...version, ts: ts(), ...next };
      send({
        type: "Transition",
        startVersion: version,
        endVersion: end,
        modifications: [...queries].map(([queryId, q]) => ({
          type: "QueryUpdated",
          queryId,
          value: query(q.udfPath, q.args[0] ?? {}),
          logLines: [],
          journal: null,
        })),
      });
      version = end;
    }
    socket.onMessage((raw) => {
      const message = JSON.parse(String(raw));
      if (message.type === "Connect") {
        version = { querySet: 0, identity: 0, ts: "AAAAAAAAAAA=" };
        return;
      }
      if (message.type === "Authenticate") {
        transition({ identity: message.baseVersion + 1 });
        return;
      }
      if (message.type === "ModifyQuerySet") {
        for (const modification of message.modifications) {
          if (modification.type === "Add") queries.set(modification.queryId, modification);
          else queries.delete(modification.queryId);
        }
        transition({ querySet: message.newVersion });
      }
      if (message.type === "Mutation") {
        mutations.push(message.udfPath);
        const args = message.args[0];
        let result: unknown = null;
        const song = songs.find((item) => item._id === args.songId);
        switch (message.udfPath) {
          case "auth:signInWithIdentifier":
          case "auth:completeSignUpWithEmailPassword":
            if (args.emailCode === "invalid-code") {
              result = { status: "error", userError: { error: "INVALID_CHALLENGE" } };
              break;
            }
            signedIn = true;
            result = {
              status: "complete",
              tokens: { accessToken: jwt, refreshToken: "fixture-refresh", userId: "member-a" },
            };
            break;
          case "auth:signUpWithEmailPassword":
            result = { success: true, browserSecret: "fixture-signup-secret" };
            break;
          case "user:setUsername":
            user.username = args.username;
            break;
          case "auth:signOut":
            signedIn = false;
            break;
          case "termine:setResponse":
            response = args.status === "open" ? null : args.status;
            break;
          case "songs:setVote":
            if (song) {
              song.votes += args.voted ? 1 : -1;
              song.voted = args.voted;
            }
            break;
          case "songs:archive":
            if (song) song.archived = args.archived;
            break;
          case "songs:addToSetlist":
            if (song && !setlist.includes(song._id)) {
              setlist.push(song._id);
              song.archived = true;
            }
            break;
          case "songs:move": {
            const i = setlist.indexOf(args.songId);
            const j = i + args.direction;
            if (i >= 0 && j >= 0 && j < setlist.length)
              [setlist[i], setlist[j]] = [setlist[j], setlist[i]];
            break;
          }
          case "songs:removeFromSetlist":
            setlist.splice(setlist.indexOf(args.songId), 1);
            break;
          case "songs:create":
            songs.push({
              ...songs[0],
              ...args,
              _id: `song-${songs.length}`,
              reference: args.reference ?? "",
              archived: false,
              voted: false,
              votes: 0,
            });
            break;
          default:
            throw new Error(`Unexpected mutation: ${message.udfPath}`);
        }
        tick += 1n;
        send({
          type: "MutationResponse",
          requestId: message.requestId,
          success: true,
          result,
          ts: ts(),
          logLines: [],
        });
        transition();
      }
    });
  });
  return { mutations };
}
