import { create } from 'zustand';
import {
  DroneConfig,
  ComponentItem,
  ValidationReport,
  DesignVariantData,
  ViewMode,
  GestureState,
  VoiceState,
  ChatMessage
} from '../types';
import { api } from '../services/api';
import { soundFX } from '../utils/audioEngine';

interface CadStore {
  // Drone Parameters
  config: DroneConfig;
  updateConfig: (patch: Partial<DroneConfig>) => void;
  resetConfig: () => void;

  // Components Library
  components: ComponentItem[];
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  setHoveredComponentId: (id: string | null) => void;
  toggleComponentVisibility: (id: string) => void;
  addComponentCount: (id: string) => void;
  removeComponentCount: (id: string) => void;
  addNewComponent: (component: Omit<ComponentItem, 'id'> & { id?: string }) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, patch: Partial<ComponentItem>) => void;
  resetComponents: () => void;

  // Views & Camera
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isExploded: boolean;
  toggleExplodedView: () => void;
  motorsSpinning: boolean;
  toggleMotorsSpinning: () => void;
  showDimensions: boolean;
  toggleShowDimensions: () => void;
  wireframeMode: boolean;
  toggleWireframeMode: () => void;
  xrayMode: boolean;
  toggleXrayMode: () => void;
  windTunnelActive: boolean;
  toggleWindTunnel: () => void;
  windSpeed: number;
  setWindSpeed: (speed: number) => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Design Variants & Comparison
  variants: DesignVariantData[];
  activeVariantId: string;
  setActiveVariantId: (id: string) => void;
  applyVariantConfig: (variant: DesignVariantData) => void;
  loadVariants: () => Promise<void>;

  // Validation
  validationReport: ValidationReport | null;
  runValidation: () => Promise<void>;

  // Gesture State
  gestureState: GestureState;
  updateGestureState: (patch: Partial<GestureState>) => void;
  toggleCamera: () => void;
  toggleDemoSimulation: () => void;

  // Voice State
  voiceState: VoiceState;
  setVoiceListening: (listening: boolean) => void;
  setVoiceTranscript: (transcript: string) => void;
  setVoiceStatus: (status: VoiceState['status'], error?: string) => void;

  // AI Assistant & Chat
  chatMessages: ChatMessage[];
  isAiProcessing: boolean;
  sendAiMessage: (text: string) => Promise<void>;

  // Active Bottom Drawer / Tab
  activeDrawerTab: 'ai' | 'gestures' | 'comparison' | 'validation' | 'export';
  setActiveDrawerTab: (tab: 'ai' | 'gestures' | 'comparison' | 'validation' | 'export') => void;

  // Toast / System Notification
  notification: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearNotification: () => void;
}

const DEFAULT_CONFIG: DroneConfig = {
  wingspan: 400,
  armLength: 180,
  bodyWidth: 120,
  bodyLength: 120,
  bodyHeight: 35,
  motorSize: 30,
  propellerSize: 7,
  armAngle: 45,
  armThickness: 12,
  material: 'Carbon Fiber',
};

const DEFAULT_COMPONENTS: ComponentItem[] = [
  { id: 'c-frame', name: 'Frame', type: 'frame', visible: true, count: 1, description: '3K Carbon Fiber unibody center fuselage with 4 arms', weightGrams: 260 },
  { id: 'c-motors', name: 'Motor', type: 'motor', visible: true, count: 4, description: '2207 2400KV high-efficiency brushless outrunners', weightGrams: 264 },
  { id: 'c-props', name: 'Propeller', type: 'propeller', visible: true, count: 4, description: '7-inch aerodynamic polycarbonate tri-blade rotors', weightGrams: 98 },
  { id: 'c-battery', name: 'Battery', type: 'battery', visible: true, count: 1, description: '4S 14.8V 2200mAh 100C LiPo balance pack', weightGrams: 220 },
  { id: 'c-camera', name: 'Camera', type: 'camera', visible: true, count: 1, description: '1200TVL ultra low-latency FPV camera', weightGrams: 25 },
  { id: 'c-fc', name: 'Flight Controller', type: 'flight_controller', visible: true, count: 1, description: 'STM32F405 8kHz IMU gyro processor board', weightGrams: 35 },
  { id: 'c-gps', name: 'GPS & Compass', type: 'avionics', visible: true, count: 1, description: 'M10Q GNSS satellite lock puck on CNC folding mast', weightGrams: 28 },
  { id: 'c-vtx', name: '5.8GHz VTX', type: 'avionics', visible: true, count: 1, description: '800mW video transmitter with circular polarized pagoda antenna', weightGrams: 22 },
  { id: 'c-landing', name: 'Landing Skids', type: 'payload', visible: true, count: 4, description: 'Shock-absorbing carbon composite landing struts with silicone feet', weightGrams: 42 },
];

