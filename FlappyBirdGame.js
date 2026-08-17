import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const BIRD_X = 70;
const BIRD_SIZE = 34;
const DEFAULT_GRAVITY = 1500;
const MIN_GRAVITY = 300;
const MAX_GRAVITY = 3000;
const FLAP_VELOCITY = -480;
const PIPE_WIDTH = 64;
const PIPE_GAP = 210;
const PIPE_SPEED = 140;
const PIPE_INTERVAL = 260;
const GROUND_H = 40;

function makePipe(x) {
  const gapY = 90 + Math.random() * (SCREEN_H - GROUND_H - 180 - 90);
  return { x, gapY, passed: false };
}

// controlledY: optional 0..1 fraction (e.g. head height). When provided, the
// bird has no gravity/flap physics -- its vertical position directly follows
// controlledY every frame, dodging obstacles is on you (push-ups, ducking,
// etc.), not a flap impulse. When omitted, behaves like classic Flappy Bird
// (gravity + a flap impulse on each swingSignal change).
export default function FlappyBirdGame({ swingSignal, controlledY, onExit }) {
  const isControlled = controlledY != null;
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(SCREEN_H / 2);
  const [pipes, setPipes] = useState([{ x: SCREEN_W + 100, gapY: SCREEN_H / 2, passed: false }]);

  const [gravity, setGravity] = useState(DEFAULT_GRAVITY);

  const birdYRef = useRef(birdY);
  const velocityRef = useRef(0);
  const pipesRef = useRef(pipes);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const lastSwingRef = useRef(swingSignal);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const gravityRef = useRef(gravity);
  const controlledYRef = useRef(controlledY);
  useEffect(() => { gravityRef.current = gravity; }, [gravity]);
  useEffect(() => { controlledYRef.current = controlledY; }, [controlledY]);

  useEffect(() => {
    if (isControlled) {
      startGame();
      return;
    }
    if (swingSignal === lastSwingRef.current) return;
    lastSwingRef.current = swingSignal;
    if (gameStateRef.current === 'ready') {
      startGame();
    } else if (gameStateRef.current === 'playing') {
      velocityRef.current = FLAP_VELOCITY;
    }
  }, [swingSignal]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startGame = () => {
    birdYRef.current = SCREEN_H / 2;
    velocityRef.current = FLAP_VELOCITY;
    pipesRef.current = [makePipe(SCREEN_W + 100)];
    scoreRef.current = 0;
    setScore(0);
    setGameState('playing');
    gameStateRef.current = 'playing';
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(loop);
  };

  const endGame = () => {
    gameStateRef.current = 'gameover';
    setGameState('gameover');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const loop = (time) => {
    if (lastTimeRef.current == null) lastTimeRef.current = time;
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = time;

    if (isControlled) {
      const frac = Math.min(Math.max(controlledYRef.current ?? 0.5, 0), 1);
      birdYRef.current = frac * (SCREEN_H - GROUND_H - BIRD_SIZE);
    } else {
      velocityRef.current += gravityRef.current * dt;
      birdYRef.current += velocityRef.current * dt;
    }

    let pipes = pipesRef.current.map(p => ({ ...p, x: p.x - PIPE_SPEED * dt }));
    if (pipes.length === 0 || pipes[pipes.length - 1].x < SCREEN_W - PIPE_INTERVAL) {
      pipes.push(makePipe(SCREEN_W + PIPE_WIDTH));
    }
    pipes = pipes.filter(p => p.x > -PIPE_WIDTH);

    let gained = 0;
    pipes = pipes.map(p => {
      if (!p.passed && p.x + PIPE_WIDTH < BIRD_X) {
        gained += 1;
        return { ...p, passed: true };
      }
      return p;
    });
    if (gained > 0) {
      scoreRef.current += gained;
      setScore(scoreRef.current);
    }
    pipesRef.current = pipes;

    const birdTop = birdYRef.current;
    const birdBottom = birdYRef.current + BIRD_SIZE;
    let collided = birdTop < 0 || birdBottom > SCREEN_H - GROUND_H;
    if (!collided) {
      for (const p of pipes) {
        const overlapsX = BIRD_X + BIRD_SIZE > p.x && BIRD_X < p.x + PIPE_WIDTH;
        if (overlapsX) {
          const hitsTopPipe = birdTop < p.gapY;
          const hitsBottomPipe = birdBottom > p.gapY + PIPE_GAP;
          if (hitsTopPipe || hitsBottomPipe) {
            collided = true;
            break;
          }
        }
      }
    }

    setBirdY(birdYRef.current);
    setPipes(pipes);

    if (collided) {
      endGame();
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {!isControlled && (
        <View style={styles.debugPanel} pointerEvents="box-none">
          <Text style={styles.debugLabel}>Drop speed (gravity): {Math.round(gravity)}</Text>
          <Slider
            style={styles.debugSlider}
            minimumValue={MIN_GRAVITY}
            maximumValue={MAX_GRAVITY}
            step={50}
            value={gravity}
            onValueChange={setGravity}
            minimumTrackTintColor="#e94560"
            maximumTrackTintColor="#1e1e3a"
            thumbTintColor="#e94560"
          />
        </View>
      )}

      {pipes.map((p, i) => (
        <View key={i} pointerEvents="none">
          <View style={[styles.pipe, { left: p.x, top: 0, height: p.gapY }]} />
          <View style={[styles.pipe, { left: p.x, top: p.gapY + PIPE_GAP, height: SCREEN_H - GROUND_H - (p.gapY + PIPE_GAP) }]} />
        </View>
      ))}

      <View style={[styles.bird, { left: BIRD_X, top: birdY }]} pointerEvents="none">
        <Text style={styles.birdEmoji}>🐦</Text>
      </View>

      <View style={styles.ground} pointerEvents="none" />

      <View style={styles.scoreBox} pointerEvents="none">
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>

      {gameState === 'ready' && !isControlled && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayTitle}>Arm Swing 🐦</Text>
          <Text style={styles.overlayText}>Swing your arm up in view of the camera to flap!</Text>
        </View>
      )}

      {gameState === 'gameover' && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Game Over</Text>
          <Text style={styles.overlayText}>Score: {score}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={startGame}>
            <Text style={styles.retryText}>{isControlled ? 'Tap to try again' : 'Swing to restart'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
    backgroundColor: '#3ec46d',
    borderWidth: 3,
    borderColor: '#2a9950',
  },
  bird: {
    position: 'absolute',
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  birdEmoji: { fontSize: BIRD_SIZE },
  ground: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, height: GROUND_H,
    backgroundColor: '#8b5a2b',
  },
  scoreBox: {
    position: 'absolute', top: 50, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  scoreText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  exitBtn: {
    position: 'absolute', top: 50, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  exitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  debugPanel: {
    position: 'absolute', left: 10, right: 10, top: 100,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  debugSlider: {
    width: '100%', height: 30,
  },
  debugLabel: {
    color: '#fff', fontSize: 12, fontWeight: '600',
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)', padding: 24,
  },
  overlayTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 12 },
  overlayText: { color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: '#e94560', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
