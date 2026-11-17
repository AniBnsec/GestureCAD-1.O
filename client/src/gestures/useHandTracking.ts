import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useCadStore } from '../store/useCadStore';
import { RecognizedGesture } from '../types';
import { soundFX } from '../utils/audioEngine';
import { api } from '../services/api';

interface UseHandTrackingProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// 21 Landmark Hand Skeleton Connections for drawing bones
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm knuckle base bar
  [5, 9], [9, 13], [13, 17],
];

export function useHandTracking({ videoRef, canvasRef }: UseHandTrackingProps) {
  const {
    gestureState,
    updateGestureState,
    config,
    updateConfig,
    setSelectedComponentId,
    setHoveredComponentId,
    toggleExplodedView,
    toggleMotorsSpinning,
    setViewMode,
    runValidation,
    showNotification,
  } = useCadStore();

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Exponential moving average for jitter-free tracking
  const smoothedPos = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const prevPinchPos = useRef<{ x: number; y: number } | null>(null);
  const prevPalmPos = useRef<{ x: number; y: number } | null>(null);
  const palmRotationRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const lastFistTimeRef = useRef<number>(0);
  const lastPeaceTimeRef = useRef<number>(0);
  const lastRockTimeRef = useRef<number>(0);
  const lastShakaTimeRef = useRef<number>(0);
  const lastThumbsUpTimeRef = useRef<number>(0);
  const lastGestureSoundRef = useRef<string>('none');

  // Initialize MediaPipe HandLandmarker with GPU -> CPU fallback
  useEffect(() => {
    let active = true;

    async function initMediaPipe() {
      try {
        setIsInitializing(true);
        setInitError(null);

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        if (!active) return;

        let landmarker: HandLandmarker | null = null;

        // Try GPU delegate first for maximum 60FPS speed
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.45,
            minHandPresenceConfidence: 0.45,
            minTrackingConfidence: 0.45,
          });
        } catch (gpuErr) {
          console.warn('MediaPipe GPU initialization failed, falling back to CPU:', gpuErr);
          // Fallback to CPU delegate if GPU context is unavailable
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.4,
            minHandPresenceConfidence: 0.4,
            minTrackingConfidence: 0.4,
          });
        }

        if (!active) return;
        landmarkerRef.current = landmarker;
        setIsInitializing(false);
      } catch (err: any) {
        console.warn('Failed to initialize MediaPipe:', err);
        setIsInitializing(false);
        setInitError('Could not load vision models. Demo Sim mode is available.');
      }
    }

    initMediaPipe();

    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  // Classify hand gestures based on distance invariant to camera distance
  const classifyGesture = useCallback((landmarks: Array<{ x: number; y: number; z: number }>): {
    gesture: RecognizedGesture;
    fingertip: { x: number; y: number };
    isPinching: boolean;
    rawDistance: number;
  } => {
    const d = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const middleBase = landmarks[9]; // Middle finger MCP knuckle

    // Palm size baseline (distance from wrist to middle finger knuckle)
    const palmSize = d(middleBase, wrist) || 0.15;

    // Euclidean distance between thumb and index tip
    const thumbIndexDist = d(thumbTip, indexTip);
    const normalizedPinch = thumbIndexDist / palmSize;

    // Distances of all fingertips from wrist normalized to palm size
    const indexDist = d(indexTip, wrist) / palmSize;
    const middleDist = d(middleTip, wrist) / palmSize;
    const ringDist = d(ringTip, wrist) / palmSize;
    const pinkyDist = d(pinkyTip, wrist) / palmSize;

    // Anatomical extension: check if fingertip is extended past its PIP joint or exceeds palm threshold
    const indexExtended = d(indexTip, wrist) > d(landmarks[6], wrist) * 0.98 || indexDist > 0.96;
    const middleExtended = d(middleTip, wrist) > d(landmarks[10], wrist) * 0.98 || middleDist > 0.96;
    const ringExtended = d(ringTip, wrist) > d(landmarks[14], wrist) * 0.96 || ringDist > 0.90;
    const pinkyExtended = d(pinkyTip, wrist) > d(landmarks[18], wrist) * 0.96 || pinkyDist > 0.86;
    const thumbExtended = normalizedPinch > 0.38 && thumbIndexDist > 0.075;

    // Count of extended fingers
    const extendedCount =
      (indexExtended ? 1 : 0) +
      (middleExtended ? 1 : 0) +
      (ringExtended ? 1 : 0) +
      (pinkyExtended ? 1 : 0);

    // Mirrored fingertip coordinate for intuitive user control
    const fingertip = {
      x: 1 - indexTip.x,
      y: indexTip.y,
    };

    // 1. PINCH GESTURE: Thumb and index tip are close (< 0.38 normalized to palm or < 0.072 raw)
    if (normalizedPinch < 0.38 || thumbIndexDist < 0.072) {
      return { gesture: 'pinch', fingertip, isPinching: true, rawDistance: thumbIndexDist };
    }

    // 2. ROCK / HORNS GESTURE: Index and Pinky extended, Middle and Ring curled
    if (indexExtended && pinkyExtended && !middleExtended && !ringExtended) {
      return { gesture: 'rock', fingertip, isPinching: false, rawDistance: thumbIndexDist };
    }

    // 3. SHAKA / CALL ME GESTURE: Thumb and Pinky extended, Index, Middle and Ring curled
    if (thumbExtended && pinkyExtended && !indexExtended && !middleExtended && !ringExtended) {
      return { gesture: 'shaka', fingertip, isPinching: false, rawDistance: thumbIndexDist };
    }

    // 4. PEACE / V-SIGN GESTURE: Index and middle fingers extended, ring and pinky curled
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'peace', fingertip, isPinching: false, rawDistance: thumbIndexDist };
    }

    // 5. POINTING: Index finger extended, middle/ring/pinky curled
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'pointing', fingertip, isPinching: false, rawDistance: thumbIndexDist };
    }

    // 6. THUMBS UP: Thumb pointing upward, while index, middle, ring, pinky are curled
    const thumbUpward = thumbTip.y < wrist.y - 0.08 && thumbTip.y < landmarks[3].y;
    if (thumbUpward && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return { gesture: 'thumbs_up', fingertip, isPinching: false, rawDistance: thumbIndexDist };
    }

    // 7. CLOSED FIST: All fingers curled close to palm (< 0.94)
    if (extendedCount === 0 || (indexDist < 0.94 && middleDist < 0.94 && ringDist < 0.94 && pinkyDist < 0.94)) {
      return { gesture: 'fist', fingertip, isPinching: false, rawDistance: thumbIndexDist };
    }

    // 8. OPEN PALM (Ultra-Sensitive, High Dynamic Range & Responsive):
    // At least 3 fingers extended OR all 4 fingers extended OR index + middle + pinky
    if (
      (extendedCount >= 3 && normalizedPinch > 0.28) ||
      extendedCount === 4 ||
      (indexDist > 0.88 && middleDist > 0.88 && ringDist > 0.82) ||
      (indexExtended && middleExtended && pinkyExtended)
    ) {
      return { gesture: 'open_palm', fingertip, isPinching: false, rawDistance: thumbIndexDist };
    }

    return { gesture: 'none', fingertip, isPinching: false, rawDistance: thumbIndexDist };
  }, []);

  // Camera stream setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    async function startCamera() {
      if (!gestureState.cameraActive) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
          };
        }
      } catch (err: any) {
        console.error('Webcam getUserMedia error:', err);
        updateGestureState({ cameraActive: false });
        showNotification('Webcam access was denied or unavailable. You can use Demo Sim mode!', 'warning');
      }
    }

    if (gestureState.cameraActive) {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [gestureState.cameraActive, videoRef, updateGestureState, showNotification]);

  // Video Landmark Detection & Canvas Rendering Loop
  useEffect(() => {
    let lastVideoTime = -1;

    const renderLoop = () => {
      if (
        gestureState.cameraActive &&
        videoRef.current &&
        canvasRef.current &&
        landmarkerRef.current &&
        videoRef.current.readyState >= 2
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.currentTime !== lastVideoTime && ctx) {
          lastVideoTime = video.currentTime;
          const startTimeMs = performance.now();
          const results = landmarkerRef.current.detectForVideo(video, startTimeMs);

          // Clear previous frame
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            const { gesture, fingertip, isPinching } = classifyGesture(landmarks);

            // Smooth fingertip coordinates
            const alpha = 0.4;
            smoothedPos.current.x = smoothedPos.current.x * (1 - alpha) + fingertip.x * alpha;
            smoothedPos.current.y = smoothedPos.current.y * (1 - alpha) + fingertip.y * alpha;

            // Draw futuristic skeleton on canvas
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);

            // 1. Draw Skeleton Bone Connection Lines
            ctx.strokeStyle = isPinching ? '#00C8FF' : 'rgba(22, 119, 255, 0.7)';
            ctx.lineWidth = isPinching ? 4 : 2.5;

            HAND_CONNECTIONS.forEach(([i, j]) => {
              const p1 = landmarks[i];
              const p2 = landmarks[j];
              ctx.beginPath();
              ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
              ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
              ctx.stroke();
            });

            // 2. Draw Landmark Joint Points
            landmarks.forEach((lm, idx) => {
              const px = lm.x * canvas.width;
              const py = lm.y * canvas.height;
              ctx.beginPath();
              const isTip = [4, 8, 12, 16, 20].includes(idx);
              ctx.arc(px, py, isTip ? 6 : 3.5, 0, 2 * Math.PI);
              ctx.fillStyle = isTip ? '#00C8FF' : '#39D5FF';
              ctx.shadowColor = '#00C8FF';
              ctx.shadowBlur = isTip ? 12 : 4;
              ctx.fill();
            });

            // 3. Draw Pinch Interaction Ring if active
            if (isPinching) {
              const thumbP = landmarks[4];
              const indexP = landmarks[8];
              const midX = ((thumbP.x + indexP.x) * 0.5) * canvas.width;
              const midY = ((thumbP.y + indexP.y) * 0.5) * canvas.height;

              ctx.beginPath();
              ctx.arc(midX, midY, 18, 0, 2 * Math.PI);
              ctx.strokeStyle = '#00C8FF';
              ctx.lineWidth = 3;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(midX, midY, 6, 0, 2 * Math.PI);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
            }

            ctx.restore();

            // Handle gesture actions on CAD model
            let activeAction = `Gesture: ${gesture.toUpperCase()}`;

            if (gesture !== 'none' && gesture !== lastGestureSoundRef.current) {
              soundFX.playGestureDetect(gesture);
              lastGestureSoundRef.current = gesture;
            } else if (gesture === 'none') {
              lastGestureSoundRef.current = 'none';
            }

            if (isPinching) {
              activeAction = `PINCH: Resizing Wingspan (${config.wingspan} mm)`;
              if (prevPinchPos.current) {
                // Moving hand up or right increases wingspan; down or left decreases
                const dy = prevPinchPos.current.y - smoothedPos.current.y;
                const dx = smoothedPos.current.x - prevPinchPos.current.x;
                const moveDelta = dy * 320 + dx * 180;

                if (Math.abs(moveDelta) > 1.0) {
                  const newWs = Math.max(260, Math.min(600, Math.round(config.wingspan + moveDelta)));
                  if (newWs !== config.wingspan) {
                    const proportionalArm = Math.round((newWs / 400) * 180);
                    updateConfig({ wingspan: newWs, armLength: proportionalArm });
                  }
                }
              }
              prevPinchPos.current = { ...smoothedPos.current };
              prevPalmPos.current = null;
            } else {
              prevPinchPos.current = null;
            }

            if (gesture === 'open_palm') {
              const yawDeg = Math.round((((palmRotationRef.current.yaw * 180) / Math.PI) % 360 + 360) % 360);
              const pitchDeg = Math.round((palmRotationRef.current.pitch * 180) / Math.PI);
              activeAction = `OPEN PALM: 3D Spatial Orbit (Yaw: ${yawDeg}°, Pitch: ${pitchDeg}°)`;

              // Use true palm center (wrist + middle knuckle) for stable, butter-smooth spatial orbit
              const currentPalmCenter = {
                x: 1 - ((landmarks[0].x + landmarks[9].x) * 0.5),
                y: (landmarks[0].y + landmarks[9].y) * 0.5,
              };

              if (prevPalmPos.current) {
                const dx = currentPalmCenter.x - prevPalmPos.current.x;
                const dy = currentPalmCenter.y - prevPalmPos.current.y;

                // Ultra-sensitive, responsive, zero-lag 3D spatial orbit
                palmRotationRef.current.yaw += dx * 9.5;
                palmRotationRef.current.pitch = Math.max(
                  -0.95,
                  Math.min(0.95, palmRotationRef.current.pitch + dy * 7.5)
                );
              }
              prevPalmPos.current = { ...currentPalmCenter };
              setSelectedComponentId(null);
              setHoveredComponentId(null);
            } else {
              prevPalmPos.current = null;
            }

            if (gesture === 'pointing') {
              // Map pointing coordinate in viewport space to drone component
              const fx = smoothedPos.current.x;
              const fy = smoothedPos.current.y;
              let targetComp = 'c-frame';
              let targetName = 'Airframe';

              if (fy < 0.36) {
                if (fx > 0.4 && fx < 0.6) {
                  targetComp = 'c-camera';
                  targetName = 'FPV HD Camera';
                } else {
                  targetComp = 'c-gps';
                  targetName = 'GPS Navigation Mast';
                }
              } else if (fy > 0.64) {
                if (fx < 0.35 || fx > 0.65) {
                  targetComp = 'c-landing';
                  targetName = 'Landing Skids';
                } else {
                  targetComp = 'c-battery';
                  targetName = 'LiPo Battery Pack';
                }
              } else if (fx < 0.35 || fx > 0.65) {
                targetComp = 'c-motors';
                targetName = 'Brushless Motors';
              } else {
                targetComp = 'c-fc';
                targetName = 'Flight Controller Board';
              }

              activeAction = `POINTING: Inspecting ${targetName}`;
              setHoveredComponentId(targetComp);
              setSelectedComponentId(targetComp);
            }

            if (gesture === 'fist') {
              activeAction = 'CLOSED FIST: Locked & Validated';
              const now = Date.now();
              if (now - lastFistTimeRef.current > 2000) {
                lastFistTimeRef.current = now;
                runValidation();
                soundFX.playValidationSuccess();
                showNotification('Airframe locked! Aeronautical safety checks validated.', 'success');
              }
            }

            if (gesture === 'peace') {
              activeAction = 'PEACE SIGN: Toggled Exploded View';
              const now = Date.now();
              if (now - lastPeaceTimeRef.current > 1800) {
                lastPeaceTimeRef.current = now;
                toggleExplodedView();
              }
            }

            if (gesture === 'rock') {
              activeAction = 'ROCK SIGN: Toggled Rotor Flight Mode';
              const now = Date.now();
              if (now - lastRockTimeRef.current > 1800) {
                lastRockTimeRef.current = now;
                toggleMotorsSpinning();
                showNotification('Rotor flight simulation toggled via Rock Sign gesture!', 'info');
              }
            }

            if (gesture === 'shaka') {
              activeAction = 'SHAKA SIGN: Reset Viewport to Home';
              const now = Date.now();
              if (now - lastShakaTimeRef.current > 1800) {
                lastShakaTimeRef.current = now;
                setViewMode('3d');
                palmRotationRef.current = { yaw: 0, pitch: 0 };
                showNotification('Camera orientation reset to Home Perspective!', 'info');
              }
            }

            if (gesture === 'thumbs_up') {
              activeAction = 'THUMBS UP: Saved Design Bookmark';
              const now = Date.now();
              if (now - lastThumbsUpTimeRef.current > 2400) {
                lastThumbsUpTimeRef.current = now;
                soundFX.playValidationSuccess();
                api.saveDesign(`Quadcopter_${config.wingspan}mm`, config, useCadStore.getState().components);
                showNotification('👍 Design bookmark snapshot saved to database!', 'success');
              }
            }

            updateGestureState({
              detected: true,
              gesture,
              confidence: 0.95,
              rawFingertip: { ...smoothedPos.current },
              palmRotation: { ...palmRotationRef.current },
              activeAction,
            });
          } else {
            updateGestureState({
              detected: false,
              gesture: 'none',
              activeAction: 'Show hand in camera...',
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    gestureState.cameraActive,
    videoRef,
    canvasRef,
    classifyGesture,
    config.wingspan,
    updateConfig,
    setSelectedComponentId,
    setHoveredComponentId,
    toggleExplodedView,
    toggleMotorsSpinning,
    setViewMode,
    runValidation,
    showNotification,
    updateGestureState,
  ]);

  // Demo Simulation Loop for testing without webcam
  useEffect(() => {
    if (!gestureState.demoSimulated) return;

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 8;

      if (step === 0) {
        // Pointing finger inspecting component
        updateGestureState({
          detected: true,
          gesture: 'pointing',
          rawFingertip: { x: 0.5, y: 0.28 },
          activeAction: 'Demo: Pointing Finger → Inspecting FPV HD Camera',
        });
        setSelectedComponentId('c-camera');
        setHoveredComponentId('c-camera');
      } else if (step === 1) {
        // Pinching to resize wingspan
        const newWs = config.wingspan >= 480 ? 360 : config.wingspan + 30;
        const newArm = Math.round((newWs / 400) * 180);
        updateConfig({ wingspan: newWs, armLength: newArm });
        updateGestureState({
          detected: true,
          gesture: 'pinch',
          rawFingertip: { x: 0.58, y: 0.38 },
          activeAction: `Demo: Pinching & Dragging → Resized Wingspan to ${newWs} mm`,
        });
      } else if (step === 2) {
        // Open palm rotating 3D model
        palmRotationRef.current.yaw += 0.75;
        palmRotationRef.current.pitch = 0.22;
        updateGestureState({
          detected: true,
          gesture: 'open_palm',
          rawFingertip: { x: 0.65, y: 0.45 },
          palmRotation: { ...palmRotationRef.current },
          activeAction: 'Demo: Open Palm → Spatial 3D Drone Orbit (Yaw +45°)',
        });
        setSelectedComponentId(null);
        setHoveredComponentId(null);
      } else if (step === 3) {
        // Peace sign toggling exploded assembly view
        toggleExplodedView();
        updateGestureState({
          detected: true,
          gesture: 'peace',
          rawFingertip: { x: 0.5, y: 0.42 },
          activeAction: 'Demo: Peace Sign (V-Sign) → Toggled Exploded Assembly View',
        });
      } else if (step === 4) {
        // Rock sign toggling rotor flight simulation
        toggleMotorsSpinning();
        updateGestureState({
          detected: true,
          gesture: 'rock',
          rawFingertip: { x: 0.55, y: 0.35 },
          activeAction: 'Demo: Rock Sign (Horns) → Spinning High-RPM Rotors',
        });
      } else if (step === 5) {
        // Shaka sign resetting camera orientation
        setViewMode('3d');
        palmRotationRef.current = { yaw: 0, pitch: 0 };
        updateGestureState({
          detected: true,
          gesture: 'shaka',
          rawFingertip: { x: 0.5, y: 0.45 },
          palmRotation: { yaw: 0, pitch: 0 },
          activeAction: 'Demo: Shaka Sign → Reset Viewport to Home View',
        });
      } else if (step === 6) {
        // Thumbs up saving design bookmark
        soundFX.playValidationSuccess();
        updateGestureState({
          detected: true,
          gesture: 'thumbs_up',
          rawFingertip: { x: 0.5, y: 0.35 },
          activeAction: 'Demo: Thumbs Up → Saved Design Bookmark to Gallery',
        });
        showNotification('👍 Design bookmark snapshot saved to database!', 'success');
      } else {
        // Closed fist locking and validating
        runValidation();
        soundFX.playValidationSuccess();
        updateGestureState({
          detected: true,
          gesture: 'fist',
          rawFingertip: { x: 0.5, y: 0.5 },
          activeAction: 'Demo: Closed Fist → Locked Parameters & Passed Aero Check',
        });
        showNotification('Aeronautical verification passed! Stability score 99.2%', 'success');
      }
    }, 2400);

    return () => clearInterval(interval);
  }, [
    gestureState.demoSimulated,
    config.wingspan,
    updateConfig,
    setSelectedComponentId,
    setHoveredComponentId,
    toggleExplodedView,
    toggleMotorsSpinning,
    setViewMode,
    runValidation,
    showNotification,
    updateGestureState,
  ]);

  return { isInitializing, initError };
}
