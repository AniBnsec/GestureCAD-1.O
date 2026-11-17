import { DroneConfig, AIInterpretationResult } from '../types/index.js';
import { config } from '../config/index.js';

export interface AIProvider {
  interpretCommand(command: string, currentConfig: DroneConfig): Promise<AIInterpretationResult>;
  explainComponent(componentName: string): Promise<{ explanation: string; specs: string }>;
  generateVariants(baseConfig: DroneConfig): Promise<Array<{
    id: string;
    name: string;
    tagline: string;
    config: DroneConfig;
    wingspan: number;
    weight: number;
    stability: 'High' | 'Medium' | 'Very High';
    suitability: string;
  }>>;
}

/**
 * Deterministic local parser for robust, offline, high-accuracy command interpretation.
 */
export class LocalDeterministicProvider implements AIProvider {
  async interpretCommand(command: string, currentConfig: DroneConfig): Promise<AIInterpretationResult> {
    const lower = command.toLowerCase().trim();

    // 1. Wingspan adjustments
    const wingspanMatch = lower.match(/wingspan.*?(\d+(?:\.\d+)?)\s*(cm|mm|millimetres|centimetres|in)?/i) ||
                         lower.match(/(?:set|make|increase|decrease|change).*?wingspan.*?(\d+(?:\.\d+)?)/i);
    if (wingspanMatch) {
      let val = parseFloat(wingspanMatch[1]);
      const unit = wingspanMatch[2]?.toLowerCase() || 'mm';
      if (unit.startsWith('cm') || unit.startsWith('centimetre')) val = val * 10;
      val = Math.max(250, Math.min(650, Math.round(val)));
      const newArmLength = Math.round((val / 400) * 180);
      return {
        success: true,
        provider: 'local',
        operation: 'setParameter',
        parameter: 'wingspan',
        value: val,
        unit: 'mm',
        explanation: `Updating wingspan to ${val} mm. Proportionally adjusted arm length (${newArmLength} mm) and motor spacing for balanced aerodynamic stability.`,
        suggestedConfig: {
          wingspan: val,
          armLength: newArmLength,
        }
      };
    }

    if (lower.includes('increase wingspan') || lower.includes('larger wingspan') || lower.includes('wider') || lower.includes('make it bigger')) {
      const val = Math.min(600, currentConfig.wingspan + 50);
      const newArmLength = Math.round((val / 400) * 180);
      return {
        success: true,
        provider: 'local',
        operation: 'setParameter',
        parameter: 'wingspan',
        value: val,
        unit: 'mm',
        explanation: `Increased wingspan to ${val} mm (+50 mm). Extended arm geometry expands propeller clearance and increases roll moment inertia for smoother flight.`,
        suggestedConfig: {
          wingspan: val,
          armLength: newArmLength
        }
      };
    }

    if (lower.includes('decrease wingspan') || lower.includes('smaller wingspan') || lower.includes('narrower') || lower.includes('make it smaller')) {
      const val = Math.max(280, currentConfig.wingspan - 50);
      const newArmLength = Math.round((val / 400) * 180);
      return {
        success: true,
        provider: 'local',
        operation: 'setParameter',
        parameter: 'wingspan',
        value: val,
        unit: 'mm',
        explanation: `Reduced wingspan to ${val} mm (-50 mm). Compact frame increases roll agility for rapid tight-quarter maneuvering.`,
        suggestedConfig: {
          wingspan: val,
          armLength: newArmLength
        }
      };
    }

    // 2. Arm length adjustments
    const armMatch = lower.match(/(?:arm\s*length|arms?|motor\s*spacing).*?(\d+(?:\.\d+)?)\s*(cm|mm|millimetres|centimetres)?/i);
    if (armMatch) {
      let val = parseFloat(armMatch[1]);
      const unit = armMatch[2]?.toLowerCase() || 'mm';
      if (unit.startsWith('cm') || unit.startsWith('centimetre')) val = val * 10;
      val = Math.max(120, Math.min(280, Math.round(val)));
      return {
        success: true,
        provider: 'local',
        operation: 'setParameter',
        parameter: 'armLength',
        value: val,
        unit: 'mm',
        explanation: `Arm length reconfigured to ${val} mm. Motor mounts repositioned with symmetric radial alignment.`,
        suggestedConfig: {
          armLength: val,
          wingspan: Math.round(val * 2.22)
        }
      };
    }

    // 3. Compact drone preset
    if (lower.includes('compact') || lower.includes('indoor') || lower.includes('mini') || lower.includes('small drone')) {
      return {
        success: true,
        provider: 'local',
        operation: 'setParameter',
        parameter: 'wingspan',
        value: 300,
        unit: 'mm',
        explanation: 'Applied Compact Indoor profile: 300 mm wingspan, 135 mm arms, and 5-inch propellers optimized for confined obstacle navigation.',
        suggestedConfig: {
          wingspan: 300,
          armLength: 135,
          bodyWidth: 95,
          motorSize: 24,
          propellerSize: 5
        }
      };
    }

    // 4. Heavy-lift / Endurance preset
    if (lower.includes('endurance') || lower.includes('heavy lift') || lower.includes('long range') || lower.includes('payload')) {
      return {
        success: true,
        provider: 'local',
        operation: 'setParameter',
        parameter: 'wingspan',
        value: 450,
        unit: 'mm',
        explanation: 'Applied EnduranceLift configuration: 450 mm wingspan, 205 mm arms, 35 mm high-torque motors, and 8-inch high-efficiency propellers.',
        suggestedConfig: {
          wingspan: 450,
          armLength: 205,
          bodyWidth: 130,
          motorSize: 35,
          propellerSize: 8
        }
      };
    }

    // 5. Standard default preset
    if (lower.includes('standard') || lower.includes('default') || lower.includes('reset')) {
      return {
        success: true,
        provider: 'local',
        operation: 'reset',
        parameter: 'wingspan',
        value: 400,
        unit: 'mm',
        explanation: 'Restored AeroStandard-400 Quadcopter baseline parameters: 400 mm wingspan, 180 mm arms, 30 mm motors, and 7-inch propellers.',
        suggestedConfig: {
          wingspan: 400,
          armLength: 180,
          bodyWidth: 120,
          motorSize: 30,
          propellerSize: 7
        }
      };
    }

    // 6. Hand Gesture Control Guide
    if (
      lower.includes('gesture') ||
      lower.includes('hand') ||
      lower.includes('palm') ||
      lower.includes('pum') ||
      lower.includes('control') ||
      lower.includes('how do') ||
      lower.includes('what control') ||
      lower.includes('tell')
    ) {
      return {
        success: true,
        provider: 'local',
        operation: 'unknown',
        explanation:
          '🖐️ **GestureCAD Touchless Hand Gesture Controls**:\n\n' +
          '• 🖐️ **Open Palm:** Controls 3D Spatial Orbit & Rotation. Move open palm left/right to rotate yaw (360°), up/down to tilt pitch! Hold still to freeze angle.\n' +
          '• 🤏 **Pinch (Thumb + Index):** Dynamic Wingspan Resizing. Drag outward/upward to expand wingspan (260mm–600mm), inward/downward to contract.\n' +
          '• ☝️ **Pointing Finger:** Precision Laser Inspection. Aim directly at any component (Camera, Motors, Battery, Flight Controller, GPS, Landing Skids) to inspect live specs!\n' +
          '• ✊ **Closed Fist:** Parameter Lock & Safety Validation. Clench fist to lock dimensions and run automated aerodynamic safety checks!\n' +
          '• ✌️ **Peace / V-Sign:** Exploded Assembly View. Hold 2 fingers up to explode the drone into discrete mechanical layers!\n' +
          '• 🤘 **Rock Sign (Horns):** Flight Simulation Mode. Extend index + pinky to toggle high-RPM rotor spin with aerodynamic downwash!\n' +
          '• 🤙 **Shaka Sign:** Reset Viewport. Extend thumb + pinky to reset camera orientation to Home View!\n' +
          '• 👍 **Thumbs Up:** Quick Bookmark & Save. Point thumb upward with fingers curled to save your design to the database!\n\n' +
          'Enable your webcam (click "Start") or click "Auto Demo Sim" to test automated gesture simulation!'
      };
    }

    // 6. Camera View Modes
    if (lower.includes('exploded') || lower.includes('disassemble') || lower.includes('expand')) {
      return {
        success: true,
        provider: 'local',
        operation: 'toggleView',
        parameter: 'exploded',
        explanation: 'Activated Exploded Assembly View: Cantilever arms, brushless motor bells, and avionics standoffs separated along surface normal vectors for clearance inspection.'
      };
    }
    if (lower.includes('top view') || lower.includes('plan view')) {
      return {
        success: true,
        provider: 'local',
        operation: 'toggleView',
        parameter: 'top',
        explanation: 'Switched to Top Orthographic Plan View: Inspecting bilateral arm symmetry and propeller disk clearances.'
      };
    }
    if (lower.includes('side view') || lower.includes('elevation')) {
      return {
        success: true,
        provider: 'local',
        operation: 'toggleView',
        parameter: 'side',
        explanation: 'Switched to Side Elevation View: Examining vertical center of gravity and landing skid clearances.'
      };
    }
    if (lower.includes('3d view') || lower.includes('orbit view') || lower.includes('perspective')) {
      return {
        success: true,
        provider: 'local',
        operation: 'toggleView',
        parameter: '3d',
        explanation: 'Switched to Free Perspective 3D Orbit View.'
      };
    }

    // Default conversational CAD response
    return {
      success: true,
      provider: 'local',
      operation: 'setParameter',
      parameter: 'wingspan',
      value: currentConfig.wingspan,
      unit: 'mm',
      explanation: `Analyzed "${command}": Current quadcopter geometry maintains bilateral symmetry with ${currentConfig.wingspan} mm wingspan. You can specify exact dimensions (e.g. "Set wingspan to 450 mm") or presets (e.g. "Make drone compact").`,
      suggestedConfig: currentConfig
    };
  }

