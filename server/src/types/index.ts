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
  symmetryScore: number; // percentage
  disclaimer: string;
}

export interface AIInterpretationResult {
  success: boolean;
  provider: 'local' | 'gemini' | 'openai' | 'cohere';
  operation: 'setParameter' | 'generateAlternatives' | 'toggleView' | 'reset' | 'unknown';
  parameter?: string;
  value?: number;
  unit?: string;
  explanation: string;
  suggestedConfig?: Partial<DroneConfig>;
}

export interface DesignVariantData {
  id: string;
  name: string;
  tagline: string;
  config: DroneConfig;
  wingspan: number;
  weight: number; // grams
  stability: 'High' | 'Medium' | 'Very High';
  suitability: string;
}

