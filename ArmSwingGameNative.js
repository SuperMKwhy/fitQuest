import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  Camera, useCameraDevice, useCameraPermission, useFrameProcessor,
} from 'react-native-vision-camera';
import { useSharedValue, useRunOnJS } from 'react-native-worklets-core';
import FlappyBirdGame from './FlappyBirdGame';

// Classical computer-vision swing detector (no ML): downsample each frame to a
// coarse luminance grid, diff it against the previous frame to find where motion
// is happening, take the motion-weighted vertical centroid, and smooth it. Raising
// the smoothed centroid into the "high" zone (after having been "low") fires one
// swing event, requiring the arm back down before the next flap counts.
const GRID_COLS = 12;
const GRID_ROWS = 9;
const MOTION_PIXEL_THRESHOLD = 22; // per-sample luminance delta to count as "moving"
const MIN_MOTION_SAMPLES = 6; // ignore frames with too little motion (noise)
const HIGH_ZONE = 0.38;
const LOW_ZONE = 0.62;
const SWING_COOLDOWN_MS = 350;
const ANALYZE_EVERY_N_FRAMES = 2;

export default function ArmSwingGame({ onExit }) {
  const { hasPermission, requestPermission, canRequestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [swingSignal, setSwingSignal] = useState(0);

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission();
    }
  }, [hasPermission, canRequestPermission, requestPermission]);

  const prevGrid = useSharedValue(new Array(GRID_COLS * GRID_ROWS).fill(0));
  const smoothedCentroid = useSharedValue(0.5);
  const armZone = useSharedValue('low');
  const lastSwingTime = useSharedValue(0);
  const frameCounter = useSharedValue(0);

  const registerSwing = useRunOnJS(() => {
    setSwingSignal(s => s + 1);
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    frameCounter.value += 1;
    if (frameCounter.value % ANALYZE_EVERY_N_FRAMES !== 0) return;

    const buffer = frame.toArrayBuffer();
    const data = new Uint8Array(buffer);
    const bytesPerRow = frame.bytesPerRow;
    const width = frame.width;
    const height = frame.height;
    if (!bytesPerRow || !width || !height) return;

    const prev = prevGrid.value;
    const next = new Array(GRID_COLS * GRID_ROWS);
    let motionCount = 0;
    let weightedYSum = 0;

    for (let row = 0; row < GRID_ROWS; row++) {
      const y = Math.floor(((row + 0.5) / GRID_ROWS) * height);
      for (let col = 0; col < GRID_COLS; col++) {
        const x = Math.floor(((col + 0.5) / GRID_COLS) * width);
        const idx = y * bytesPerRow + x;
        const lum = data[idx] ?? 0;
        const cellIndex = row * GRID_COLS + col;
        const diff = Math.abs(lum - prev[cellIndex]);
        next[cellIndex] = lum;
        if (diff > MOTION_PIXEL_THRESHOLD) {
          motionCount += 1;
          weightedYSum += row / (GRID_ROWS - 1);
        }
      }
    }
    prevGrid.value = next;

    if (motionCount >= MIN_MOTION_SAMPLES) {
      const centroid = weightedYSum / motionCount;
      smoothedCentroid.value = smoothedCentroid.value * 0.6 + centroid * 0.4;
    }

    const now = frame.timestamp / 1e6; // ns -> ms
    if (smoothedCentroid.value <= HIGH_ZONE && armZone.value === 'low') {
      if (now - lastSwingTime.value > SWING_COOLDOWN_MS) {
        armZone.value = 'high';
        lastSwingTime.value = now;
        registerSwing();
      }
    } else if (smoothedCentroid.value >= LOW_ZONE && armZone.value === 'high') {
      armZone.value = 'low';
    }
  }, [registerSwing]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access is needed to track your arm swing.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onExit}>
          <Text style={styles.closeText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No front camera found on this device.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onExit}>
          <Text style={styles.closeText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="yuv"
        frameProcessor={frameProcessor}
      />
      <FlappyBirdGame swingSignal={swingSignal} onExit={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  message: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#e94560', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  closeButton: { marginTop: 16, padding: 10 },
  closeText: { color: '#888' },
});