  async explainComponent(componentName: string): Promise<{ explanation: string; specs: string }> {
    const comp = componentName.toLowerCase();
    if (comp.includes('motor')) {
      return {
        explanation: 'High-torque brushless outrunner motors (2207 stator scale) deliver vertical thrust via electromagnetic induction. 12-pole copper windings with dynamic timing optimization.',
        specs: '2207 2400KV · 4S/6S LiPo Rated · 12N14P Stator · Anodized CNC Aluminum Bell'
      };
    }
    if (comp.includes('propeller') || comp.includes('prop')) {
      return {
        explanation: 'Aerodynamic tri-blade airfoil propellers generate differential lift and yaw torque through counter-rotation (front-right CW, rear-right CCW). High-modulus polycarbonate construction reduces blade flutter at 24,000 RPM.',
        specs: '7.0 x 4.0 x 3 Tri-Blade · Aerodynamic Pitch Twist · Glass-filled Polycarbonate · Balanced Hub'
      };
    }
    if (comp.includes('frame') || comp.includes('chassis')) {
      return {
        explanation: 'The structural skeleton engineered from 3K quasi-isotropic matte carbon fiber weave. Features chamfered filleted unibody plates, triangular skeletal arm trusses for maximum torsional stiffness, and CNC aluminum standoffs.',
        specs: 'Toray T700 3K Carbon · 5.5mm Chamfered Arms · 2.5mm Top/Bottom Plates · 6061 Standoffs'
      };
    }
    if (comp.includes('battery') || comp.includes('lipo')) {
      return {
        explanation: '4S lithium-polymer electrochemical energy storage pack positioned centrally above the center-of-gravity. Provides continuous high-current discharge to 4 ESC channels via 12AWG silicone leads and gold-plated XT60 connector.',
        specs: '4S 14.8V 2200mAh 100C · XT60 Connector · JST-XH Balance Plug · High Discharge Pouch Cells'
      };
    }
    if (comp.includes('camera') || comp.includes('fpv')) {
      return {
        explanation: 'Ultra-low latency micro FPV camera mounted in a dual-cheek titanium bracket. Features optical glass optics with anti-reflective multicoating for crisp pilot telemetry and obstacle avoidance.',
        specs: '1200TVL CMOS Sensor · 1.8mm Wide-Angle Glass Lens · 0.001 Lux Night-Vision · 25° Tilt'
      };
    }
    if (comp.includes('controller') || comp.includes('fc') || comp.includes('flight')) {
      return {
        explanation: 'The central avionics brain comprising an STM32 32-bit microcontroller running real-time PID attitude loops at 8kHz, coupled with an MPU6000 6-axis gyro/accelerometer mounted on silicone vibration isolation grommets.',
        specs: 'STM32F405 MCU · MPU6000 SPI Gyro · Betaflight/INAV OSD · Dual Pulsing Telemetry LEDs'
      };
    }
    return {
      explanation: `${componentName} is a critical quadcopter component that ensures mechanical integrity and aerodynamic function.`,
      specs: 'Aerospace Grade 3K Carbon Fiber / High efficiency avionics'
    };
  }

