import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

// react-native-maps is native-only, so the run tracker isn't available in the
// browser build (see RunTracker.native.js for the real implementation).
export default function RunTracker({ onExit }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>🏃</Text>
      <Text style={styles.title}>Run tracking isn't available here</Text>
      <Text style={styles.message}>
        Live GPS route tracking needs the native app. Open this in Expo Go on
        your phone to use it.
      </Text>
      <TouchableOpacity style={styles.secondaryBtn} onPress={onExit}>
        <Text style={styles.secondaryBtnText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  message: { color: '#aaa', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  secondaryBtn: { paddingVertical: 8 },
  secondaryBtnText: { color: '#666', fontSize: 14 },
});
