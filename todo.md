# FitQuest — Open work

Status: vertical slice implemented (auth → onboarding → Home → "Today's
Quest" run-tracking flow → "Rank Match" arm-swing game flow), backed by a
real Fastify/Postgres API. Everything else is a placeholder screen. See
`design/design.md` for the full 18-screen design audit this is built against.

## Things only you can do

- [ ] **Rotate the ngrok authtoken.** The old `README.md` had a real one
      committed in plaintext (`2qj4ad8nYhpNBkrA0VajS2MdXRt_8G9dFa81PsfRgvETnjaD`).
      It's been removed from the new README, but it's still in git history —
      revoke/regenerate it at ngrok's dashboard.
- [ ] **Decide the EAS project slug.** `apps/mobile/app.json` still has
      `"slug": "iosAppDemo"` (left untouched on purpose — it's bound to the
      existing `extra.eas.projectId`, and I didn't want to silently disconnect
      your EAS build history). Rename it if you want, but that's a deliberate
      call, not something to do by accident.
- [ ] **Verify installed package versions.** This was built in a sandbox with
      no Node.js available, so no `npm install` was ever actually run —
      every version number is a best guess, not a verified one.
      - `apps/mobile`: after `npm install`, run `npx expo install --fix` to
        correct anything misaligned with Expo SDK 54 (this covers NativeWind,
        React Navigation, Zustand, `@expo/vector-icons`, `expo-secure-store`,
        `react-native-screens`, `react-native-gesture-handler`, etc.).
      - `apps/server`: double-check `@fastify/cors`/`@fastify/jwt` versions
        are compatible with the pinned Fastify v5, and that the Prisma CLI
        version matches `@prisma/client`'s.
- [ ] **Real assets.** The current character sprites (hair/skin) are the only
      real assets in the project. Missing, needed for the rest of the design:
      - Clothing/accessory sprites for the Shop (currently just an emoji
        placeholder icon in `ShopScreen.js`)
      - Pet sprites (cat mascot appears throughout the mockups)
      - App icon / splash screen redesigned around the FitQuest brand (still
        the generic Expo defaults)
      - The actual Google Fonts used throughout `design/*.html` — Space
        Grotesk, Hanken Grotesk, JetBrains Mono — need to be bundled via
        `expo-font` or `@expo-google-fonts/*` and loaded at boot. Right now
        `tailwind.config.js` declares `font-headline`/`font-body`/etc but
        nothing loads those font files, so text silently falls back to the
        system font.
      - A real Material Symbols icon set, or accept `@expo/vector-icons`'
        `MaterialCommunityIcons` as the permanent icon language (currently
        used as a stand-in — e.g. `sword-cross` for the design's `swords`
        Material Symbol).
- [ ] **Decide on the AI Buddy Chat / AI Food Scan integration.** Which LLM
      provider, whether food-scan uses a vision model or a food database,
      and the cost/privacy model — these are product + budget decisions, not
      technical ones I should make unilaterally.

## Backend

- [ ] Switch from `prisma db push` to real `prisma migrate dev` migrations
      once the schema stabilizes (`db push` was used for this pass because
      there was no live Postgres in the sandbox to generate migration SQL
      against — see `apps/server/Dockerfile`'s comment).
- [ ] Friends: `POST /friends/request`, `POST /friends/:id/accept`, `GET
      /friends/requests` — the `Friendship` table already exists
      (`apps/server/prisma/schema.prisma`), only the request/accept endpoints
      are missing. This is what `AddFriend.html`/`FriendRequest.html`/
      `MyFriendScreen.html` need.
- [ ] Shop purchases: deduct coins/gems and record ownership (needs an
      `Inventory` table — doesn't exist yet).
- [ ] Rate limiting / input validation library (currently hand-rolled checks
      in each route — fine for now, but `zod` + a validation plugin would be
      more robust as routes grow).
- [ ] Automated tests (currently none — no test runner is set up at all).
- [ ] The XP/coin reward formulas in `apps/server/src/lib/leveling.ts` are
      placeholder tuning — revisit once there's real playtesting data.

## Mobile

- [ ] **Race condition in `QuestGameScreen.js`**: if the network round-trip
      to submit the activity is slow, the player can tap to restart the
      Flappy Bird game (it shows a "swing to restart" prompt immediately on
      game-over) before `navigation.replace('GameOver', ...)` actually fires,
      which could submit a second activity. Low-impact on a fast local
      network, but worth guarding (e.g. disable input / show a spinner
      immediately on game-over) before this ships anywhere real.
- [ ] `ArmSwingGameNative.js` (the future real-native-camera path, currently
      unused/kept for later per the original README) was **not** updated with
      the `onGameOver` score-reporting wired into `FlappyBirdGame.js` and
      `ArmSwingGame.web.js` — do that when/if it's adopted.
- [ ] The `AuthScreen.js` (login/signup) has no corresponding mockup in
      `design/*.html` — none of the 18 screens assume an unauthenticated
      state. It's styled to match the app's design system but hasn't been
      design-reviewed. Worth a real design pass.
- [ ] Placeholder screens (`AIBuddyChatScreen`, `MoodTrackerScreen`,
      `HealthLogScreen`) are literally just "Coming soon" — see the AI
      Buddy/Food Scan decision above and the Friends backend work above for
      what unblocks building these for real.
- [ ] `SocialScreen.js`'s leaderboard is real (hits `GET /leaderboard`), but
      there's no "Friends" filter yet (`Leaderboard.html`'s GLOBAL/FRIENDS
      toggle) — blocked on the friends backend work above.
- [ ] `ShopScreen.js` is read-only — blocked on the purchase-flow backend
      work above.
- [ ] No offline handling — if the API is unreachable, run/game results still
      show locally (XP/coins just show as 0) but aren't retried or queued.

## Design fidelity gaps (known, deliberate for this pass)

- Screens were built functionally correct and on-brand (same color tokens,
  same `ChibiSurface`/`ChibiButton` hard-shadow component as the mockups),
  but not pixel-matched line-for-line against every mockup detail. Treat
  `design/*.html` as the source of truth for a later visual-polish pass.
- The neo-brutalist hard-shadow effect (`apps/mobile/src/components/Chibi.js`)
  is a from-scratch React Native implementation of the CSS `chibi-border`/
  `chibi-shadow` classes from `design/design.md` (RN's shadow props are
  always blurred, so this uses a second offset layer instead) — check it
  against the mockups if the look needs tightening.