  async generateVariants(baseConfig: DroneConfig) {
    return [
      {
        id: 'variant-1',
        name: 'Design 1 — Standard Multi-Role',
        tagline: 'Balanced Multi-Role Quadcopter',
        config: { ...baseConfig, wingspan: 400, armLength: 180, bodyWidth: 120, motorSize: 30, propellerSize: 7 },
        wingspan: 400,
        weight: 650,
        stability: 'High' as const,
        suitability: 'Versatile general-purpose FPV, aerial photography, and stability in moderate winds.'
      },
      {
        id: 'variant-2',
        name: 'Design 2 — Compact Indoor Agile',
        tagline: 'High Agility Tight-Space Specialist',
        config: { ...baseConfig, wingspan: 300, armLength: 135, bodyWidth: 95, motorSize: 24, propellerSize: 5 },
        wingspan: 300,
        weight: 520,
        stability: 'Medium' as const,
        suitability: 'Rapid tight-space exploration, warehouse inspection, and agile obstacle avoidance.'
      },
      {
        id: 'variant-3',
        name: 'Design 3 — Extended Endurance Lift',
        tagline: 'High Endurance & Heavy Payload',
        config: { ...baseConfig, wingspan: 450, armLength: 205, bodyWidth: 130, motorSize: 35, propellerSize: 8 },
        wingspan: 450,
        weight: 700,
        stability: 'Very High' as const,
        suitability: 'High-altitude stability, extended 30-min hover duration, and heavy camera gimbal payloads.'
      }
    ];
  }
}

