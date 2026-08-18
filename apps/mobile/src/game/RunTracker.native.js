import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Alert, AppState, Linking,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import tokens from '../theme/tokens';

// Reject GPS fixes that are too imprecise or imply an impossible speed
// (jitter from urban canyons / cold GPS locks), so distance doesn't inflate.
const MAX_ACCEPTABLE_ACCURACY_M = 30;
const MAX_PLAUSIBLE_SPEED_MPS = 12; // ~2:15/km sprint pace, generous ceiling

function haversineDistanceMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatPace(elapsedS, distanceM) {
  if (distanceM < 10) return '--:--';
  const minPerKm = (elapsedS / 60) / (distanceM / 1000);
  if (!isFinite(minPerKm) || minPerKm <= 0) return '--:--';
  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export default function RunTracker({ onExit, onFinish }) {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [runState, setRunState] = useState('idle'); // idle | active | paused
  const [route, setRoute] = useState([]);
  const [distanceM, setDistanceM] = useState(0);
  const [elapsedS, setElapsedS] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [signalWeak, setSignalWeak] = useState(false);

  const startTimeRef = useRef(null);
  const pausedAccumRef = useRef(0);
  const pauseStartedAtRef = useRef(null);
  const watchSubscriptionRef = useRef(null);
  const mapRef = useRef(null);
  const lastUpdateAtRef = useRef(null);
  const weakSignalTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'unknown');
    })();
  }, []);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
  }, []);

  const handleLocationUpdate = useCallback((loc) => {
    const { latitude, longitude, accuracy, speed } = loc.coords;
    lastUpdateAtRef.current = Date.now();
    setSignalWeak(false);

    if (accuracy != null && accuracy > MAX_ACCEPTABLE_ACCURACY_M) return;

    const point = { latitude, longitude };
    setCurrentPosition(point);
    mapRef.current?.animateCamera({ center: point }, { duration: 500 });

    setRoute((prev) => {
      if (prev.length === 0) return [point];
      const last = prev[prev.length - 1];
      const dist = haversineDistanceMeters(last, point);
      const dt = (loc.timestamp - (prev.lastTimestamp || loc.timestamp)) / 1000;
      const impliedSpeed = speed != null && speed >= 0 ? speed : (dt > 0 ? dist / dt : 0);
      if (impliedSpeed > MAX_PLAUSIBLE_SPEED_MPS) return prev;
      if (dist < 1) return prev;
      setDistanceM((d) => d + dist);
      return [...prev, point];
    });
  }, []);

  const beginWatching = useCallback(async () => {
    try {
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 2 },
        handleLocationUpdate
      );
      watchSubscriptionRef.current = sub;
    } catch (e) {
      setPermissionStatus('denied');
    }
  }, [handleLocationUpdate]);

  const startRun = useCallback(async () => {
    setRoute([]);
    setDistanceM(0);
    setElapsedS(0);
    setSignalWeak(false);
    pausedAccumRef.current = 0;
    startTimeRef.current = Date.now();
    lastUpdateAtRef.current = Date.now();
    setRunState('active');
    await beginWatching();
  }, [beginWatching]);

  const pauseRun = useCallback(() => {
    watchSubscriptionRef.current?.remove();
    watchSubscriptionRef.current = null;
    pauseStartedAtRef.current = Date.now();
    setRunState('paused');
  }, []);

  const resumeRun = useCallback(async () => {
    if (pauseStartedAtRef.current) {
      pausedAccumRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    }
    setRunState('active');
    await beginWatching();
  }, [beginWatching]);

  const stopRun = useCallback(() => {
    watchSubscriptionRef.current?.remove();
    watchSubscriptionRef.current = null;
    onFinish({ distanceM, elapsedS, route });
  }, [onFinish, distanceM, elapsedS, route]);

  const confirmExit = useCallback(() => {
    if (runState === 'active' || runState === 'paused') {
      Alert.alert('End run?', 'Your current run in progress will be discarded.', [
        { text: 'Keep running', style: 'cancel' },
        { text: 'End run', style: 'destructive', onPress: onExit },
      ]);
    } else {
      onExit();
    }
  }, [runState, onExit]);

  // Elapsed time derived from wall clock so it survives brief JS-thread throttling.
  useEffect(() => {
    if (runState !== 'active') return;
    const interval = setInterval(() => {
      setElapsedS(Math.max(0, Math.floor((Date.now() - startTimeRef.current - pausedAccumRef.current) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [runState]);

  // Flag weak/lost GPS signal if no fix has arrived in a while.
  useEffect(() => {
    if (runState !== 'active') return;
    weakSignalTimerRef.current = setInterval(() => {
      if (lastUpdateAtRef.current && Date.now() - lastUpdateAtRef.current > 8000) {
        setSignalWeak(true);
      }
    }, 2000);
    return () => clearInterval(weakSignalTimerRef.current);
  }, [runState]);

  // Auto-pause if the app is backgrounded mid-run, so foregrounding later
  // doesn't register a huge implausible jump as real distance.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' && runState === 'active') {
        pauseRun();
      }
    });
    return () => sub.remove();
  }, [runState, pauseRun]);

  useEffect(() => () => watchSubscriptionRef.current?.remove(), []);

  const distanceKm = (distanceM / 1000).toFixed(2);

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.center}>
        <View style={styles.permIconWrap}>
          <MaterialIcons name="location-on" size={40} color={tokens.colors['on-primary-container']} />
        </View>
        <Text style={styles.permTitle}>Location access needed</Text>
        <Text style={styles.permMessage}>
          {permissionStatus === 'denied'
            ? "Location access was denied. Enable it in Settings to track your run."
            : "We need your location to draw your route on the map and measure distance."}
        </Text>
        {permissionStatus === 'denied' ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => Linking.openSettings()} activeOpacity={0.9}>
            <MaterialIcons name="settings" size={18} color={tokens.colors['on-background']} style={styles.btnIcon} />
            <Text style={styles.primaryBtnText}>Open Settings</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission} activeOpacity={0.9}>
            <MaterialIcons name="my-location" size={18} color={tokens.colors['on-background']} style={styles.btnIcon} />
            <Text style={styles.primaryBtnText}>Allow Location</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.secondaryBtn} onPress={onExit}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (runState === 'idle') {
    return (
      <View style={styles.center}>
        <View style={styles.permIconWrap}>
          <MaterialIcons name="directions-run" size={44} color={tokens.colors['on-primary-container']} />
        </View>
        <Text style={styles.permTitle}>Ready to run?</Text>
        <Text style={styles.permMessage}>
          We'll track your route live on the map and measure your distance, pace, and time.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={startRun} activeOpacity={0.9}>
          <MaterialIcons name="play-arrow" size={20} color={tokens.colors['on-background']} style={styles.btnIcon} />
          <Text style={styles.primaryBtnText}>Start Run</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onExit}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        initialRegion={currentPosition ? {
          ...currentPosition, latitudeDelta: 0.005, longitudeDelta: 0.005,
        } : undefined}
      >
        {route.length > 1 && (
          <Polyline coordinates={route} strokeColor={tokens.colors.primary} strokeWidth={4} />
        )}
        {currentPosition && (
          <Marker coordinate={currentPosition} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.currentDot} />
          </Marker>
        )}
      </MapView>

      <TouchableOpacity style={styles.exitBtn} onPress={confirmExit}>
        <MaterialIcons name="close" size={18} color={tokens.colors['on-background']} />
      </TouchableOpacity>

      {signalWeak && (
        <View style={styles.signalBanner}>
          <MaterialIcons name="warning-amber" size={14} color={tokens.colors['on-error-container']} />
          <Text style={styles.signalBannerText}>Weak GPS signal</Text>
        </View>
      )}

      <View style={styles.statsSheet}>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <View style={styles.statIconRow}>
              <MaterialIcons name="straighten" size={14} color={tokens.colors.primary} />
              <Text style={styles.statLabel}>KM</Text>
            </View>
            <Text style={styles.statValue}>{distanceKm}</Text>
          </View>
          <View style={[styles.statBlock, styles.statBlockDivider]}>
            <View style={styles.statIconRow}>
              <MaterialIcons name="schedule" size={14} color={tokens.colors.primary} />
              <Text style={styles.statLabel}>DURATION</Text>
            </View>
            <Text style={styles.statValue}>{formatDuration(elapsedS)}</Text>
          </View>
          <View style={styles.statBlock}>
            <View style={styles.statIconRow}>
              <MaterialIcons name="speed" size={14} color={tokens.colors.primary} />
              <Text style={styles.statLabel}>MIN/KM</Text>
            </View>
            <Text style={styles.statValue}>{formatPace(elapsedS, distanceM)}</Text>
          </View>
        </View>
        <View style={styles.controlsRow}>
          {runState === 'active' ? (
            <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={pauseRun} activeOpacity={0.9}>
              <MaterialIcons name="pause" size={20} color={tokens.colors['on-background']} style={styles.btnIcon} />
              <Text style={styles.controlBtnText}>Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.controlBtn, styles.resumeBtn]} onPress={resumeRun} activeOpacity={0.9}>
              <MaterialIcons name="play-arrow" size={20} color={tokens.colors['on-background']} style={styles.btnIcon} />
              <Text style={styles.controlBtnText}>Resume</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={stopRun} activeOpacity={0.9}>
            <MaterialIcons name="stop" size={20} color={tokens.colors['on-secondary-container']} style={styles.btnIcon} />
            <Text style={[styles.controlBtnText, styles.stopBtnText]}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const INK = tokens.colors.ink;
