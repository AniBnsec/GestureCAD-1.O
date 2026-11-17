import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  aiProvider: (process.env.AI_PROVIDER || 'auto').toLowerCase() as 'auto' | 'cohere' | 'gemini' | 'openai' | 'local',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  
  // 1. Google Gemini API
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
  geminiTemperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.2'),

  // 2. MediaPipe Hand Tracking
  mediapipe: {
    modelPath: process.env.MEDIAPIPE_MODEL_PATH || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
    delegate: process.env.MEDIAPIPE_DELEGATE || 'GPU',
    runningMode: process.env.MEDIAPIPE_RUNNING_MODE || 'VIDEO',
    minConfidence: parseFloat(process.env.MEDIAPIPE_MIN_DETECTION_CONFIDENCE || '0.65'),
  },

  // 3. Three.js Engine
  threejs: {
    precision: process.env.THREE_RENDERER_PRECISION || 'highp',
    antialias: process.env.THREE_ANTIALIAS !== 'false',
    powerPreference: process.env.THREE_POWER_PREFERENCE || 'high-performance',
    shadowMapType: process.env.THREE_SHADOW_MAP_TYPE || 'PCFSoftShadowMap',
  },

  // 4. OpenAI Speech API
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiWhisperModel: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
  openaiLanguage: process.env.OPENAI_LANGUAGE || 'en',

  // 5. CadQuery / OpenCascade
  cadquery: {
    pythonPath: process.env.CADQUERY_PYTHON_PATH || 'python',
    kernelUrl: process.env.CADQUERY_KERNEL_URL || 'http://localhost:8000/cadquery',
    openCascadeVersion: process.env.OPENCASCADE_VERSION || '7.6.3',
    exportFormats: (process.env.CADQUERY_EXPORT_FORMATS || 'STEP,IGES,STL,DXF').split(','),
  },

  // 6. MongoDB Atlas
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    dbName: process.env.MONGODB_DB_NAME || 'gesturecad_cloud',
    collectionDesigns: process.env.MONGODB_COLLECTION_DESIGNS || 'quadcopter_designs',
    collectionProjects: process.env.MONGODB_COLLECTION_PROJECTS || 'user_projects',
  },

  // 7. FastAPI Gateway
  fastapi: {
    gatewayUrl: process.env.FASTAPI_GATEWAY_URL || 'http://localhost:8000',
    secretKey: process.env.FASTAPI_SECRET_KEY || 'gesturecad-fastapi-microservice-secret-token',
    timeoutMs: parseInt(process.env.FASTAPI_TIMEOUT_MS || '5000', 10),
  },

  // 8. Firebase Storage
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'gesturecad-studio',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'gesturecad-studio.appspot.com',
    apiKey: process.env.FIREBASE_API_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  },

  // Optional Cohere Fallback
  cohereApiKey: process.env.COHERE_API_KEY || '',
};
