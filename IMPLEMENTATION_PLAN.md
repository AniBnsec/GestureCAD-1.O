# GestureCAD Studio - Production Implementation Architecture
**Platform:** GestureCAD Enterprise Spatial CAD Platform
**Tagline:** Design in the Air. Build in 3D. Autonomous Aerospace Engineering.

---

## 1. Architecture Overview

### Frontend (`client/`)
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS with custom aerospace theme (Deep Navy `#07111F`, Dark Background `#080D17`, Dark Blue `#10233B`, Electric Blue `#1677FF`, Neon Cyan `#00C8FF`, Bright Cyan `#39D5FF`, Accent Red `#F04444`, Light Background `#F3F7FC`, Blueprint Grey `#DCE5F0`)
- **Animation & Icons:** Framer Motion, Lucide React
- **Routing:** React Router v6
- **Global State:** Zustand (for CAD parameters, active selection, gesture states, voice status, AI assistant messages, comparison list, validation results)
- **3D Graphics Engine:** Three.js + React Three Fiber + @react-three/drei
  - Real parametric quadcopter: central body (unibody carbon-fiber style chassis), 4 arms with proper angle orientation, 4 motor mounts, 4 brushless motors, 4 dual/tri-blade propellers, top battery mount & pack, front FPV camera gimbal, flight controller board with status LEDs.
  - Interactive controls: OrbitControls, zoom, pan, camera view switcher (Perspective 3D, Top View, Side View, Exploded View).
  - Raycaster selection: Clicking or pointing at components highlights them with a blue holographic glow.
  - Drag & reposition: Manipulate arm length, wingspan, or offsets in real time.
  - Dimension indicators & grid: Measurement lines with mm labels, technical blueprint ground plane.
- **Computer Vision & Hand Tracking:**
  - `@mediapipe/tasks-vision` / MediaPipe HandLandmarker with Webcam API and overlay canvas.
  - Detects 21 hand landmarks.
  - Gestures implemented:
    - **Pinch** (index fingertip + thumb tip distance < threshold): Select component under fingertip raycast.
    - **Move pinched hand**: Translates/adjusts selected parameter/offset smoothly with exponential smoothing.
    - **Open palm**: Release selection.
    - **Pointing finger**: Highlight hovered component.
    - **Closed fist**: Confirm action / reset.
  - Calibration controls, sensitivity sliders, camera enable/disable toggle.
  - Guided demonstration / simulated gesture mode fallback when webcam is not accessible.
- **Voice Command Recognition:**
  - Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) with continuous listening option and audio feedback.
  - Voice commands:
    - "Increase wingspan to [X] millimetres/centimetres"
    - "Make drone compact / extended"
    - "Show exploded view / top view / side view / 3D view"
    - "Reset design"
    - "Validate design"
    - "Generate alternatives"
    - "Export STL / GLTF"
  - Fallback text input command bar for unsupported browsers or noisy environments.
  - Optional `SpeechSynthesis` spoken confirmation ("Wingspan adjusted to 400 mm").
- **AI Design Assistant:**
  - Clean chat card matching PPT design.
  - Sends query to backend `/api/ai/interpret` or parses locally via deterministic rules if offline or Demo Mode.
  - Returns structured parametric actions:
    ```json
    {
      "operation": "setParameter",
      "parameter": "wingspan",
      "value": 400,
      "unit": "mm",
      "explanation": "Updated wingspan to 400 mm with proportional arm spacing for flight stability."
    }
    ```
  - Suggested quick prompts ("Increase wingspan to 40 cm", "Suggest compact indoor version", "Explain flight controller").

### Backend (`server/`)
- **Runtime:** Node.js + Express.js + TypeScript
- **Validation:** Zod schemas
- **Database:** Prisma ORM with SQLite (`file:./dev.db`), architected to swap to PostgreSQL with minimal configuration change.
- **Models:**
  - `User`: id, name, email, createdAt
  - `Design`: id, name, configuration (JSON), components (JSON), validationResults (JSON), createdAt, updatedAt
  - `DesignVariant`: id, designId, variantName, configuration (JSON), createdAt
  - `CommandHistory`: id, designId, command, response (JSON), createdAt
- **AI Provider Abstraction:**
  - Interface `AIProvider` with implementations:
    - `GeminiProvider` (Google Gemini API using `GEMINI_API_KEY`)
    - `OpenAIProvider` (OpenAI API using `OPENAI_API_KEY`)
    - `LocalDeterministicProvider` (Demo Mode - offline regex & rule parser)
  - Configurable via `AI_PROVIDER=gemini|openai|local` in `.env`.