const SHADOW = tokens.hardShadowOffset;

// Flat "brutalist" ink border + hard offset shadow, matching Chibi.js/
// design.md's chibi-border + chibi-shadow treatment, expressed via plain
// RN shadow/elevation since this file intentionally stays on StyleSheet
// (see src/components/Chibi.js for the NativeWind equivalent).
const chibiCard = {
  borderWidth: 3,
  borderColor: INK,
  borderRadius: tokens.radius.xl,
  shadowColor: INK,
  shadowOffset: { width: SHADOW, height: SHADOW },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  map: { flex: 1 },
  center: {
    flex: 1, backgroundColor: tokens.colors.background, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permIconWrap: {
    width: 88, height: 88, borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors['primary-container'],
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    borderWidth: 3, borderColor: INK,
  },
  permTitle: {
    color: tokens.colors['on-background'], fontSize: 20, marginBottom: 10, textAlign: 'center',
    fontFamily: 'SpaceGrotesk-Bold',
  },
  permMessage: {
    color: tokens.colors['on-surface-variant'], fontSize: 14, textAlign: 'center', lineHeight: 20,
    marginBottom: 24, fontFamily: 'HankenGrotesk-Regular',
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: tokens.colors['primary-container'], borderRadius: tokens.radius.lg,
    paddingVertical: 14, paddingHorizontal: 36, marginBottom: 12,
    ...chibiCard,
  },
  primaryBtnText: { color: tokens.colors['on-background'], fontSize: 16, fontFamily: 'SpaceGrotesk-Bold' },
  secondaryBtn: { paddingVertical: 8 },
  secondaryBtnText: { color: tokens.colors['on-surface-variant'], fontSize: 14, fontFamily: 'HankenGrotesk-Medium' },
  btnIcon: { marginRight: 8 },
  exitBtn: {
    position: 'absolute', top: 56, right: 20, width: 36, height: 36, borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors['surface-container-lowest'], alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: INK,
    shadowColor: INK, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  signalBanner: {
    position: 'absolute', top: 56, left: 20, right: 68,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: tokens.colors['error-container'], borderRadius: tokens.radius.lg,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 3, borderColor: INK,
  },
  signalBannerText: {
    color: tokens.colors['on-error-container'], fontSize: 12, textAlign: 'center',
    fontFamily: 'JetBrainsMono-Bold',
  },
  currentDot: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: tokens.colors['primary-container'],
    borderWidth: 3, borderColor: INK,
  },
  statsSheet: {
    backgroundColor: tokens.colors['surface-container-lowest'],
    borderTopLeftRadius: tokens.radius.xl, borderTopRightRadius: tokens.radius.xl,
    borderTopWidth: 3, borderColor: INK,
    paddingTop: 20, paddingBottom: 32, paddingHorizontal: 20,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statBlock: { alignItems: 'center', flex: 1 },
  statBlockDivider: {
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: tokens.colors['outline-variant'],
  },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  statValue: { color: tokens.colors['on-background'], fontSize: 22, fontFamily: 'JetBrainsMono-Bold' },
  statLabel: { color: tokens.colors['on-surface-variant'], fontSize: 10, fontFamily: 'JetBrainsMono-Bold' },
  controlsRow: { flexDirection: 'row', gap: 12 },
  controlBtn: {
    flex: 1, flexDirection: 'row', borderRadius: tokens.radius.lg, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    ...chibiCard,
  },
  pauseBtn: { backgroundColor: tokens.colors['surface-container'] },
  resumeBtn: { backgroundColor: tokens.colors['primary-container'] },
  stopBtn: { backgroundColor: tokens.colors['secondary-container'] },
  controlBtnText: { color: tokens.colors['on-background'], fontSize: 15, fontFamily: 'SpaceGrotesk-Bold' },
  stopBtnText: { color: tokens.colors['on-secondary-container'] },
});