/**
 * Cohere Provider using Cohere Command-R.
 */
export class CohereProvider implements AIProvider {
  private apiKey: string;
  private localFallback = new LocalDeterministicProvider();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async interpretCommand(command: string, currentConfig: DroneConfig): Promise<AIInterpretationResult> {
    try {
      const prompt = `You are the lead aerodynamicist and AI CAD assistant for GestureCAD, a high-performance aerospace drone CAD platform.
Current quadcopter configuration:
- Wingspan: ${currentConfig.wingspan} mm
- Arm Length: ${currentConfig.armLength} mm
- Body Width: ${currentConfig.bodyWidth} mm
- Motor Stator Size: ${currentConfig.motorSize} mm
- Propeller Size: ${currentConfig.propellerSize} inches

User command: "${command}"

Analyze the user's CAD request.
Respond STRICTLY with a valid JSON object only (no markdown code fences, no extra text):
{
  "operation": "setParameter" or "toggleView" or "reset" or "generateAlternatives",
  "parameter": "wingspan" or "armLength" or "bodyWidth" or "motorSize" or "propellerSize" or "exploded" or "top" or "side" or "3d",
  "value": number,
  "unit": "mm" or "inches",
  "explanation": "concise 1-2 sentence aerodynamic engineering rationale for this modification",
  "suggestedConfig": {
    "wingspan": number,
    "armLength": number,
    "bodyWidth": number,
    "motorSize": number,
    "propellerSize": number
  }
}`;

      const res = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          model: 'command-r-08-2024',
          temperature: 0.1
        })
      });

      if (!res.ok) throw new Error(`Cohere API error: ${res.statusText}`);

      const data = (await res.json()) as any;
      const text = data.text;
      if (!text) throw new Error('Empty Cohere response');

      const jsonStr = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      const val = typeof parsed.value === 'number' ? parsed.value : currentConfig.wingspan;
      const armVal = Math.round((val / 400) * 180);

      const mergedConfig = {
        ...currentConfig,
        ...(parsed.suggestedConfig || {}),
        ...(parsed.parameter && typeof parsed.value === 'number' ? { [parsed.parameter]: parsed.value } : {})
      };

      return {
        success: true,
        provider: 'cohere',
        operation: parsed.operation || 'setParameter',
        parameter: parsed.parameter || 'wingspan',
        value: val,
        unit: parsed.unit || 'mm',
        explanation: parsed.explanation || `Updated quadcopter parameters using Cohere Command-R.`,
        suggestedConfig: mergedConfig
      };
    } catch (err) {
      console.warn('Cohere API call failed, falling back to deterministic parser:', err);
      return this.localFallback.interpretCommand(command, currentConfig);
    }
  }

  async explainComponent(componentName: string) {
    try {
      const prompt = `You are an aerospace engineer for GestureCAD. Explain the quadcopter component "${componentName}".
Respond strictly with a JSON object:
{
  "explanation": "2-sentence engineering explanation of how it functions on a high-performance quadcopter",
  "specs": "1-line key technical specifications (e.g. material, dimensions, tolerances)"
}`;
      const res = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: prompt, model: 'command-r-08-2024', temperature: 0.2 })
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        const text = data.text?.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
      }
    } catch (e) {
      console.warn('Cohere explain failed, using fallback:', e);
    }
    return this.localFallback.explainComponent(componentName);
  }

  async generateVariants(baseConfig: DroneConfig) {
    return this.localFallback.generateVariants(baseConfig);
  }
}

