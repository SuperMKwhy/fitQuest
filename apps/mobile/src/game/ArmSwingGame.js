import { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// Native (Expo Go) entry point: rather than a native camera library (which needs
// a custom dev client / paid Apple Developer account to install), this embeds the
// same browser-based game (see ArmSwingGame.web.js) in a WebView. The dev server
// that served this very app's JS bundle also serves the web build of the app on
// the same origin, so we just point the WebView back at that origin with a query
// param that boots straight into the game screen.
function getDevServerOrigin() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.hostUri;
  if (hostUri) {
    const hostOnly = hostUri.replace(/^https?:\/\//, '').split('/')[0];
    return `https://${hostOnly}`;
  }
  const experienceUrl = Constants.experienceUrl;
  const match = experienceUrl?.match(/^[a-zA-Z0-9+.-]+:\/\/([^/]+)/);
  return match ? `https://${match[1]}` : null;
}

export default function ArmSwingGame({ onExit, onScore }) {
  const origin = useMemo(getDevServerOrigin, []);
  const [failed, setFailed] = useState(false);

  if (!origin || failed) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Couldn't reach the game page automatically.{'\n'}
          Make sure the app was started with `expo start --tunnel` (not a
          production build) and try again.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onExit}>
          <Text style={styles.closeText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: `${origin}/?screen=game` }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        onError={() => setFailed(true)}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'gameover') onScore?.(message.score);
          } catch {
            // Ignore anything that isn't the JSON message we're expecting.
          }
        }}
        style={styles.webview}
      />
      <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },
  center: {
    flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  message: { color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  closeButton: { marginTop: 4, padding: 10 },
  closeText: { color: '#888' },
  exitBtn: {
    position: 'absolute', top: 50, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  exitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
