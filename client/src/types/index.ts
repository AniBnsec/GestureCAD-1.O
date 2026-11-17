export interface DroneConfig {
  wingspan: number;       // in mm (e.g. 400)
  armLength: number;      // in mm (e.g. 180)
  bodyWidth: number;      // in mm (e.g. 120)
  bodyLength: number;     // in mm (e.g. 120)
  bodyHeight: number;     // in mm (e.g. 35)
  motorSize: number;      // in mm (e.g. 30)
  propellerSize: number;  // in inches (e.g. 7)
  armAngle: number;       // in degrees (default 45)
  armThickness: number;   // in mm (e.g. 12)
  material: string;       // Carbon Fiber, Aluminum, Composite
}

export type ViewMode = '3d' | 'exploded' | 'top' | 'side' | 'front';

export interface ComponentItem {
  id: string;
  name: string;
  type: 'frame' | 'motor' | 'propeller' | 'battery' | 'camera' | 'flight_controller' | 'sensor' | 'payload' | 'avionics';
  visible: boolean;
  selected?: boolean;
  count: number;
  description: string;
  weightGrams: number;
  custom?: boolean;
}

export interface ValidationCheck {
  id: string;
  title: string;
  status: 'valid' | 'warning' | 'invalid';
  description: string;
  measuredValue?: string | number;
  expectedRange?: string;
}

export interface ValidationReport {
  overallStatus: 'valid' | 'warning' | 'invalid';
  timestamp: string;
  checks: ValidationCheck[];
  totalWeightEstimateGrams: number;
  symmetryScore: number;
  disclaimer: string;
}

export interface DesignVariantData {
  id: string;
  name: string;
  tagline: string;
  config: DroneConfig;
  wingspan: number;
  weight: number;
  stability: 'High' | 'Medium' | 'Very High';
  suitability: string;
}

export type RecognizedGesture = 'none' | 'pinch' | 'move' | 'open_palm' | 'pointing' | 'fist' | 'peace' | 'rock' | 'shaka' | 'thumbs_up';

export interface GestureState {
  detected: boolean;
  gesture: RecognizedGesture;
  handPosition: { x: number; y: number; z: number };
  rawFingertip: { x: number; y: number };
  confidence: number;
  activeAction: string;
  cameraActive: boolean;
  demoSimulated: boolean;
  palmRotation?: { yaw: number; pitch: number };
}

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  lastCommand: string;
  status: 'idle' | 'listening' | 'processing' | 'error';
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  structuredData?: {
    operation?: string;
    parameter?: string;
    value?: number;
    unit?: string;
    suggestedConfig?: Partial<DroneConfig>;
    provider?: string;
  };
}