- **REST Endpoints:**
  - `GET /api/health`
  - `GET /api/designs`
  - `POST /api/designs`
  - `GET /api/designs/:id`
  - `PUT /api/designs/:id`
  - `DELETE /api/designs/:id`
  - `POST /api/ai/interpret`
  - `POST /api/designs/:id/validate`
  - `POST /api/designs/:id/variants`
  - `POST /api/assistant/explain`

---

## 2. Multi-Section Website Navigation & Structure

1. **Navigation Bar:**
   - GestureCAD Logo with futuristic blue holographic icon.
   - Links: Home, Problem & Solution, Workspace, Workflow, Comparison, Impact, Architecture.
   - Status indicators: AI Engine status (Live / Multi-Provider), Camera status, System Health.
   - "Launch Workspace" primary button.

2. **Section 1: Home / Hero:**
   - Tagline: "Design in the Air. Build in 3D."
   - Enterprise Badge: Autonomous Aerospace CAD Studio v2.4.
   - 3D Interactive Drone Preview with interactive orbit.
   - Visual hologram gesture interaction overlay.
   - 4 Core Capabilities: Hand Gestures, Voice Commands, 3D Modelling, Generative AI.
   - Action CTAs: "Launch Workspace", "Explore Features".

3. **Section 2: Problem & Solution:**
   - The Problem cards: Steep Learning Curve, Time Consuming, Hardware Dependent, Limited Accessibility ("Complex tools... Too many steps... Not for everyone...").
   - Our Solution: Webcam-powered, AI-assisted 3D design platform.
   - 4-Stage visual flow: 1. Input → 2. AI Interpretation → 3. Parametric CAD → 4. Output.

4. **Section 3: System Workflow & Live Interaction:**
   - 5-stage pipeline: Input Capture, Gesture & Voice Interpretation, AI Design Engine, 3D Visualisation, Output & Iterate.
   - Interactive step-by-step walkthrough demo simulating the live flow.

5. **Section 4: Main CAD Workspace (The Core Product Showcase):**
   - **Left Sidebar - Component Library:**
     - Tabs: Components & Assembly
     - Search filter
     - Components: Frame, Motor, Propeller, Battery, Camera, Flight Controller, GPS, VTX, Landing Skids
     - Add/remove component, toggle visibility, select and inspect
   - **Center - 3D Viewport:**
     - Parametric 3D Drone with real-time reactive geometry (Wingspan, Arm Length, Body Width, Motor Mounts, Propellers, Battery, Camera, GPS, VTX, Landing Gear)
     - Camera presets: 3D View, Exploded View, Top View, Side View, Front View, Reset Camera
     - Ground grid, technical blueprint plane
     - Gesture HUD overlay showing recognized gesture & landmark skeleton
   - **Right Sidebar - Parametric Controls:**
     - Sliders: Wingspan (250 - 600 mm), Arm Length (120 - 280 mm), Body Width (80 - 200 mm), Motor Size (20 - 45 mm), Propeller Size (4 - 10 inches)
     - Actions: Generate Alternatives, Save Design, Reset Design, Validate Design
   - **Lower Panels & Drawers:**
     - AI Design Assistant chat with voice toggle and suggested prompts
     - MediaPipe Webcam Gesture Controller drawer/dock with live video stream, landmark overlay, and demo toggle
     - Design Validation card with live checks (4 Motor Mounts, Structural Symmetry, No Collision, Dimension Constraints, Balanced Weight Distribution)
     - Real-Time Comparison tray (Standard, Compact, Extended Arms)
     - Export Hub (STL, GLTF/GLB, JSON config, Python CadQuery)

6. **Section 5: Real-World Impact & Future Scope (Light/Blueprint Theme):**
   - Light background `#F3F7FC` with engineering blueprint grid accents `#DCE5F0`.
   - Impact areas: Education & Learning, Faster Prototyping, Industry Applications, Sustainable Innovation.
   - Target Users: Students & Learners, Designers & Engineers, Startups & Innovators, Aerospace & Robotics Industry.
   - 4-Phase Roadmap: Phase 1 (Drones), Phase 2 (Broader Components), Phase 3 (AI Agent), Phase 4 (Platform).
   - "Why GestureCAD?" 5 key value propositions.

7. **Section 6: Engineering Team & Architecture:**
   - GestureCAD Core Engineering Team
   - System Architecture: Multi-Agent AI, MediaPipe CV, WebGL Three.js, Parametric Geometry Engine.

