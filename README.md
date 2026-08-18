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

## Quick start (step by step)

These steps take you from a fresh clone to the app running on your phone.
Run everything from the repo root unless a step says otherwise.

1. **Install dependencies**

   ```bash
   git clone <this repo>
   cd fitQuest
   cp .env.example .env
   npm install

   # Expo-managed native deps need Expo's own resolver, not plain npm, to
   # pick versions that actually match this project's Expo SDK — see
   # Troubleshooting below for why this one needs its own install step.
   cd apps/mobile
   npx expo install react-native-worklets
   cd ../..
   ```

2. **Start Postgres**

   ```bash
   npm run db:up
   ```

3. **Set up and start the API server**

   ```bash
   cp apps/server/.env.example apps/server/.env
   npm run prisma:generate --workspace apps/server   # generates the Prisma client (needed once, and after schema changes)
   npm run server                                     # tsx watch, restarts on save — leave this running in its own terminal
   ```

   (Alternative: `docker compose up --build` runs Postgres *and* the server
   together, no separate `npm run server` needed — pick one or the other,
   don't run both, they'll fight over port 3000. Seed the shop's item
   catalog once either way with `npm run --workspace apps/server seed`, or
   `docker compose exec server npm run seed` if using Docker.)

4. **Point the mobile app at the API.** Create `apps/mobile/.env`:

   - **iOS Simulator / Android Emulator / web** — the app defaults to
     `http://localhost:3000`, so you can skip this file entirely.
   - **Physical phone, same Wi-Fi network as your computer** — `localhost`
     on the phone means the phone itself, not your computer, so point it at
     your machine's LAN IP instead:
     ```
     EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
     ```
     (find your IP with `ip addr` / `ifconfig` / System Settings → Wi-Fi).
   - **Physical phone, different network than your computer** (e.g. phone
     on cellular, or you can't get them on the same Wi-Fi) — see step 6,
     you'll need a tunnel instead of a LAN IP.

5. **Start the mobile app**

   ```bash
   npm run mobile
   ```

   This runs `expo start` in `apps/mobile`. Press `i`/`a` for a simulator,
   or scan the printed QR code with Expo Go on your phone (same-Wi-Fi case
   only — see step 6 if your phone's on a different network).

6. **Different network / no shared Wi-Fi?** You need two tunnels — one for
   the API, one for the Expo dev server itself:

   ```bash
   # Terminal A — tunnel the API server (port 3000) with ngrok:
   ngrok http 3000
   # copy the printed https://xxxx.ngrok-free.app URL into apps/mobile/.env:
   #   EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app

   # Terminal B — tunnel the Expo dev server itself:
   npx expo start --tunnel
   ```

   `expo start --tunnel` prints an `exp://...exp.direct` URL — open Expo Go
   on your phone, tap your profile icon → "Enter URL manually", and paste
   it in. Both tunnel URLs are randomly generated and **change every time
   you restart** the tunnel (free ngrok/Expo tunnels aren't stable) — if you
   restart either one, update `apps/mobile/.env` and re-enter the new
   `exp://` URL on your phone.

   Get a free ngrok authtoken at [ngrok.com](https://ngrok.com) and run
   `ngrok config add-authtoken <token>` once before your first `ngrok http`
   call. This same tunnel setup is also what the Arm Swing Game ("Rank
   Match") needs even on the *same* network, since its camera access
   requires an HTTPS origin — see below.

### Running the Arm Swing Game ("Rank Match") on a physical phone

The arm-swing mini-game uses the phone's camera through the browser's
`getUserMedia` API, embedded in a WebView — this works inside plain Expo Go
with no custom dev client or Apple Developer account, but it needs an HTTPS
tunnel to the dev server (camera access requires a secure origin), i.e.
`npx expo start --tunnel` from step 6 above, even if your phone and computer
are already on the same Wi-Fi.

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
- **`Unable to resolve "react-native-css-interop/jsx-runtime"`** — npm
  sometimes nests `react-native-css-interop` under
  `node_modules/nativewind/node_modules/` (to satisfy a peer-dependency
  conflict) instead of hoisting it to the workspace root. Metro's
  `disableHierarchicalLookup` setting in `apps/mobile/metro.config.js`
  (needed for the monorepo `AppEntry.js` fix above) then can't find it.
  Already fixed via `resolver.extraNodeModules` in that same file, pointing
  Metro straight at the nested path.
- **`Environment variable not found: DATABASE_URL`** when running
  `npm run server` — `tsx watch` doesn't load `.env` files on its own (no
  `dotenv` is used anywhere in `apps/server`). Already fixed: the `dev`,
  `start`, and `seed` scripts in `apps/server/package.json` pass
  `--env-file=.env` explicitly. If you add a new script that runs server
  code directly (not through `npm run dev/server`), give it the same flag.
