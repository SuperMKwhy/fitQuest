import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import FlappyBirdGame from './FlappyBirdGame';

// Uses the browser's getUserMedia camera API directly (like any webcam-test
// site) instead of a native camera library. Both modes use real on-device ML
// models from Google's MediaPipe (the same model family behind Instagram/
// Snapchat-style filters), running locally via WebAssembly -- no cloud calls
// per frame, just a one-time model download per session:
//   - "arm": PoseLandmarker tracks shoulder/wrist keypoints; raising either
//     wrist above shoulder height and back down counts as one swing.
//   - "face": FaceDetector (BlazeFace) tracks a face box + eye keypoints.
//   - "pushup": FaceDetector tracks the nose tip; the bird has no gravity and
//     is pinned directly to nose height every frame (Flappy Bird's pipes
//     still scroll in), so you dodge obstacles by pushing up and down.
const SWING_COOLDOWN_MS = 350;
const ARM_RAISE_MARGIN = 0.06; // wrist must clear shoulder height by this fraction of frame height
const POSE_MIN_VISIBILITY = 0.5;
const POSE_ANALYZE_EVERY_N_FRAMES = 2;
const FACE_ANALYZE_EVERY_N_FRAMES = 2;

const MEDIAPIPE_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/vision_bundle.mjs';
const MEDIAPIPE_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const FACE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const POSE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// Pose landmark indices (MediaPipe Pose convention).
const LEFT_SHOULDER = 11, RIGHT_SHOULDER = 12, LEFT_WRIST = 15, RIGHT_WRIST = 16;
// BlazeFace keypoint index (see FaceTracker below for the full order).
const NOSE_TIP = 2;

