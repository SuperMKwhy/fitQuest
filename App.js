import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, SafeAreaView, Animated, Dimensions, Image, Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import ArmSwingGame from './ArmSwingGame';
import RunTracker from './RunTracker';

const { width } = Dimensions.get('window');

// When this app is loaded as a plain web page inside the native app's WebView
// (see ArmSwingGame.js), `?screen=game` tells it to boot straight into the
// game instead of the Home tab.
function shouldOpenGameOnLoad() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('screen') === 'game';
}

const HAIR_STYLES = [
  { id: 'bald', label: 'Bald', asset: null },
  { id: 'short', label: 'Short', asset: require('./assets/character/hair_short.png') },
  { id: 'long', label: 'Long', asset: require('./assets/character/hair_long.png') },
  { id: 'spiky', label: 'Spiky', asset: require('./assets/character/hair_spiky.png') },
  { id: 'mohawk', label: 'Mohawk', asset: require('./assets/character/hair_mohawk.png') },
];

const SKIN_TONES = [
  { id: 'porcelain', label: 'Porcelain', swatch: '#ffe0bd', asset: require('./assets/character/body_porcelain.png') },
  { id: 'fair', label: 'Fair', swatch: '#f1c296', asset: require('./assets/character/body_fair.png') },
  { id: 'olive', label: 'Olive', swatch: '#e0ac69', asset: require('./assets/character/body_olive.png') },
  { id: 'tan', label: 'Tan', swatch: '#c68642', asset: require('./assets/character/body_tan.png') },
  { id: 'brown', label: 'Brown', swatch: '#8d5524', asset: require('./assets/character/body_brown.png') },
  { id: 'deep', label: 'Deep', swatch: '#5c3317', asset: require('./assets/character/body_deep.png') },
];

const QUOTES = [
  "Push harder than yesterday if you want a different tomorrow.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Success starts with self-discipline.",
  "Don't limit your challenges. Challenge your limits.",
];

