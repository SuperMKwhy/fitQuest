# FitQuest — Asset needs for pixel-accurate design pass

Every image in `design/*.html` is currently a placeholder AI-generated URL
with a `data-alt` description of what was intended — none of it is a real
deliverable asset. This list is everything needed to match the mockups
pixel-for-pixel. Drop files at the exact paths below; nothing else needs to
change on the code side once they land there.

Not on this list: the **Material Symbols** icon font — that's a standard
open Google font, not custom art, so it'll be self-hosted directly rather
than sourced from you.

Also flagged: the app's *existing* `apps/mobile/assets/character/*.png`
sprites (simple flat-color shapes) are a different art style than what the
mockups describe ("16-bit chibi, thick black outlines"). Open question:
should new art below match the mockups' chibi style, and should the
*existing* hair/skin sprites be redone to match too, or left as-is with only
net-new pieces added?

## Character / Avatar art — `apps/mobile/assets/character/`

1. `hero_standing.png` (~300×400) — player hero, brown spiky hair, black/mint
   hoodie, standing pose. Used on Activity Tracking, Leaderboard, Shop,
   Workout Summary, Home.
2. `hero_tired.png` (~250×250) — same hero, tired/sweating pose. Game Over
   screen only.
3. `avatar_base.png` (~300×400) — shirtless base body for the Avatar Creator
   canvas.
4. `eyes_brown.png`, `eyes_black.png`, `eyes_green.png`, `eyes_blue.png`,
   `eyes_sharp.png` (~40×40 each) — eye options.
5. `mouth_smile.png`, `mouth_neutral.png`, `mouth_smirk.png`, `mouth_yell.png`,
   `mouth_gentle.png` (~32×32 each) — mouth options.
6. `pose_idle.png`, `pose_flex.png`, `pose_crossed.png`, `pose_thumbsup.png`
   (~48×48 each) — pose thumbnails.
7. `trainer_full.png` + `trainer_bust.png` — trainer girl (ponytail, flexing),
   full-body for the onboarding goal screen + headshot bust for the stats
   screen.
8. `ai_buddy.png` (~120×120) — the AI Buddy chat persona (distinct character,
   not the player).
9. `health_cat_avatar.png` (~100×100) — nutrition-assistant cat avatar,
   Health Log screen only.
10. `pet_cat.png` (~150×150, transparent background) — tuxedo cat pet
    mascot, reused across Activity Tracking, Workout Summary, Leaderboard,
    Shop, Home.

## Food imagery — `apps/mobile/assets/food/`

11. `basil_chicken_rice.png` (~300×300) — sample scanned dish for the AI Food
    Scan mock result.

## Logo / branding — `apps/mobile/assets/`

12. `logo_wordmark.png` (~400×120) — pixel-art "FIT QUEST" wordmark +
    dumbbell, used on Workout Summary + Loading screen.
13. `character/running_sprite.png` (~96px tall, optional/low priority) —
    small running-character sprite on the Loading screen.

## Background art — `apps/mobile/assets/backgrounds/`

14. `home_card_bg.png` — subtle texture/gradient behind one Home screen
    card (mockup gives no further description beyond its existence).

## Not needed

- Shop's dotted background is pure CSS (radial-gradient dots) — no asset
  required, already replicable in code.

## Explicitly out of scope for now

- 13 friend-character portraits across the 3 Friends mockups
  (FriendRequest.html, AddFriend.html, MyFriendScreen.html) — Friends is
  deliberately left stubbed per an earlier decision. Not listed with paths;
  revisit if that scope changes.

## Existing assets (already covered, no action needed)

`apps/mobile/assets/icon.png`, `favicon.png`, `splash-icon.png`,
`android-icon-*.png`, `character/body/{porcelain,fair,olive,tan,brown,deep}.png`,
`character/hair/{bald,short,long,spiky,mohawk}.png`.

Character assets are organized one subfolder per part under
`apps/mobile/assets/character/`: `body/`, `hair/`, `shirt/`, `pant/`. `shirt/`
and `pant/` exist but are still empty — outfit art (item 3's shirt/pant
equivalents, if that scope lands) belongs there, one file per option.
