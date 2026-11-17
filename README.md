# GestureCAD Studio — Spatial CAD for Autonomous Aerospace Engineering

[![Version](https://img.shields.io/badge/Release-v2.4.0--Enterprise-1677FF?style=for-the-badge)](https://gesturecad.io)
[![License](https://img.shields.io/badge/License-MIT-00C8FF?style=for-the-badge)](#license)
[![React](https://img.shields.io/badge/React-18-00C8FF?style=for-the-badge&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-white?style=for-the-badge&logo=threedotjs)](https://threejs.org)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks%20Vision-39D5FF?style=for-the-badge&logo=google)](https://developers.google.com/mediapipe)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)

> **GestureCAD Studio** is an AI-assisted, webcam-powered 3D spatial parametric CAD platform for autonomous unmanned aerial vehicle (UAV / drone) engineering. It integrates 21-joint MediaPipe computer vision hand tracking, voice recognition, procedural Three.js graphics, rule-based aeronautical CFD validation, and multi-model cascading AI (Cohere / Gemini / OpenAI) to enable touchless spatial engineering in 3D space.

---

## 🛰️ 1. Platform Overview & Capabilities

GestureCAD delivers an aerospace-grade workstation designed for rapid prototyping, real-time parametric manipulation, and mechanical integrity verification:

- **Touchless 3D Spatial Manipulation:** 6-DoF gesture control driven by high-speed MediaPipe HandLandmarker.
- **Multimodal AI Copilot:** Natural language parametric adjustments with automatic cascade across Cohere, Google Gemini, and OpenAI.
- **Aeronautical Rule Engine:** Real-time center of gravity (CG), blade tip clearance, thrust-to-weight, and structural symmetry validation.
- **Parametric CAD Exporter:** Export STL (for 3D printing), GLB, OBJ, JSON bill-of-materials, and automated CadQuery Python scripts.

---

## 🎨 2. Visual Identity & Design System

The application strictly adopts an aerospace cockpit visual language:

| Color Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Navy** | `#07111F` | Primary panel backgrounds & sidebars |
| **Dark Background** | `#080D17` | Workstation viewport & canvas canvas |
| **Dark Blue** | `#10233B` | Glassmorphic card surfaces & containers |
| **Electric Blue** | `#1677FF` | Primary action CTAs & active borders |
| **Neon Cyan** | `#00C8FF` | Holographic highlights, cursor reticle, accent lines |
| **Bright Cyan** | `#39D5FF` | Parameter values & secondary badges |
| **Accent Red** | `#F04444` | High-temperature indicators, CW motor bell accents, alerts |
| **White** | `#FFFFFF` | Primary headings & high-contrast typography |
| **Light Blueprint**| `#F3F7FC` | Engineering documentation & real-world impact section |
| **Blueprint Grey** | `#DCE5F0` | Blueprint technical grid lines & borders |

---

## 🛠️ 3. Full-Stack System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GESTURECAD CLIENT                                │
│                                                                             │
│   ┌─────────────────────┐   ┌──────────────────────┐   ┌────────────────┐   │
│   │ MediaPipe Vision    │   │  Web Speech API      │   │  Zustand Store │   │
│   │ • 21 Hand Landmarks │   │  • SpeechRecognition │   │  • CAD Params  │   │
│   │ • Pinch / Move /    │   │  • SpeechSynthesis   │   │  • Components  │   │
│   │   Open Palm / Fist  │   │  • Spoken Responses  │   │  • Views / HUD │   │
│   └──────────┬──────────┘   └──────────┬───────────┘   └───────┬────────┘   │
│              │                         │                       │            │
│              ▼                         ▼                       ▼            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     THREE.JS / REACT THREE FIBER                    │   │
│   │  • Procedural Parametric Drone (Chassis, Arms, Motors, Props)       │   │
│   │  • OrbitControls, 3D / Exploded / Top / Side View Modes             │   │
│   │  • Raycaster Selection & Holographic Highlight Shader               │   │
│   │  • Real-Time Dimension Indicators & Blueprint Ground Grid           │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│   ┌──────────────────────────────────▼──────────────────────────────────┐   │
│   │                 MANUFACTURING EXPORTERS                             │   │
│   │  • STLExporter (3D Printing)  • GLTFExporter (CAD & AR Interchange) │   │
│   │  • JSON Design Configuration & Bill of Materials                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST (/api)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            GESTURECAD SERVER                                │
│                                                                             │
│   ┌──────────────────────┐   ┌─────────────────────┐   ┌────────────────┐   │
│   │ Express REST API     │   │ AI Provider Engine  │   │ Rule-based     │   │
│   │ • /api/designs       │   │ • Gemini API        │   │ Validation     │   │
│   │ • /api/ai/interpret  │   │ • OpenAI API        │   │ • 4 Mounts     │   │
│   │ • /api/assistant     │   │ • Local NLP Parser  │   │ • Symmetry     │   │
│   │ • /api/health        │   │   (Demo Mode)       │   │ • Blade Margins│   │
│   └──────────┬───────────┘   └──────────┬──────────┘   └───────┬────────┘   │
│              │                          │                      │            │
│              ▼                          ▼                      ▼            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        PRISMA ORM & SQLITE                          │   │
│   │  • User, Design, DesignVariant, CommandHistory Models               │   │
│   │  • Seeding benchmark AeroStandard-400 Quadcopter specifications     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ 4. Core Features

### A. Real Interactive 3D Parametric CAD Workstation
- Real procedural 3D model (not static images or canned videos).
- **Central Body**: Multi-layer carbon fiber top and bottom plates with CNC standoffs.
- **Radial Arms**: 4 cantilever beams positioned at symmetric 45° angles.
- **Brushless Motors**: High-efficiency 2207 stator coils with anodized rotating bells.
- **Airfoil Propellers**: Counter-rotating (CW/CCW) dual/tri-blade rotors with continuous aerodynamic spin animation.
- **Avionics & Payload**: LiPo 4S balance battery pack, STM32 flight controller with glowing LEDs, and vibration-damped front FPV camera.
- **Exploded View**: Smoothly disassembles the assembly radially and vertically along normal vectors for maintenance inspection.
- **Multi-Angle Views**: Instant transitions between **Perspective 3D**, **Exploded**, **Top (Plan)**, and **Side (Elevation)** views.

### B. Computer Vision Hand Tracking (MediaPipe Tasks Vision)
- Connects to user webcam via standard HTML5 `navigator.mediaDevices`.
- Tracks 21 hand landmarks in real time with GPU acceleration.
- **Implemented Gestures**:
  - **Pinch** (Index + Thumb distance < 0.08): Selects component under cursor / adjusts slider values.
  - **Move Pinched Hand**: Dynamically scales the parameter or moves selected parts smoothly with exponential smoothing.
  - **Open Palm**: Releases active selection and locks geometry.
  - **Pointing Finger**: Highlights hovered component in viewport.
  - **Closed Fist**: Confirms action or triggers quick reset.
- **Interactive Simulated Demo Mode**: Allows judges or testing machines without webcam access to view automated gesture landmark tracking and parameter adjustments.

### C. Voice Command System (Web Speech API)
- Speech recognition directly transforms spoken instructions into parametric adjustments:
  - *"Increase the wingspan to 40 centimetres."*
  - *"Suggest a more compact version for indoor use."*
  - *"Show exploded assembly view."*
  - *"Reset the design."*
- Text fallback input bar for browsers that do not support Web Speech or for noisy environments.
- SpeechSynthesis verbal feedback confirming executed modifications.

### D. AI Design Assistant
- Clean card matching Slide 4 with audio waveform indicator and suggested prompt chips.
- Converts conversational input into structured JSON:
  ```json
  {
    "operation": "setParameter",
    "parameter": "wingspan",
    "value": 400,
    "unit": "mm",
    "explanation": "Updating wingspan to 400 mm. Adjusted arm length and motor placement for balanced stability."
  }
  ```
- **Demo Mode**: Includes a deterministic local rule parser capable of offline execution with high precision.
- **Cloud Mode**: Configurable via `.env` to connect to Google Gemini API or OpenAI API.

### E. Aeronautical Rule-Based Design Validation
Verifies engineering rules and displays **Valid**, **Warning**, or **Invalid** status badges:
1. **4 Motor Mounts**: Checks for exact quadcopter radial symmetry.
2. **Structural Symmetry**: Bilateral orthogonal arm offset verification (45° diagonal angle).
3. **No Component Collision**: Calculates dynamic rotor tip clearance:
   $$\text{Clearance} = (2 \times \text{armLength} \times \sin(45^\circ)) - \text{propDiameter}$$
   Emits warnings if clearance is marginal (< 25 mm) or collision (< 0 mm).
4. **Dimension Constraints**: Verifies wingspan (250–600 mm) and arm length (120–280 mm).
5. **Balanced Weight Distribution**: Calculates Center of Gravity (CG) offset from geometric centroid based on battery and payload placement.
*Notice: Conceptual design prototype for rapid prototyping, not flight-certified.*

### F. Multi-Format 3D Exporters
- **STL Export**: Generates binary STL files for 3D slicing software (Cura, Bambu Studio, PrusaSlicer).
- **GLB/GLTF Export**: Standard binary 3D CAD interchange format for Blender, Unity, and web viewers.
- **JSON Export**: Downloads the exact parametric configuration, metadata, and Bill of Materials (BOM).
- **STEP Export**: Clearly marked as **In Roadmap (Phase 2)**.

---

## 🚀 5. Installation & Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher; v20/v24 recommended)
- **npm** (v9.0.0 or higher)

### Step 1: Clone or Navigate to the Repository
```bash
cd GesCAD
```

### Step 2: Install All Dependencies
```bash
npm run install:all
```
*Or manually:*
```bash
# Install root, client, and server dependencies
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
*The server automatically seeds the initial benchmark quadcopter design and 3 comparison variants on first start.*

### Step 4: Start Development Servers
To run both the backend API (port 5000) and frontend client (port 3000) concurrently:
```bash
npm run dev
```

Or run them in separate terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Client (Port 3000)
npm run dev:client
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 6. Environment Configuration (`.env`)

A `.env.example` file is provided in both root and `server/`.

```env
# Server Port
PORT=5000

# Database Connection (SQLite default; can be changed to postgresql://...)
DATABASE_URL="file:./dev.db"

# AI Provider Configuration: "local" (default demo mode), "gemini", or "openai"
AI_PROVIDER=local

# Google Gemini API Key (Optional)
GEMINI_API_KEY=

# OpenAI API Key (Optional)
OPENAI_API_KEY=

# Client Port
VITE_PORT=3000
```

> **Demo Mode Notice:** When `AI_PROVIDER=local` or when API keys are absent, the application operates in **Demo Mode**. All CAD modifications, gesture tracking, voice recognition, rule validation, comparison presets, and 3D exports operate locally with zero cloud dependencies.

---

## 🚀 7. Interactive Feature Walkthrough

Follow these steps to explore GestureCAD Studio:

1. **Overview & Landing Page (`/`)**:
   - Scroll through the hero section. Observe the interactive rotating 3D quadcopter.
   - Click the step buttons in the **Live Interaction Simulation Walkthrough** (Stages 1 through 5).
   - Review the **Real-World Impact** section featuring the engineering blueprint light theme.

2. **Launch CAD Workspace (`/workspace`)**:
   - Click **"Launch Workspace"** in the top navigation.
   - The interactive 3D workstation loads with the default UAV Airframe (Wingspan: 400 mm, Arm Length: 180 mm).

3. **Interact with 3D Viewport Controls**:
   - Click **"Exploded View"** in the top-left toolbar: observe the drone components animate outwards along their normal axes.
   - Click **"Top View"** and **"Side View"** to inspect orthographic alignments.
   - Click **"3D View"** to return to perspective orbit.

4. **Test Hand Gesture Controls**:
   - In the bottom dock, select the **"Hand Gestures"** tab.
   - If a webcam is available, click **"Start Camera"** and allow permissions. Show your hand:
     - **Pinch**: Pinch thumb and index together to adjust wingspan.
     - **Open Palm**: Release your pinch.
   - If no webcam is available or in a hurry, click **"Demo Mode"**: watch the automated hand landmark simulator cycle through pointing, pinching, and parameter adjustments.

5. **Test Voice Command & AI Assistant**:
   - Switch to the **"AI Design Assistant"** tab.
   - Click the suggested prompt: *"Increase the wingspan to 40 centimetres."*
   - Watch the AI response update the wingspan slider to **400 mm** and proportionally adjust arm length.
   - Try typing or speaking: *"Suggest a more compact version for indoor use."*

6. **Review Design Comparison & Validation**:
   - Open the **"Design Comparison"** tab: compare **Design 1 (Standard)**, **Design 2 (Compact)**, and **Design 3 (Extended Arms)**. Click **"Apply Configuration"** on any card to update the 3D model.
   - Open the **"Validation"** tab: see all 5 engineering checks marked **Valid** with measured propeller clearance and center-of-gravity offsets.

7. **Export the 3D Model**:
   - Open the **"Export & 3D Print"** tab.
   - Click **"Download STL"** to receive the print-ready mesh.
   - Click **"Download GLB"** or **"Download JSON"** to export the specification and Bill of Materials.

---

## 📡 8. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, active AI provider, and Demo Mode status |
| `GET` | `/api/designs` | Retrieve all saved drone configurations |
| `POST` | `/api/designs` | Save a new drone design configuration with validation results |
| `GET` | `/api/designs/:id` | Fetch specific design by ID with variant history |
| `PUT` | `/api/designs/:id` | Update an existing design's parameters and components |
| `DELETE` | `/api/designs/:id` | Delete a design from the database |
| `POST` | `/api/designs/validate` | Execute rule-based aeronautical and collision checks |
| `POST` | `/api/designs/variants` | Generate alternative design configurations (Standard, Compact, Extended) |
| `POST` | `/api/ai/interpret` | Interpret natural language design command into structured parameters |
| `POST` | `/api/assistant/explain` | Return aerospace engineering explanation and specs for a component |

---

## ⌨️ 9. Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>E</kbd> | Toggle Exploded View |
| <kbd>T</kbd> | Switch to Top (Plan) View |
| <kbd>S</kbd> | Switch to Side (Elevation) View |
| <kbd>3</kbd> | Switch to 3D Perspective View |
| <kbd>R</kbd> | Reset CAD Parameters to Default (400 mm) |
| <kbd>C</kbd> | Toggle Webcam Tracking |

---

## 👥 10. Engineering & Architecture

Designed and engineered for next-generation spatial computing and autonomous drone development.

- **GestureCAD Core Team**
- **Architecture:** WebGL / Three.js · MediaPipe Tasks Vision · React 18 · TypeScript · Node.js · Prisma

