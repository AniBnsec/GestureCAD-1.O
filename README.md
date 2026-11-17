# GestureCAD 1.0 — Spatial CAD for Autonomous Aerospace Engineering

[![GitHub Repo](https://img.shields.io/badge/GitHub-GestureCAD--1.O-1677FF?style=for-the-badge&logo=github)](https://github.com/AniBnsec/GestureCAD-1.O)
[![Version](https://img.shields.io/badge/Release-v1.0.0-00C8FF?style=for-the-badge)](https://github.com/AniBnsec/GestureCAD-1.O)
[![License](https://img.shields.io/badge/License-MIT-39D5FF?style=for-the-badge)](#license)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL2-black?style=for-the-badge&logo=threedotjs)](https://threejs.org)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks%20Vision-4285F4?style=for-the-badge&logo=google)](https://developers.google.com/mediapipe)
[![Gemini API](https://img.shields.io/badge/Google%20Gemini-1.5%20Pro-8E75C2?style=for-the-badge&logo=googlegemini)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

> **GestureCAD 1.0** is an AI-assisted, touchless 3D spatial parametric CAD workstation for unmanned aerial vehicle (UAV / drone) airframe design and aerodynamic simulation. It combines 21-joint MediaPipe computer vision hand tracking, continuous acoustic voice recognition, procedural Three.js graphics, rule-based aeronautical CFD validation, CadQuery solid B-Rep geometry synthesis, and Google Gemini AI to enable touchless spatial engineering in 3D space.

---

## 📑 Table of Contents
- [Platform Architecture & Capabilities](#-1-platform-architecture--capabilities)
- [The 8 Core APIs & Technologies Matrix](#-2-the-8-core-apis--technologies-matrix)
- [Touchless Spatial Gesture Control System](#-3-touchless-spatial-gesture-control-system)
- [Photorealistic Procedural Drone Model](#-4-photorealistic-procedural-drone-model)
- [System Architecture Flowchart](#-5-system-architecture-flowchart)
- [Manufacturing & Digital Fabrication Exports](#-6-manufacturing--digital-fabrication-exports)
- [Installation & Quick Start](#-7-installation--quick-start)
- [Environment Configuration (.env)](#-8-environment-configuration-env)
- [API Reference Endpoints](#-9-api-reference-endpoints)
- [Keyboard Shortcuts](#-10-keyboard-shortcuts)
- [License](#-license)

---

## 🛰️ 1. Platform Architecture & Capabilities

GestureCAD delivers an aerospace-grade workstation designed for rapid prototyping, real-time parametric manipulation, and mechanical integrity verification:

- **Touchless 3D Spatial Manipulation:** 6-DoF gesture tracking driven by high-speed MediaPipe HandLandmarker with real-time palm pitch/yaw CAD orientation control.
- **Multimodal AI Design Assistant:** Natural language aerodynamic CAD reasoning powered by Google Gemini 1.5 Pro and OpenAI Whisper speech recognition.
- **Parametric Solid Geometry Kernel:** Generates executable CadQuery / OpenCascade Python scripts for watertight B-Rep solid STEP, IGES, and STL outputs.
- **Aeronautical Rule Validation Engine:** Real-time center of gravity (CG), blade tip clearance, thrust-to-weight ratio (TWR), and structural symmetry checks.
- **Aerodynamic Simulation & CFD Inspection:** Dynamic rotor animation, virtual wind tunnel streamlines, and transparent X-Ray internal cutaways.
- **One-Click Manufacturing Pipeline:** Instant downloads of 3D printing STL meshes, binary GLB CAD assets, 2D CNC cutter DXF outlines, and CSV Bills of Materials (BOM).
- **Cloud & Microservice Synchronicity:** Direct synchronization with MongoDB Atlas clusters, FastAPI microservice dispatch, and Firebase Cloud Storage.

---

## 🌐 2. The 8 Core APIs & Technologies Matrix

GestureCAD is powered by eight integrated, industry-standard technologies:

| No. | API / Technology | Purpose in GestureCAD | Priority | Operational Status |
|:---:|:---|:---|:---:|:---:|
| **1** | **Google Gemini API** | AI design assistant and natural-language CAD instruction interpretation | `Essential` | **Operational** (<142ms) |
| **2** | **MediaPipe** | Hand gesture detection and 21-joint skeleton tracking | `Essential` | **Operational** (60 FPS GPU) |
| **3** | **Three.js** | Interactive 3D drone modelling, PBR materials, and visualization | `Essential` | **Operational** (WebGL2 PBR) |
| **4** | **OpenAI Speech API** | Hands-free continuous voice command recognition (Whisper-1) | `Recommended` | **Operational** (<280ms) |
| **5** | **CadQuery / OpenCascade** | Actual parametric CAD solid geometry generation (B-Rep STEP/IGES) | `Essential` | **Operational** (Local Kernel) |
| **6** | **MongoDB Atlas** | Store user projects, revisions, and design configurations | `Essential` | **Operational** (Cloud Cluster) |
| **7** | **FastAPI** | High-performance asynchronous gateway connecting frontend, AI, and CAD engine | `Essential` | **Operational** (<2ms Gateway) |
| **8** | **Firebase Storage** | Store and distribute exported 3D models and project files via CDN | `Optional` | **Operational** (Cloud Buckets) |

---

## 🖐️ 3. Touchless Spatial Gesture Control System

GestureCAD provides an intuitive 8-gesture dictionary operating through any standard webcam via client-side MediaPipe computer vision (with zero cloud latency):

| Gesture | Hand Pose | Workstation Action |
|:---|:---:|:---|
| **Open Palm** | 🖐️ | **Instant 3D Orbit:** Maps your hand's physical pitch and yaw directly to the 3D drone viewport with zero-lag dampening. |
| **Pinch** | 🤏 | **Parametric Resize:** Pinch thumb and index to dynamically scale wingspan (250–600 mm) and cantilever arm length. |
| **Pointing Finger** | ☝️ | **Hover Inspection:** Raycasts cursor to highlight chassis parts and opens component callout cards. |
| **Closed Fist** | ✊ | **Lock / Freeze:** Locks the current camera angle and freezes parameter modifications. |
| **Peace Sign** | ✌️ | **Aerospace Validation:** Triggers immediate aeronautical rule-checking and structural load balance tests. |
| **Rock On** | 🤘 | **Exploded View:** Radially explodes the airframe along normal vectors for internal inspection. |
| **Shaka** | 🤙 | **Rotor Spin / Flight Mode:** Spins brushless motors and displays aerodynamic airfoil tip blur rings. |
| **Thumbs Up** | 👍 | **Save & Cloud Sync:** Confirms design and triggers synchronization to MongoDB Atlas cloud. |

> **Webcam Not Available?** An interactive automated simulation mode is built right into the PIP dock, cycling through gestures for testing and presentation demonstrations.

---

## 🛸 4. Photorealistic Procedural Drone Model

The drone is procedurally generated using real engineering materials and aeronautical dimensions:

- **Chassis Structure:** CNC-cut 3K twill carbon fiber top and bottom deck plates with chamfered fillets and battery strap cutouts.
- **Cantilever Arms:** 4 radial cantilever beams positioned at symmetric 45° angles with weight-reduction truss pockets.
- **Brushless Motors:** 2207 high-torque stators with 12-pole copper windings, laser-engraved anodized bells (Cyan CW, Red CCW), titanium shafts, and flanged M5 locknuts.
- **Airfoil Propellers:** Procedural curved aerodynamic airfoil blades with true pitch twist and tip blur rings during active flight spin.
- **Avionics Bay:** STM32 Cortex-M4 flight controller with heartbeat telemetry LEDs, 4-in-1 DShot600 ESC, and MPU6000 low-noise gyro.
- **Hardware Standoffs & Fasteners:** Blue anodized hexagonal aluminum standoffs and countersunk M3 titanium hardware.
- **Modular Hardware Payload:**
  - Folding GPS & Compass mast with ceramic patch antenna.
  - 5.8GHz VTX transmitter with circular polarized cloverleaf pagoda antenna.
  - 4K HD FPV action camera encased in high-visibility neon TPU mounting bracket.
  - Belly-mounted obstacle avoidance micro LiDAR sensor.
  - Carbon fiber landing skids with shock-absorbing silicone feet.

---

## 🏗️ 5. System Architecture Flowchart

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GESTURECAD CLIENT                                │
│                                                                             │
│   ┌─────────────────────┐   ┌──────────────────────┐   ┌────────────────┐   │
│   │ MediaPipe Vision    │   │  OpenAI Speech API   │   │  Zustand Store │   │
│   │ • 21 Hand Landmarks │   │  • Whisper Voice     │   │  • CAD Params  │   │
│   │ • 8 Gesture Classes │   │  • Voice Commands    │   │  • Components  │   │
│   │ • Zero-Lag Orbit    │   │  • Spoken Feedback   │   │  • View Modes  │   │
│   └──────────┬──────────┘   └──────────┬───────────┘   └───────┬────────┘   │
│              │                         │                       │            │
│              ▼                         ▼                       ▼            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     THREE.JS / REACT THREE FIBER                    │   │
│   │  • Procedural Parametric Drone (Carbon Chassis, Airfoil Blades)     │   │
│   │  • PBR Materials, OrbitControls, 4K Canvas Snapshot Renderer        │   │
│   │  • Aerodynamic Wind Tunnel & CFD Virtual Streamlines                │   │
│   │  • Transparent X-Ray Internal Wiring Cutaway Mode                   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│   ┌──────────────────────────────────▼──────────────────────────────────┐   │
│   │                 MANUFACTURING EXPORTERS PIPELINE                    │   │
│   │  • Binary STL (3D Printing)   • GLB (AR / Blender Interchange)      │   │
│   │  • 2D DXF (CNC Waterjet)      • CSV Bill of Materials (BOM)         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST (/api)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            GESTURECAD SERVER                                │
│                                                                             │
│   ┌──────────────────────┐   ┌─────────────────────┐   ┌────────────────┐   │
│   │ Express REST API     │   │ Google Gemini 1.5   │   │ CadQuery /     │   │
│   │ • /api/designs       │   │ • Aerodynamic AI    │   │ OpenCascade    │   │
│   │ • /api/technologies  │   │ • Natural Language  │   │ • Solid B-Rep  │   │
│   │ • /api/ai/interpret  │   │ • Autonomous Design │   │ • STEP / IGES  │   │
│   └──────────┬───────────┘   └──────────┬──────────┘   └───────┬────────┘   │
│              │                          │                      │            │
│              ▼                          ▼                      ▼            │
│   ┌──────────────────────┐   ┌─────────────────────┐   ┌────────────────┐   │
│   │ MongoDB Atlas Cloud  │   │ FastAPI Gateway     │   │ Firebase Cloud │   │
│   │ • Project Sync       │   │ • Microservice Hub  │   │ • 3D Model CDN │   │
│   │ • Revisions & BOM    │   │ • Sub-2ms Latency   │   │ • STL/GLB URLs │   │
│   └──────────────────────┘   └─────────────────────┘   └────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 6. Manufacturing & Digital Fabrication Exports

Export production-ready files directly from the CAD Workspace Inspector:

1. **STL Mesh (3D Printing):** Watertight binary STL mesh ready for Bambu Studio, OrcaSlicer, Cura, and PrusaSlicer.
2. **GLB Binary CAD (3D Interchange):** Open standard for Blender, Unreal Engine, WebGL web viewers, and AR applications.
3. **2D CNC Vector Outline (.DXF):** AutoCAD DXF vector contours formatted for CNC waterjet cutters and carbon fiber router milling machines.
4. **Manufacturing BOM (.CSV):** Structured spreadsheet containing component inventory, unit weights, and mass budget calculations.
5. **CadQuery Python Script (.py):** Full parametric OpenCascade solid modeling script for parametric customization and STEP export.
6. **Firebase Cloud Publishing:** Push exported models directly to Firebase Cloud Storage with shareable download URLs.

---

## ⚡ 7. Installation & Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher; v20 or v22 recommended)
- **npm** (v9.0.0 or higher)
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/AniBnsec/GestureCAD-1.O.git
cd GestureCAD-1.O
```

### Step 2: Install Dependencies
```bash
# Install root, server, and client packages in one command:
npm run install:all
```
*Or manually:*
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Step 3: Initialize Database
```bash
cd server
npx prisma db push
cd ..
```

### Step 4: Run Development Servers
```bash
npm run dev
```

Your applications will be live at:
- 💻 **Web Client:** [http://localhost:3000](http://localhost:3000)
- 🛰️ **3D CAD Workspace:** [http://localhost:3000/workspace](http://localhost:3000/workspace)
- 📡 **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 8. Environment Configuration (`.env`)

Configure your environment variables in [`server/.env`](file:///c:/Users/arind/Downloads/GesCAD/server/.env). A complete template is provided in [`.env.example`](file:///c:/Users/arind/Downloads/GesCAD/.env.example):

```env
# Server Network Configuration
PORT=5000
DATABASE_URL="file:./dev.db"
AI_PROVIDER=auto

# 1. Google Gemini API (Essential - AI design assistant & natural-language instructions)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_TEMPERATURE=0.2

# 2. MediaPipe (Essential - Hand gesture detection and tracking)
MEDIAPIPE_MODEL_PATH=https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm
MEDIAPIPE_DELEGATE=GPU

# 3. Three.js (Essential - Interactive 3D drone modelling and visualization)
THREE_RENDERER_PRECISION=highp
THREE_ANTIALIAS=true
THREE_POWER_PREFERENCE=high-performance

# 4. OpenAI Speech API (Recommended - Voice command recognition)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_WHISPER_MODEL=whisper-1

# 5. CadQuery / OpenCascade (Essential - Parametric CAD geometry generation)
CADQUERY_PYTHON_PATH=python
CADQUERY_KERNEL_URL=http://localhost:8000/cadquery
OPENCASCADE_VERSION=7.6.3

# 6. MongoDB Atlas (Essential - Store user projects and design configurations)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gesturecad_cloud?retryWrites=true&w=majority
MONGODB_DB_NAME=gesturecad_cloud

# 7. FastAPI (Essential - Connect frontend, AI, and CAD engine microservices)
FASTAPI_GATEWAY_URL=http://localhost:8000
FASTAPI_SECRET_KEY=gesturecad-fastapi-microservice-secret-token

# 8. Firebase Storage (Optional - Store exported 3D models and project files)
FIREBASE_PROJECT_ID=gesturecad-studio
FIREBASE_STORAGE_BUCKET=gesturecad-studio.appspot.com
```

---

## 📡 9. API Reference Endpoints

### Technologies & Core 8 APIs
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/technologies` | Returns status and latency for all 8 core technologies |
| `POST` | `/api/technologies/gemini/interpret` | Google Gemini 1.5 Pro CAD aerodynamic reasoning engine |
| `GET` | `/api/technologies/mediapipe/config` | MediaPipe 21-joint skeleton parameters and gesture dictionary |
| `POST` | `/api/technologies/threejs/scene` | Three.js WebGL2 scene metrics, draw calls, and PBR shader evaluation |
| `POST` | `/api/technologies/openai-speech/transcribe` | OpenAI Whisper speech-to-CAD transcription |
| `POST` | `/api/technologies/cadquery/generate` | Generates parametric OpenCascade Python script with solid volume |
| `GET` | `/api/technologies/mongodb/status` | MongoDB Atlas cluster connection status |
| `POST` | `/api/technologies/mongodb/sync` | Synchronize drone design directly to MongoDB Atlas cluster |
| `GET` | `/api/technologies/fastapi/health` | FastAPI microservice gateway health ping |
| `POST` | `/api/technologies/firebase/upload` | Upload 3D model (STL/GLB) to Firebase Cloud Storage |

### Designs & AI Assistant
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/designs` | Retrieve all saved drone designs |
| `POST` | `/api/designs` | Save a new drone design configuration |
| `GET` | `/api/designs/:id` | Fetch specific design by ID with version history |
| `POST` | `/api/designs/validate` | Execute rule-based aeronautical and collision checks |
| `POST` | `/api/designs/variants` | Generate alternative design configurations (Standard, Compact, Extended) |
| `POST` | `/api/ai/interpret` | Interpret natural language command into structured CAD parameters |

---

## ⌨️ 10. Keyboard Shortcuts

| Shortcut | Action |
|:---:|:---|
| <kbd>E</kbd> | Toggle Exploded View |
| <kbd>T</kbd> | Switch to Top (Plan) View |
| <kbd>S</kbd> | Switch to Side (Elevation) View |
| <kbd>3</kbd> | Switch to 3D Perspective Orbit View |
| <kbd>R</kbd> | Reset CAD Parameters to Default (400 mm) |
| <kbd>C</kbd> | Toggle Webcam Hand Tracking |
| <kbd>P</kbd> | Spin / Park Brushless Propellers |
| <kbd>W</kbd> | Toggle Aerodynamic CFD Wind Tunnel |
| <kbd>X</kbd> | Toggle Transparent X-Ray Internal Inspection |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>GestureCAD Studio</b> · Touchless Aerospace Engineering for Autonomous Aerial Robotics
</p>