const EXERCISES = [
  { name: 'Push-ups', sets: 3, reps: 15, emoji: '💪' },
  { name: 'Squats', sets: 4, reps: 20, emoji: '🦵' },
  { name: 'Plank', sets: 3, reps: '45s', emoji: '🏋️' },
  { name: 'Jumping Jacks', sets: 3, reps: 30, emoji: '⚡' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [steps, setSteps] = useState(3847);
  const [hairIndex, setHairIndex] = useState(1);
  const [skinIndex, setSkinIndex] = useState(1);
  const [gameOpen, setGameOpen] = useState(shouldOpenGameOnLoad);
  const [runOpen, setRunOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  const xpForNext = level * 100;
  const xpProgress = (xp % xpForNext) / xpForNext;

  useEffect(() => {
    const timer = setInterval(() => {
      setSteps(s => s + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nextQuote = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setQuoteIndex(i => (i + 1) % QUOTES.length);
  };

  const completeExercise = (name) => {
    if (completedExercises.includes(name)) return;
    setCompletedExercises(prev => [...prev, name]);
    const gained = 25;
    const newXp = xp + gained;
    if (newXp >= xpForNext) {
      setLevel(l => l + 1);
      setXp(newXp - xpForNext);
    } else {
      setXp(newXp);
    }
    Animated.sequence([
      Animated.timing(xpAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(xpAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const xpBounce = xpAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

  if (gameOpen) {
    return <ArmSwingGame onExit={() => setGameOpen(false)} />;
  }

  if (runOpen) {
    return <RunTracker onExit={() => setRunOpen(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, Mangkorn 👋</Text>
          <Text style={styles.subGreeting}>Let's crush today's workout</Text>
        </View>
        <Animated.View style={[styles.levelBadge, { transform: [{ scale: xpBounce }] }]}>
          <Text style={styles.levelText}>LVL {level}</Text>
        </Animated.View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'home' && (
          <View>
            <View style={styles.card}>
              <View style={styles.xpRow}>
                <Text style={styles.cardTitle}>⚡ XP Progress</Text>
                <Text style={styles.xpNumbers}>{xp} / {xpForNext} XP</Text>
              </View>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
              </View>
            </View>

            <View style={[styles.card, styles.stepsCard]}>
              <Text style={styles.stepsEmoji}>👟</Text>
              <View>
                <Text style={styles.stepsCount}>{steps.toLocaleString()}</Text>
                <Text style={styles.stepsLabel}>steps today</Text>
              </View>
              <View style={styles.stepsGoal}>
                <Text style={styles.stepsGoalText}>{Math.round(steps / 10000 * 100)}%</Text>
                <Text style={styles.stepsGoalLabel}>of goal</Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.card, styles.quoteCard]} onPress={nextQuote}>
              <Animated.Text style={[styles.quoteText, { opacity: fadeAnim }]}>
                "{QUOTES[quoteIndex]}"
              </Animated.Text>
              <Text style={styles.quoteTap}>tap for next ✨</Text>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#1a1a2e' }]}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statValue}>420</Text>
                <Text style={styles.statLabel}>kcal</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#1a1a2e' }]}>
                <Text style={styles.statEmoji}>⏱️</Text>
                <Text style={styles.statValue}>38</Text>
                <Text style={styles.statLabel}>mins</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#1a1a2e' }]}>
                <Text style={styles.statEmoji}>💧</Text>
                <Text style={styles.statValue}>6/8</Text>
                <Text style={styles.statLabel}>glasses</Text>
              </View>
            </View>
          </View>
        )}

        {tab === 'workout' && (
          <View>
            <Text style={styles.sectionTitle}>Today's Quest 🗡️</Text>
            <Text style={styles.sectionSub}>Complete all exercises to earn XP</Text>

            <TouchableOpacity style={[styles.card, styles.gameCard]} onPress={() => setGameOpen(true)}>
              <Text style={styles.gameEmoji}>🐦</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Arm Swing Game</Text>
                <Text style={styles.gameSub}>Swing your arm in front of the camera to flap the bird!</Text>
              </View>
            </TouchableOpacity>

            {EXERCISES.map((ex) => {
              const done = completedExercises.includes(ex.name);
              return (
                <TouchableOpacity
                  key={ex.name}
                  style={[styles.exerciseCard, done && styles.exerciseDone]}
                  onPress={() => completeExercise(ex.name)}
                >
                  <Text style={styles.exerciseEmoji}>{ex.emoji}</Text>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, done && styles.exerciseNameDone]}>
                      {ex.name}
                    </Text>
                    <Text style={styles.exerciseDetail}>
                      {ex.sets} sets × {ex.reps}
                    </Text>
                  </View>
                  <View style={[styles.exerciseBadge, done && styles.exerciseBadgeDone]}>
                    <Text style={styles.exerciseBadgeText}>{done ? '✓' : '+25 XP'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {completedExercises.length === EXERCISES.length && (
              <View style={styles.completedBanner}>
                <Text style={styles.completedText}>🎉 Quest Complete! Amazing work!</Text>
              </View>
            )}
          </View>
        )}

        {tab === 'run' && (
          <View>
            <Text style={styles.sectionTitle}>Track a Run 🏃</Text>
            <Text style={styles.sectionSub}>Live GPS route on the map, distance, pace, and time</Text>

            <TouchableOpacity style={[styles.card, styles.gameCard]} onPress={() => setRunOpen(true)}>
              <Text style={styles.gameEmoji}>🗺️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Start a Run</Text>
                <Text style={styles.gameSub}>We'll draw your route live on the map as you move.</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'character' && (
          <View>
            <Text style={styles.sectionTitle}>Create Your Hero 🎮</Text>
            <Text style={styles.sectionSub}>Pick a hairstyle and skin tone</Text>

            <View style={styles.spriteFrame}>
              <Image
                source={SKIN_TONES[skinIndex].asset}
                style={styles.spriteLayer}
                resizeMode="contain"
              />
              {HAIR_STYLES[hairIndex].asset && (
                <Image
                  source={HAIR_STYLES[hairIndex].asset}
                  style={styles.spriteLayer}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>💇 Hairstyle: {HAIR_STYLES[hairIndex].label}</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={HAIR_STYLES.length - 1}
                step={1}
                value={hairIndex}
                onValueChange={setHairIndex}
                minimumTrackTintColor="#e94560"
                maximumTrackTintColor="#1e1e3a"
                thumbTintColor="#e94560"
              />
              <View style={styles.sliderTicksRow}>
                {HAIR_STYLES.map((h, i) => (
                  <Text
                    key={h.id}
                    style={[styles.sliderTick, i === hairIndex && styles.sliderTickActive]}
                  >
                    {h.label}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎨 Skin Tone: {SKIN_TONES[skinIndex].label}</Text>
              <View style={styles.swatchRow}>
                {SKIN_TONES.map((s, i) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSkinIndex(i)}
                    style={[
                      styles.swatch,
                      { backgroundColor: s.swatch },
                      i === skinIndex && styles.swatchActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {tab === 'profile' && (
          <View>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <Text style={styles.profileName}>Mangkorn</Text>
              <Text style={styles.profileSub}>Fitness Warrior · Level {level}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Stats</Text>
              {[
                ['Total XP', xp + (level - 1) * 100],
                ['Exercises Done', completedExercises.length],
                ['Current Level', level],
                ['Steps Today', steps.toLocaleString()],
              ].map(([label, val]) => (
                <View key={label} style={styles.statRow}>
                  <Text style={styles.statRowLabel}>{label}</Text>
                  <Text style={styles.statRowVal}>{val}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.card, { backgroundColor: '#0f3460' }]}>
              <Text style={styles.cardTitle}>🏆 Achievements</Text>
              <Text style={styles.achievementText}>
                {completedExercises.length >= 4 ? '✅' : '🔒'} Complete all daily exercises
              </Text>
              <Text style={styles.achievementText}>
                {steps >= 5000 ? '✅' : '🔒'} Walk 5,000 steps
              </Text>
              <Text style={styles.achievementText}>
                {level >= 2 ? '✅' : '🔒'} Reach Level 2
              </Text>
            </View>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.nav}>
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'workout', label: 'Workout', icon: '🏋️' },
          { id: 'run', label: 'Run', icon: '🏃' },
          { id: 'character', label: 'Character', icon: '🧙' },
          { id: 'profile', label: 'Profile', icon: '👤' },
        ].map(t => (
          <TouchableOpacity key={t.id} style={styles.navItem} onPress={() => setTab(t.id)}>
            <Text style={styles.navIcon}>{t.icon}</Text>
            <Text style={[styles.navLabel, tab === t.id && styles.navLabelActive]}>
              {t.label}
            </Text>
            {tab === t.id && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subGreeting: { color: '#888', fontSize: 13, marginTop: 2 },
  levelBadge: {
    backgroundColor: '#e94560', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  levelText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  content: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: '#12122a', borderRadius: 16, padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 10 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpNumbers: { color: '#e94560', fontSize: 13, fontWeight: '600' },
  xpBarBg: { height: 8, backgroundColor: '#1e1e3a', borderRadius: 4 },
  xpBarFill: { height: 8, backgroundColor: '#e94560', borderRadius: 4 },
  stepsCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepsEmoji: { fontSize: 36 },
  stepsCount: { color: '#fff', fontSize: 28, fontWeight: '800' },
  stepsLabel: { color: '#888', fontSize: 13 },
  stepsGoal: { marginLeft: 'auto', alignItems: 'center' },
  stepsGoalText: { color: '#4ade80', fontSize: 22, fontWeight: '800' },
  stepsGoalLabel: { color: '#888', fontSize: 12 },
  quoteCard: { backgroundColor: '#0f3460' },
  gameCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f3460', gap: 14 },
  gameEmoji: { fontSize: 34 },
  gameSub: { color: '#aaa', fontSize: 12, marginTop: 4 },
  quoteText: { color: '#ccc', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  quoteTap: { color: '#555', fontSize: 11, marginTop: 8, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#666', fontSize: 11, marginTop: 2 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4, marginTop: 4 },
  sectionSub: { color: '#666', fontSize: 13, marginBottom: 16 },
  exerciseCard: {
    backgroundColor: '#12122a', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  exerciseDone: { backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: '#4ade80' },
  exerciseEmoji: { fontSize: 28, marginRight: 14 },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  exerciseNameDone: { color: '#4ade80' },
  exerciseDetail: { color: '#666', fontSize: 13, marginTop: 2 },
  exerciseBadge: {
    backgroundColor: '#1e1e3a', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  exerciseBadgeDone: { backgroundColor: '#14532d' },
  exerciseBadgeText: { color: '#e94560', fontSize: 12, fontWeight: '700' },
  completedBanner: {
    backgroundColor: '#14532d', borderRadius: 14, padding: 16, alignItems: 'center',
  },
  completedText: { color: '#4ade80', fontSize: 16, fontWeight: '700' },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e94560', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  profileName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileSub: { color: '#888', fontSize: 14, marginTop: 4 },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e1e3a',
  },
  statRowLabel: { color: '#888', fontSize: 14 },
  statRowVal: { color: '#fff', fontSize: 14, fontWeight: '700' },
  achievementText: { color: '#ccc', fontSize: 14, paddingVertical: 6 },
  spriteFrame: {
    width: 240, height: 270, alignSelf: 'center',
    backgroundColor: '#12122a', borderRadius: 12,
    borderWidth: 3, borderColor: '#1e1e3a',
    marginBottom: 16, overflow: 'hidden',
  },
  spriteLayer: {
    position: 'absolute', top: 0, left: 0, width: 240, height: 270,
  },
  sliderTicksRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 4,
  },
  sliderTick: { color: '#555', fontSize: 10 },
  sliderTickActive: { color: '#e94560', fontWeight: '700' },
  swatchRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  swatch: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: 'transparent',
  },
  swatchActive: { borderColor: '#fff' },
  nav: {
    flexDirection: 'row', backgroundColor: '#0d0d20',
    borderTopWidth: 1, borderTopColor: '#1a1a35',
    paddingBottom: 8, paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIcon: { fontSize: 20 },
  navLabel: { color: '#555', fontSize: 11, marginTop: 2 },
  navLabelActive: { color: '#e94560', fontWeight: '700' },
  navDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#e94560', marginTop: 3,
  },
});