// @mediapipe/tasks-vision can't be bundled by Metro (it contains a dynamic
// import() with a non-literal argument, which Metro's bundler rejects at
// build time, unlike webpack). So instead of `import`-ing the npm package,
// we load it straight from a CDN via a native <script type="module"> tag,
// which the browser's own module loader handles at runtime -- invisible to
// Metro's static bundling entirely.
function loadMediaPipeTask({ exportName, modelAssetPath, extraOptions = '', eventPrefix }) {
  return new Promise((resolve, reject) => {
    const readyEvent = `${eventPrefix}-ready`;
    const errorEvent = `${eventPrefix}-error`;
    window.addEventListener(readyEvent, (e) => resolve(e.detail), { once: true });
    window.addEventListener(errorEvent, (e) => reject(new Error(e.detail)), { once: true });

    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { ${exportName}, FilesetResolver } from '${MEDIAPIPE_MODULE_URL}';
      FilesetResolver.forVisionTasks('${MEDIAPIPE_WASM_URL}')
        .then((vision) => ${exportName}.createFromOptions(vision, {
          baseOptions: { modelAssetPath: '${modelAssetPath}' },
          runningMode: 'VIDEO',
          ${extraOptions}
        }))
        .then((task) => window.dispatchEvent(new CustomEvent('${readyEvent}', { detail: task })))
        .catch((err) => window.dispatchEvent(new CustomEvent('${errorEvent}', { detail: String(err) })));
    `;
    document.head.appendChild(script);
  });
}

let faceDetectorPromise = null;
function loadFaceDetector() {
  if (!faceDetectorPromise) {
    faceDetectorPromise = loadMediaPipeTask({
      exportName: 'FaceDetector',
      modelAssetPath: FACE_MODEL_URL,
      eventPrefix: 'mediapipe-face-detector',
    });
  }
  return faceDetectorPromise;
}

let poseLandmarkerPromise = null;
function loadPoseLandmarker() {
  if (!poseLandmarkerPromise) {
    poseLandmarkerPromise = loadMediaPipeTask({
      exportName: 'PoseLandmarker',
      modelAssetPath: POSE_MODEL_URL,
      extraOptions: 'numPoses: 1,',
      eventPrefix: 'mediapipe-pose-landmarker',
    });
  }
  return poseLandmarkerPromise;
}

export default function ArmSwingGame({ onExit }) {
  const [mode, setMode] = useState(null); // null | 'arm' | 'face' | 'pushup'

  if (mode === 'arm') return <ArmTracker onExit={onExit} />;
  if (mode === 'face') return <FaceTracker onExit={onExit} onChangeMode={() => setMode(null)} />;
  if (mode === 'pushup') return <PushUpTracker onExit={onExit} onChangeMode={() => setMode(null)} />;

  return (
    <View style={styles.center}>
      <Text style={styles.pickerTitle}>Choose a mode</Text>

      <TouchableOpacity style={styles.modeCard} onPress={() => setMode('arm')}>
        <Text style={styles.modeEmoji}>🐦</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.modeTitle}>Arm Swing Game</Text>
          <Text style={styles.modeSub}>Swing your arm to flap the bird</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modeCard} onPress={() => setMode('face')}>
        <Text style={styles.modeEmoji}>🙂</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.modeTitle}>Face Tracker</Text>
          <Text style={styles.modeSub}>On-device ML face + eye tracking</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modeCard} onPress={() => setMode('pushup')}>
        <Text style={styles.modeEmoji}>🏋️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.modeTitle}>Push-Up Tracker</Text>
          <Text style={styles.modeSub}>Push up and down to dodge the pipes</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onExit}>
        <Text style={styles.closeText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function ArmTracker({ onExit }) {
  const videoRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('requesting'); // requesting | ready | denied | unsupported
  const [poseStatus, setPoseStatus] = useState('loading'); // loading | ready | error
  const [swingSignal, setSwingSignal] = useState(0);
  const [track, setTrack] = useState(null); // { wristX, wristY, shoulderY, active, zone }

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      return;
    }

    let stream;
    let rafId;
    let cancelled = false;
    let landmarker = null;
    let frameCount = 0;

    let armZone = 'low';
    let lastSwingTime = 0;
    let smoothedShoulderY = 0.4;
    let smoothedWristX = 0.5;
    let smoothedWristY = 0.7;

    const analyze = (time) => {
      frameCount += 1;
      const video = videoRef.current;
      if (
        landmarker && video && video.readyState >= 2 && video.videoWidth &&
        frameCount % POSE_ANALYZE_EVERY_N_FRAMES === 0
      ) {
        const result = landmarker.detectForVideo(video, time);
        const pose = result.landmarks?.[0];

        let active = false;
        if (pose) {
          const leftShoulder = pose[LEFT_SHOULDER];
          const rightShoulder = pose[RIGHT_SHOULDER];
          const leftWrist = pose[LEFT_WRIST];
          const rightWrist = pose[RIGHT_WRIST];
          const shouldersOk = leftShoulder?.visibility > POSE_MIN_VISIBILITY && rightShoulder?.visibility > POSE_MIN_VISIBILITY;

          if (shouldersOk) {
            const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            smoothedShoulderY = smoothedShoulderY * 0.8 + shoulderY * 0.2;

            // Track whichever visible wrist is raised highest (smallest y).
            const candidates = [leftWrist, rightWrist].filter(w => w?.visibility > POSE_MIN_VISIBILITY);
            if (candidates.length > 0) {
              active = true;
              const raised = candidates.reduce((a, b) => (a.y < b.y ? a : b));
              smoothedWristX = smoothedWristX * 0.6 + raised.x * 0.4;
              smoothedWristY = smoothedWristY * 0.6 + raised.y * 0.4;

              const isRaised = smoothedWristY < smoothedShoulderY - ARM_RAISE_MARGIN;
              if (isRaised && armZone === 'low' && time - lastSwingTime > SWING_COOLDOWN_MS) {
                armZone = 'high';
                lastSwingTime = time;
                setSwingSignal(s => s + 1);
              } else if (!isRaised && smoothedWristY > smoothedShoulderY && armZone === 'high') {
                armZone = 'low';
              }
            }
          }
        }

        setTrack({ wristX: smoothedWristX, wristY: smoothedWristY, shoulderY: smoothedShoulderY, active, zone: armZone });
      }
      rafId = requestAnimationFrame(analyze);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(s => {
        if (cancelled) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        stream = s;
        videoRef.current.srcObject = s;
        videoRef.current.play();
        setCameraStatus('ready');
        rafId = requestAnimationFrame(analyze);
      })
      .catch(() => setCameraStatus('denied'));

    loadPoseLandmarker()
      .then(l => {
        if (cancelled) return;
        landmarker = l;
        setPoseStatus('ready');
      })
      .catch(() => setPoseStatus('error'));

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (cameraStatus === 'unsupported') return <MessageScreen text="This browser doesn't support camera access." onExit={onExit} />;
  if (cameraStatus === 'denied') return <MessageScreen text="Camera access was denied. Allow camera access for this site and try again." onExit={onExit} />;
  if (poseStatus === 'error') return <MessageScreen text="Couldn't load the pose tracker. Check your connection and try again." onExit={onExit} />;

  return (
    <View style={styles.container}>
      <View style={styles.mirrorLayer}>
        <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {track && poseStatus === 'ready' && (
          <>
            <View style={[styles.zoneLine, { top: `${track.shoulderY * 100}%` }]} pointerEvents="none" />
            <View
              pointerEvents="none"
              style={[
                styles.trackDot,
                {
                  left: `${track.wristX * 100}%`,
                  top: `${track.wristY * 100}%`,
                  borderColor: track.zone === 'high' ? '#4ade80' : '#e94560',
                  opacity: track.active ? 1 : 0.35,
                },
              ]}
            />
          </>
        )}
      </View>

      {cameraStatus === 'ready' && <FlappyBirdGame swingSignal={swingSignal} onExit={onExit} />}

      {cameraStatus === 'requesting' && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Requesting camera access...</Text>
        </View>
      )}
      {cameraStatus === 'ready' && poseStatus === 'loading' && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Loading pose tracker... (first load can take a bit)</Text>
        </View>
      )}
    </View>
  );
}

function FaceTracker({ onExit, onChangeMode }) {
  const videoRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('requesting'); // requesting | ready | denied | unsupported
  const [cvStatus, setCvStatus] = useState('loading'); // loading | ready | error
  const [track, setTrack] = useState(null); // { left, top, right, bottom, active, eyes }

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      return;
    }

    let stream;
    let rafId;
    let cancelled = false;
    let detector = null;
    let frameCount = 0;

    let faceLeft = 0.3, faceTop = 0.2, faceRight = 0.7, faceBottom = 0.7;
    let eyes = null;

    const analyze = (time) => {
      frameCount += 1;
      const video = videoRef.current;
      if (
        detector && video && video.readyState >= 2 && video.videoWidth &&
        frameCount % FACE_ANALYZE_EVERY_N_FRAMES === 0
      ) {
        const result = detector.detectForVideo(video, time);

        let hasFace = false;
        if (result.detections.length > 0) {
          let best = result.detections[0];
          let bestArea = best.boundingBox.width * best.boundingBox.height;
          for (const d of result.detections) {
            const area = d.boundingBox.width * d.boundingBox.height;
            if (area > bestArea) { best = d; bestArea = area; }
          }

          hasFace = true;
          const vw = video.videoWidth, vh = video.videoHeight;
          const left = best.boundingBox.originX / vw;
          const top = best.boundingBox.originY / vh;
          const right = (best.boundingBox.originX + best.boundingBox.width) / vw;
          const bottom = (best.boundingBox.originY + best.boundingBox.height) / vh;
          faceLeft = faceLeft * 0.5 + left * 0.5;
          faceTop = faceTop * 0.5 + top * 0.5;
          faceRight = faceRight * 0.5 + right * 0.5;
          faceBottom = faceBottom * 0.5 + bottom * 0.5;

          // BlazeFace keypoint order: 0 right eye, 1 left eye (already normalized 0..1).
          const rightEye = best.keypoints?.[0];
          const leftEye = best.keypoints?.[1];
          if (rightEye && leftEye) {
            const next = [{ x: rightEye.x, y: rightEye.y }, { x: leftEye.x, y: leftEye.y }];
            eyes = eyes
              ? next.map((p, i) => ({ x: eyes[i].x * 0.5 + p.x * 0.5, y: eyes[i].y * 0.5 + p.y * 0.5 }))
              : next;
          }
        }

        setTrack({ left: faceLeft, top: faceTop, right: faceRight, bottom: faceBottom, active: hasFace, eyes });
      }
      rafId = requestAnimationFrame(analyze);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(s => {
        if (cancelled) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        stream = s;
        videoRef.current.srcObject = s;
        videoRef.current.play();
        setCameraStatus('ready');
        rafId = requestAnimationFrame(analyze);
      })
      .catch(() => setCameraStatus('denied'));

    loadFaceDetector()
      .then(d => {
        if (cancelled) return;
        detector = d;
        setCvStatus('ready');
      })
      .catch(() => setCvStatus('error'));

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (cameraStatus === 'unsupported') return <MessageScreen text="This browser doesn't support camera access." onExit={onExit} />;
  if (cameraStatus === 'denied') return <MessageScreen text="Camera access was denied. Allow camera access for this site and try again." onExit={onExit} />;
  if (cvStatus === 'error') return <MessageScreen text="Couldn't load the face detector. Check your connection and try again." onExit={onExit} />;

  return (
    <View style={styles.container}>
      <View style={styles.mirrorLayer}>
        <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {track && cvStatus === 'ready' && (
          <>
            <View
              pointerEvents="none"
              style={[
                styles.faceBox,
                {
                  left: `${track.left * 100}%`,
                  top: `${track.top * 100}%`,
                  width: `${(track.right - track.left) * 100}%`,
                  height: `${(track.bottom - track.top) * 100}%`,
                  opacity: track.active ? 0.9 : 0.15,
                },
              ]}
            />
            {track.eyes?.map((eye, i) => (
              <View
                key={i}
                pointerEvents="none"
                style={[
                  styles.eyeDot,
                  { left: `${eye.x * 100}%`, top: `${eye.y * 100}%`, opacity: track.active ? 1 : 0.15 },
                ]}
              />
            ))}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.modeBtn} onPress={onChangeMode}>
        <Text style={styles.exitText}>⇄</Text>
      </TouchableOpacity>

      {cameraStatus === 'requesting' && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Requesting camera access...</Text>
        </View>
      )}
      {cameraStatus === 'ready' && cvStatus === 'loading' && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Loading face detector... (first load can take a bit)</Text>
        </View>
      )}
    </View>
  );
}

function PushUpTracker({ onExit, onChangeMode }) {
  const videoRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('requesting'); // requesting | ready | denied | unsupported
  const [cvStatus, setCvStatus] = useState('loading'); // loading | ready | error
  const [track, setTrack] = useState(null); // { y, active }

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      return;
    }

    let stream;
    let rafId;
    let cancelled = false;
    let detector = null;
    let frameCount = 0;

    let smoothedY = 0.5;

    const analyze = (time) => {
      frameCount += 1;
      const video = videoRef.current;
      if (
        detector && video && video.readyState >= 2 && video.videoWidth &&
        frameCount % FACE_ANALYZE_EVERY_N_FRAMES === 0
      ) {
        const result = detector.detectForVideo(video, time);

        let active = false;
        if (result.detections.length > 0) {
          let best = result.detections[0];
          let bestArea = best.boundingBox.width * best.boundingBox.height;
          for (const d of result.detections) {
            const area = d.boundingBox.width * d.boundingBox.height;
            if (area > bestArea) { best = d; bestArea = area; }
          }
          const nose = best.keypoints?.[NOSE_TIP];
          if (nose) {
            active = true;
            smoothedY = smoothedY * 0.7 + nose.y * 0.3;
          }
        }

        setTrack({ y: smoothedY, active });
      }
      rafId = requestAnimationFrame(analyze);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(s => {
        if (cancelled) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        stream = s;
        videoRef.current.srcObject = s;
        videoRef.current.play();
        setCameraStatus('ready');
        rafId = requestAnimationFrame(analyze);
      })
      .catch(() => setCameraStatus('denied'));

    loadFaceDetector()
      .then(d => {
        if (cancelled) return;
        detector = d;
        setCvStatus('ready');
      })
      .catch(() => setCvStatus('error'));

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (cameraStatus === 'unsupported') return <MessageScreen text="This browser doesn't support camera access." onExit={onExit} />;
  if (cameraStatus === 'denied') return <MessageScreen text="Camera access was denied. Allow camera access for this site and try again." onExit={onExit} />;
  if (cvStatus === 'error') return <MessageScreen text="Couldn't load the face detector. Check your connection and try again." onExit={onExit} />;

  return (
    <View style={styles.container}>
      <View style={styles.mirrorLayer}>
        <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {track && cvStatus === 'ready' && (
          <View style={[styles.zoneLine, { top: `${track.y * 100}%` }]} pointerEvents="none" />
        )}
      </View>

      {cameraStatus === 'ready' && cvStatus === 'ready' && (
        <FlappyBirdGame controlledY={track?.y ?? 0.5} onExit={onExit} />
      )}

      <TouchableOpacity style={styles.modeBtn} onPress={onChangeMode}>
        <Text style={styles.exitText}>⇄</Text>
      </TouchableOpacity>

      {cameraStatus === 'requesting' && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Requesting camera access...</Text>
        </View>
      )}
      {cameraStatus === 'ready' && cvStatus === 'loading' && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Loading face detector... (first load can take a bit)</Text>
        </View>
      )}
    </View>
  );
}

function MessageScreen({ text, onExit }) {
  return (
    <View style={styles.center}>
      <Text style={styles.message}>{text}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onExit}>
        <Text style={styles.closeText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mirrorLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    transform: [{ scaleX: -1 }],
  },
  center: {
    flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  message: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  closeButton: { marginTop: 16, padding: 10 },
  closeText: { color: '#888' },
  pickerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 24 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#12122a', borderRadius: 16, padding: 18,
    width: '100%', maxWidth: 340, marginBottom: 14,
  },
  modeEmoji: { fontSize: 32 },
  modeTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modeSub: { color: '#888', fontSize: 12, marginTop: 3 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  overlayText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  zoneLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  trackDot: {
    position: 'absolute', width: 46, height: 46, borderRadius: 23,
    marginLeft: -23, marginTop: -23,
    borderWidth: 4, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  faceBox: {
    position: 'absolute', borderRadius: 8,
    borderWidth: 3, borderColor: '#4ade80',
  },
  eyeDot: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6,
    marginLeft: -6, marginTop: -6, backgroundColor: '#4ade80',
  },
  exitBtn: {
    position: 'absolute', top: 50, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  modeBtn: {
    position: 'absolute', top: 50, right: 60,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  exitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
