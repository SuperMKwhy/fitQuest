# FitQuest

A gamified fitness app: track real runs via GPS, compete in an arm-swing
arcade mini-game, level up, and (soon) collect friends and shop cosmetics.
See `design/design.md` for the full design audit and screen inventory that
this implementation is being built against.

## Project structure

```
fitQuest/
├── apps/
│   ├── mobile/     Expo (React Native) app — the client
│   └── server/     Fastify + Prisma + PostgreSQL API
├── design/         HTML mockups + design.md (design system & screen audit)
├── docker-compose.yml
└── todo.md         Open work items, including things only you can do
```

## Prerequisites

- Node.js 20+
- Docker (for Postgres, and optionally the server)
- For running the mobile app on a phone: the [Expo Go](https://expo.dev/go) app

## First-time setup

```bash
git clone <this repo>
cd fitQuest
cp .env.example .env
npm install

# Expo-managed native deps need Expo's own resolver, not plain npm, to pick
# versions that actually match this project's Expo SDK — see Troubleshooting
# below for why this specific package needs its own explicit install step.
cd apps/mobile
npx expo install react-native-worklets
cd ../..
```

## Running the backend

The API and database run via Docker Compose:

```bash
docker compose up --build
```

This starts Postgres and the server on `http://localhost:3000` (seed the
shop's item catalog once with `docker compose exec server npm run seed`).

Prefer running the server directly on your host (faster iteration, no
rebuild-on-change)? Start just the database, then run the server locally:

```bash
npm run db:up          # starts only the postgres container
cp apps/server/.env.example apps/server/.env
npm run server          # apps/server: tsx watch, restarts on save
```

## Running the mobile app

```bash
npm run mobile
```

This runs `expo start` in `apps/mobile`. Press `i`/`a` for a simulator, or
scan the QR code with Expo Go on your phone.

### Pointing the app at the backend

The mobile app reads the API's base URL from `EXPO_PUBLIC_API_URL`:

- **iOS Simulator / Android Emulator / web**: defaults to `http://localhost:3000`, no setup needed.
- **A physical phone via Expo Go**: `localhost` means the phone itself, not your computer. Create `apps/mobile/.env` with your machine's LAN IP:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
  ```

### Running the Arm Swing Game ("Rank Match") on a physical phone

The arm-swing mini-game uses the phone's camera through the browser's
`getUserMedia` API, embedded in a WebView — this works inside plain Expo Go
with no custom dev client or Apple Developer account, but it needs an HTTPS
tunnel to the dev server (camera access requires a secure origin):

```bash
NGROK_AUTHTOKEN=<your ngrok authtoken> npx expo start --tunnel
```

Get a free authtoken at [ngrok.com](https://ngrok.com) — sign up, then copy
it from your dashboard. Don't commit it; put it in your shell environment or
a local `.env` you don't check in.

See `apps/mobile/src/game/` for how this works: `ArmSwingGame.js` is the
native wrapper that opens a full-screen WebView pointed at the same dev
server, `ArmSwingGame.web.js` is the browser build that actually does the
camera + pose tracking (via MediaPipe) and drives `FlappyBirdGame.js`.

## Tech stack

- **Mobile**: Expo (React Native), NativeWind (Tailwind for RN — ported
  directly from `design/design.md`'s color/shadow tokens), React Navigation,
  Zustand.
- **Server**: Fastify, Prisma, PostgreSQL, JWT auth.

## Testing

No automated test suite yet — see `todo.md`.

## Troubleshooting

Things already hit and fixed once — documented here so they don't need
re-diagnosing:

- **`Cannot find module 'react-native-worklets/plugin'`** — Expo SDK 54's
  babel preset needs the standalone `react-native-worklets` package (not
  `react-native-worklets-core`, which is a separate thing `react-native-vision-camera`
  uses). If you hit this, run `npx expo install react-native-worklets` from
  `apps/mobile` (plain `npm install` won't add it — that package's peer
  requirements are version-sensitive enough that only Expo's own resolver
  should pick the version, not npm's).
- **`Unable to resolve "../../App" from "node_modules/expo/AppEntry.js"`** —
  an npm-workspaces-monorepo issue: that file's own `import '../../App'` is a
  literal filesystem-relative path computed from wherever `expo` physically
  resolves, which in a hoisted monorepo isn't reliably `apps/mobile`. Already
  fixed in `apps/mobile/metro.config.js` (`watchFolders` / `nodeModulesPaths`
  / `disableHierarchicalLookup` — Expo's own documented monorepo fix); if it
  resurfaces, restart with `npx expo start -c` to clear Metro's cache first.
- **Prisma + Docker: `Could not parse schema engine response`** / `Prisma
  failed to detect the libssl/openssl version` — Prisma's query engine needs
  a real OpenSSL + glibc, which Alpine's musl libc doesn't provide. Already
  fixed by building `apps/server`'s Docker image from `node:20-slim` instead
  of `node:20-alpine`.
- Run Expo/npm commands for the mobile app **from inside `apps/mobile`**,
  not the repo root. Some tools (like `expo install`) write to whichever
  `package.json` is in the current directory, and in a workspace that's easy
  to get wrong silently.