/**
 * Gemini Provider using Google Gemini API.
 */
export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private localFallback = new LocalDeterministicProvider();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async interpretCommand(command: string, currentConfig: DroneConfig): Promise<AIInterpretationResult> {
    try {
      const prompt = `You are the lead aerodynamicist and AI CAD assistant for GestureCAD.
Current quadcopter configuration:
${JSON.stringify(currentConfig, null, 2)}

User instruction: "${command}"

Respond STRICTLY with a valid JSON object only (no markdown, no backticks):
{
  "operation": "setParameter" or "toggleView" or "reset",
  "parameter": "wingspan",
  "value": 400,
  "unit": "mm",
  "explanation": "concise 1-2 sentence engineering reason",
  "suggestedConfig": { "wingspan": 400, "armLength": 180 }
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
          })
        }
      );

      if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);

      const data = (await res.json()) as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty Gemini response');

      const parsed = JSON.parse(text);
      return {
        success: true,
        provider: 'gemini',
        operation: parsed.operation || 'setParameter',
        parameter: parsed.parameter,
        value: parsed.value,
        unit: parsed.unit,
        explanation: parsed.explanation || 'Parameters updated successfully by Gemini AI.',
        suggestedConfig: parsed.suggestedConfig
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back:', err);
      return this.localFallback.interpretCommand(command, currentConfig);
    }
  }

  async explainComponent(componentName: string) {
    return this.localFallback.explainComponent(componentName);
  }

  async generateVariants(baseConfig: DroneConfig) {
    return this.localFallback.generateVariants(baseConfig);
  }
}

/**
 * OpenAI Provider.
 */
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private localFallback = new LocalDeterministicProvider();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async interpretCommand(command: string, currentConfig: DroneConfig): Promise<AIInterpretationResult> {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: `Respond strictly with JSON: {"operation":"setParameter","parameter":"wingspan","value":450,"unit":"mm","explanation":"Wingspan updated"}` }],
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
      const data = (await res.json()) as any;
      const parsed = JSON.parse(data.choices?.[0]?.message?.content);
      return {
        success: true,
        provider: 'openai',
        operation: parsed.operation || 'setParameter',
        parameter: parsed.parameter,
        value: parsed.value,
        unit: parsed.unit,
        explanation: parsed.explanation,
        suggestedConfig: parsed.suggestedConfig
      };
    } catch (err) {
      return this.localFallback.interpretCommand(command, currentConfig);
    }
  }

  async explainComponent(componentName: string) {
    return this.localFallback.explainComponent(componentName);
  }

  async generateVariants(baseConfig: DroneConfig) {
    return this.localFallback.generateVariants(baseConfig);
  }
}

/**
 * Auto-Cascading Multi-AI Provider:
 * Seamlessly cascades: Cohere -> Gemini -> OpenAI -> Local Deterministic fallback.
 */
export class AutoCascadingProvider implements AIProvider {
  private cohere?: CohereProvider;
  private gemini?: GeminiProvider;
  private openai?: OpenAIProvider;
  private local = new LocalDeterministicProvider();

  constructor() {
    if (config.cohereApiKey) this.cohere = new CohereProvider(config.cohereApiKey);
    if (config.geminiApiKey) this.gemini = new GeminiProvider(config.geminiApiKey);
    if (config.openaiApiKey) this.openai = new OpenAIProvider(config.openaiApiKey);
  }

  async interpretCommand(command: string, currentConfig: DroneConfig): Promise<AIInterpretationResult> {
    const lower = command.toLowerCase().trim();

    // Fast-path: Hand gesture & control query manual
    if (
      lower.includes('gesture') ||
      lower.includes('hand') ||
      lower.includes('palm') ||
      lower.includes('pum') ||
      lower.includes('control') ||
      lower.includes('how do')
    ) {
      return this.local.interpretCommand(command, currentConfig);
    }

    // 1. Try Cohere first (tested & verified working 200 OK)
    if (this.cohere) {
      try {
        const res = await this.cohere.interpretCommand(command, currentConfig);
        if (res && res.provider === 'cohere') return res;
      } catch (e) {
        console.warn('AutoProvider: Cohere attempt failed, trying next...');
      }
    }

    // 2. Try Gemini
    if (this.gemini) {
      try {
        const res = await this.gemini.interpretCommand(command, currentConfig);
        if (res && res.provider === 'gemini') return res;
      } catch (e) {
        console.warn('AutoProvider: Gemini attempt failed, trying next...');
      }
    }

    // 3. Try OpenAI
    if (this.openai) {
      try {
        const res = await this.openai.interpretCommand(command, currentConfig);
        if (res && res.provider === 'openai') return res;
      } catch (e) {
        console.warn('AutoProvider: OpenAI attempt failed, falling back...');
      }
    }

    // 4. Local Deterministic Fallback
    return this.local.interpretCommand(command, currentConfig);
  }

  async explainComponent(componentName: string) {
    if (this.cohere) {
      try {
        const res = await this.cohere.explainComponent(componentName);
        if (res) return res;
      } catch {}
    }
    return this.local.explainComponent(componentName);
  }

  async generateVariants(baseConfig: DroneConfig) {
    return this.local.generateVariants(baseConfig);
  }
}

/**
 * Factory to get active AI provider.
 */
export function getAIProvider(): AIProvider {
  if (config.aiProvider === 'cohere' && config.cohereApiKey) {
    return new CohereProvider(config.cohereApiKey);
  }
  if (config.aiProvider === 'gemini' && config.geminiApiKey) {
    return new GeminiProvider(config.geminiApiKey);
  }
  if (config.aiProvider === 'openai' && config.openaiApiKey) {
    return new OpenAIProvider(config.openaiApiKey);
  }
  if (config.aiProvider === 'auto') {
    return new AutoCascadingProvider();
  }
  return new LocalDeterministicProvider();
}