export const useCadStore = create<CadStore>((set, get) => ({
  config: { ...DEFAULT_CONFIG },

  updateConfig: (patch) => {
    set((state) => {
      const updated = { ...state.config, ...patch };
      return { config: updated };
    });
    // Auto re-validate after parameter change
    setTimeout(() => get().runValidation(), 100);
  },

  resetConfig: () => {
    set({
      config: { ...DEFAULT_CONFIG },
      viewMode: '3d',
      isExploded: false,
      selectedComponentId: null,
    });
    get().showNotification('Design parameters restored to benchmark defaults (400 mm wingspan).', 'info');
    get().runValidation();
  },

  components: [...DEFAULT_COMPONENTS],
  selectedComponentId: null,
  hoveredComponentId: null,

  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  setHoveredComponentId: (id) => set({ hoveredComponentId: id }),

  toggleComponentVisibility: (id) => {
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, visible: !c.visible } : c
      ),
    }));
    get().runValidation();
  },

  addComponentCount: (id) => {
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, count: c.count + 1 } : c
      ),
    }));
    get().runValidation();
  },

  removeComponentCount: (id) => {
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, count: Math.max(1, c.count - 1) } : c
      ),
    }));
    get().runValidation();
  },

  addNewComponent: (item) => {
    const id = item.id || `c-custom-${Date.now()}`;
    const newComp: ComponentItem = {
      id,
      name: item.name,
      type: item.type,
      visible: item.visible ?? true,
      count: item.count || 1,
      description: item.description || '',
      weightGrams: item.weightGrams || 10,
      custom: item.custom ?? true,
    };
    set((state) => ({
      components: [...state.components, newComp],
      selectedComponentId: id,
    }));
    get().showNotification(`Added ${newComp.name} (+${newComp.weightGrams}g) to drone assembly.`, 'success');
    get().runValidation();
  },

  removeComponent: (id) => {
    const comp = get().components.find((c) => c.id === id);
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    }));
    get().showNotification(`Removed ${comp ? comp.name : 'component'} from assembly.`, 'info');
    get().runValidation();
  },

  updateComponent: (id, patch) => {
    set((state) => ({
      components: state.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    get().runValidation();
  },

  resetComponents: () => {
    set({
      components: [...DEFAULT_COMPONENTS],
      selectedComponentId: null,
    });
    get().showNotification('Component inventory reset to baseline configuration.', 'info');
    get().runValidation();
  },

  viewMode: '3d',
  isExploded: false,

  setViewMode: (mode) => {
    set({
      viewMode: mode,
      isExploded: mode === 'exploded',
    });
    get().showNotification(`Switched camera view to: ${mode.toUpperCase()} VIEW`, 'info');
  },

  toggleExplodedView: () => {
    const nextState = !get().isExploded;
    set({
      isExploded: nextState,
      viewMode: nextState ? 'exploded' : '3d',
    });
    get().showNotification(nextState ? 'Exploded assembly view activated.' : 'Reassembled to compact 3D view.', 'info');
  },

  motorsSpinning: true,
  toggleMotorsSpinning: () => {
    const next = !get().motorsSpinning;
    set({ motorsSpinning: next });
    soundFX.setMotorSpinning(next);
    get().showNotification(next ? 'Motors spinning (Flight mode)' : 'Motors parked (CAD inspection mode)', 'info');
  },

  showDimensions: false,
  toggleShowDimensions: () => {
    const next = !get().showDimensions;
    set({ showDimensions: next });
    get().showNotification(next ? 'CAD dimension overlay active' : 'CAD dimension overlay hidden', 'info');
  },

  wireframeMode: false,
  toggleWireframeMode: () => {
    const next = !get().wireframeMode;
    set({ wireframeMode: next });
    get().showNotification(next ? 'Wireframe CAD mode active' : 'Shaded PBR mode active', 'info');
  },

  xrayMode: false,
  toggleXrayMode: () => {
    const next = !get().xrayMode;
    set({ xrayMode: next });
    get().showNotification(next ? 'X-Ray internal inspection mode active' : 'Standard PBR shading restored', 'info');
  },

  windTunnelActive: false,
  toggleWindTunnel: () => {
    const next = !get().windTunnelActive;
    set({ windTunnelActive: next });
    get().showNotification(next ? 'Aerodynamic CFD Wind Tunnel Activated' : 'Wind Tunnel Deactivated', 'info');
  },

  windSpeed: 14,
  setWindSpeed: (speed) => set({ windSpeed: speed }),

  soundEnabled: true,
  toggleSound: () => {
    const next = soundFX.toggleMute();
    set({ soundEnabled: next });
    get().showNotification(next ? 'Aerospace Sound FX unmuted' : 'Audio muted', 'info');
  },

  variants: [],
  activeVariantId: 'variant-1',

  setActiveVariantId: (id) => set({ activeVariantId: id }),

  applyVariantConfig: (variant) => {
    set({
      config: { ...variant.config },
      activeVariantId: variant.id,
    });
    get().showNotification(`Applied ${variant.name} configuration.`, 'success');
    get().runValidation();
  },

  loadVariants: async () => {
    const list = await api.getVariants(get().config);
    set({ variants: list });
  },

  validationReport: null,

  runValidation: async () => {
    const { config, components } = get();
    const report = await api.validateDesign(config, components);
    set({ validationReport: report });
    if (report?.overallStatus === 'valid') {
      soundFX.playValidationSuccess();
    }
  },

  gestureState: {
    detected: false,
    gesture: 'none',
    handPosition: { x: 0, y: 0, z: 0 },
    rawFingertip: { x: 0.5, y: 0.5 },
    confidence: 0,
    activeAction: 'Waiting for hand...',
    cameraActive: false,
    demoSimulated: false,
    palmRotation: { yaw: 0, pitch: 0 },
  },

  updateGestureState: (patch) => {
    set((state) => ({
      gestureState: { ...state.gestureState, ...patch },
    }));
  },

  toggleCamera: () => {
    const cur = get().gestureState.cameraActive;
    set((state) => ({
      gestureState: {
        ...state.gestureState,
        cameraActive: !cur,
        activeAction: !cur ? 'Webcam active. Initializing hand landmarks...' : 'Webcam disabled.',
      },
    }));
    get().showNotification(!cur ? 'Webcam tracking started. Show your hand!' : 'Webcam tracking stopped.', !cur ? 'success' : 'info');
  },

  toggleDemoSimulation: () => {
    const cur = get().gestureState.demoSimulated;
    set((state) => ({
      gestureState: {
        ...state.gestureState,
        demoSimulated: !cur,
        cameraActive: !cur ? false : state.gestureState.cameraActive,
        activeAction: !cur ? 'Simulated Gesture Demo mode active' : 'Simulation ended',
      },
    }));
    get().showNotification(!cur ? 'Automated Hand Gesture Simulation activated.' : 'Simulation deactivated.', 'info');
  },

  voiceState: {
    isListening: false,
    transcript: '',
    lastCommand: '',
    status: 'idle',
  },

  setVoiceListening: (listening) => {
    set((state) => ({
      voiceState: { ...state.voiceState, isListening: listening, status: listening ? 'listening' : 'idle' },
    }));
  },

  setVoiceTranscript: (transcript) => {
    set((state) => ({
      voiceState: { ...state.voiceState, transcript },
    }));
  },

  setVoiceStatus: (status, errorMessage) => {
    set((state) => ({
      voiceState: { ...state.voiceState, status, errorMessage },
    }));
  },

  chatMessages: [
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Welcome to GestureCAD Studio! You can control and manipulate the drone airframe with natural webcam hand gestures:\n\n🖐️ **Open Palm:** Spatial 3D Orbit — Move hand left/right to rotate yaw, up/down to tilt pitch!\n🤏 **Pinch (Thumb + Index):** Resize Wingspan — Drag outward to expand (up to 600mm), inward to contract!\n☝️ **Pointing Finger:** Laser Inspection — Aim directly at motors, battery, camera, or flight controller!\n✊ **Closed Fist:** Lock & Validate — Confirm parameters and run instant aerodynamic flight checks!\n✌️ **Peace / V-Sign:** Toggle Exploded View — Separate all mechanical subassemblies!\n🤘 **Rock Sign (Horns):** Flight Simulation — Toggle high-speed rotor spin & aerodynamic downwash!\n🤙 **Shaka Sign:** Reset Viewport — Snap camera back to default home perspective!\n\nClick "Start" on the camera HUD or use "Auto Demo Sim" to watch automated simulation!',
      timestamp: '16:00',
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'How do hand gestures control the drone?',
      timestamp: '16:01',
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: 'Show your hand to the webcam! When you hold an open palm, moving it rotates the 3D drone in yaw and pitch. Pinching thumb and index allows you to stretch the wingspan. Pointing at components highlights them with live telemetry. Clenching a fist locks your parameters and validates safety. Peace sign explodes the assembly, Rock sign spins rotors, and Shaka sign resets the view!',
      timestamp: '16:01',
      structuredData: {
        operation: 'setParameter',
        parameter: 'wingspan',
        value: 400,
        unit: 'mm',
      },
    },
  ],

  isAiProcessing: false,

  sendAiMessage: async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isAiProcessing: true,
    }));

    try {
      const res = await api.interpretAI(text, get().config);
      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: res.explanation || 'Processed your instruction successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredData: {
          operation: res.operation,
          parameter: res.parameter,
          value: res.value,
          unit: res.unit,
          suggestedConfig: res.suggestedConfig,
          provider: res.provider,
        },
      };

      if (res.suggestedConfig) {
        get().updateConfig(res.suggestedConfig);
      } else if (res.parameter && res.value !== undefined) {
        get().updateConfig({ [res.parameter]: res.value });
      }

      if (res.operation === 'toggleView' && res.parameter) {
        if (['3d', 'exploded', 'top', 'side'].includes(res.parameter)) {
          get().setViewMode(res.parameter as ViewMode);
        }
      }

      if (res.operation === 'generateAlternatives') {
        get().setActiveDrawerTab('comparison');
        await get().loadVariants();
      }

      set((state) => ({
        chatMessages: [...state.chatMessages, aiMsg],
        isAiProcessing: false,
      }));

      // Verbal speech response
      if ('speechSynthesis' in window && res.explanation) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.explanation);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }

      get().showNotification(res.explanation, 'success');
    } catch (err) {
      console.error('Error sending AI message:', err);
      set((state) => ({
        chatMessages: [
          ...state.chatMessages,
          {
            id: 'msg-' + Date.now(),
            sender: 'ai',
            text: 'I could not interpret that command cleanly. Try: "Increase wingspan to 450 mm" or "Show exploded view".',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
        isAiProcessing: false,
      }));
    }
  },

  activeDrawerTab: 'ai',
  setActiveDrawerTab: (tab) => set({ activeDrawerTab: tab }),

  notification: null,
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => {
      set((state) => (state.notification?.message === message ? { notification: null } : {}));
    }, 4000);
  },
  clearNotification: () => set({ notification: null }),
}));

