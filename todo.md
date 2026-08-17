# Arm Swing Game — things only you can do

## Run it exactly like before

```
NGROK_AUTHTOKEN=2qj4ad8nYhpNBkrA0VajS2MdXRt_8G9dFa81PsfRgvETnjaD ELECTRON_DISABLE_SANDBOX=1 npx expo start --tunnel
```

Same command as always — no `--web`, no EAS build, no Apple Developer
account. Open it in **Expo Go** on your iPhone like usual.

## What changed under the hood

- Home / Workout / Character / Profile tabs are still the real native app, same as before.
- Tapping the "🐦 Arm Swing Game" card now opens a full-screen **WebView**
  inside the app, pointed at the same dev-server URL Expo Go is already
  connected to (so it needs no extra server, tunnel, or manual URL — it's
  fully automatic).
- That WebView loads the browser build of the game (`ArmSwingGame.web.js`),
  which uses the phone's camera via the browser's `getUserMedia` API — same
  underlying engine Safari uses, just embedded instead of a separate tab.
- This all works inside Expo Go because `react-native-webview` is a
  supported Expo Go module — no custom dev client needed.

## Testing checklist

- [ ] Confirm the rest of the app (Home/Workout/Character/Profile) still works exactly like before
- [ ] Tap "Arm Swing Game" — confirm it opens in-app (not a separate Safari tab) and asks for camera permission
- [ ] Confirm you see your live camera feed inside the game screen
- [ ] Swing your arm up (into the top part of the camera view) and back down — confirm the bird flaps once per swing
- [ ] Play a full round and tell me if the flap feels laggy, over-sensitive, or under-sensitive so I can tune the motion thresholds in `ArmSwingGame.web.js`
- [ ] Tap the ✕ button — confirm it closes the game and returns to the Workout tab

## If the camera permission prompt never appears

iOS WKWebView camera support needs iOS 15+ (should be fine on any modern
iPhone) and the tunnel URL must be `https://` (the ngrok tunnel already
gives you this). If it still doesn't prompt, tell me and we'll debug from
there — this in-app WebView camera path is less battle-tested than plain
Safari, so it's worth confirming it actually works before relying on it.

## (Later, optional) Real native camera + real installed app

`ArmSwingGameNative.js` has a full native-camera implementation using
`react-native-vision-camera` (no WebView, no browser) for whenever you're
open to the $99/year Apple Developer Program — it gives a real installed
app icon and works offline, with better performance than the WebView
version. Not needed for now, just kept around for later.
