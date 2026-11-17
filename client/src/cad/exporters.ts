import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { DroneConfig, ComponentItem, ValidationReport } from '../types';

export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Creates a dedicated scene containing the procedural 3D drone meshes for clean export.
 */
function createExportableDroneScene(config: DroneConfig, components: ComponentItem[]): THREE.Scene {
  const scene = new THREE.Scene();
  const armLen = (config.armLength || 180) / 100;
  const bodyW = (config.bodyWidth || 120) / 100;
  const bodyL = (config.bodyLength || 120) / 100;
  const bodyH = (config.bodyHeight || 35) / 100;
  const motorD = (config.motorSize || 30) / 100;
  const propD = ((config.propellerSize || 7) * 25.4) / 100;

  const mat = new THREE.MeshStandardMaterial({ color: 0x223344 });

  // Center chassis
  const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.85, 0.04, bodyL * 0.85), mat);
  bottomPlate.position.y = -bodyH * 0.5;
  scene.add(bottomPlate);

  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.75, 0.04, bodyL * 0.75), mat);
  topPlate.position.y = bodyH * 0.5;
  scene.add(topPlate);

  // Arms and motors
  const armAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
  armAngles.forEach((angle) => {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const motorX = cosA * armLen;
    const motorZ = sinA * armLen;

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, armLen), mat);
    arm.position.set(motorX * 0.5, 0, motorZ * 0.5);
    arm.rotation.y = -angle + Math.PI / 2;
    scene.add(arm);

    const motorMount = new THREE.Mesh(new THREE.CylinderGeometry(motorD * 0.6, motorD * 0.6, 0.05, 16), mat);
    motorMount.position.set(motorX, -0.01, motorZ);
    scene.add(motorMount);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(motorD * 0.5, motorD * 0.5, 0.12, 16), mat);
    motor.position.set(motorX, 0.08, motorZ);
    scene.add(motor);

    const prop = new THREE.Mesh(new THREE.BoxGeometry(propD * 0.9, 0.01, 0.09), mat);
    prop.position.set(motorX, 0.2, motorZ);
    scene.add(prop);
  });

  return scene;
}

/**
 * Real STL Exporter for 3D Printing
 */
export function exportSTL(config: DroneConfig, components: ComponentItem[]) {
  const scene = createExportableDroneScene(config, components);
  const exporter = new STLExporter();
  const stlString = exporter.parse(scene, { binary: true });
  const blob = new Blob([stlString as unknown as BlobPart], { type: 'application/octet-stream' });
  downloadBlob(blob, `GestureCAD_Quadcopter_${config.wingspan}mm.stl`);
}

/**
 * Real GLTF/GLB Exporter for 3D CAD interchange
 */
export function exportGLB(config: DroneConfig, components: ComponentItem[]) {
  const scene = createExportableDroneScene(config, components);
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (gltf) => {
      const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
      downloadBlob(blob, `GestureCAD_Quadcopter_${config.wingspan}mm.glb`);
    },
    (error) => {
      console.error('An error happened during GLTF export:', error);
    },
    { binary: true }
  );
}

/**
 * Real JSON Design Configuration & Bill of Materials Export
 */
export function exportJSON(config: DroneConfig, components: ComponentItem[], validation?: ValidationReport | null) {
  const payload = {
    project: 'GestureCAD',
    application: 'Spatial CAD for Autonomous Drones',
    version: '1.0.0 Pro',
    exportedAt: new Date().toISOString(),
    droneConfiguration: config,
    billOfMaterials: components.map((c) => ({
      name: c.name,
      type: c.type,
      quantity: c.count,
      description: c.description,
      estimatedWeightGrams: c.weightGrams,
      visible: c.visible,
    })),
    designValidation: validation || null,
    notes: 'Designed via natural hand gestures and AI parametric assistance on GestureCAD.',
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `GestureCAD_DesignConfig_${config.wingspan}mm.json`);
}

/**
 * High-Resolution 4K Canvas Snapshot PNG Export
 */
export function exportCanvasSnapshot(filename = 'GestureCAD_Quadcopter_Render.png') {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, filename);
    }
  }, 'image/png');
}

/**
 * 2D DXF Vector File Export for CNC Carbon Fiber Milling & Laser Cutting
 */
export function exportDXF(config: DroneConfig) {
  const armLen = config.armLength || 180;
  const w = (config.bodyWidth || 120) * 0.5;
  const l = (config.bodyLength || 120) * 0.5;
  const motorHoleR = (config.motorSize || 30) * 0.35;

  const dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
ENTITIES
0
POLYLINE
8
CHASSIS_OUTLINE
66
1
70
1
0
VERTEX
8
CHASSIS_OUTLINE
10
-${w}
20
-${l}
30
0.0
0
VERTEX
8
CHASSIS_OUTLINE
10
${w}
20
-${l}
30
0.0
0
VERTEX
8
CHASSIS_OUTLINE
10
${w}
20
${l}
30
0.0
0
VERTEX
8
CHASSIS_OUTLINE
10
-${w}
20
${l}
30
0.0
0
SEQEND
${[Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].map((angle, idx) => {
  const mx = (Math.cos(angle) * armLen).toFixed(2);
  const my = (Math.sin(angle) * armLen).toFixed(2);
  return `0
CIRCLE
8
MOTOR_MOUNT_${idx + 1}
10
${mx}
20
${my}
30
0.0
40
${motorHoleR.toFixed(2)}`;
}).join('\n')}
0
ENDSEC
0
EOF
`;

  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  downloadBlob(blob, `GestureCAD_FrameOutline_${config.wingspan}mm.dxf`);
}

/**
 * Aerospace Bill of Materials CSV Spreadsheet
 */
export function exportBOM_CSV(config: DroneConfig, components: ComponentItem[]) {
  const headers = ['Component ID', 'Component Name', 'Subsystem', 'Quantity', 'Unit Weight (g)', 'Total Weight (g)', 'Status'];
  const rows = components.map((c) => [
    `"${c.id}"`,
    `"${c.name}"`,
    `"${c.type}"`,
    c.count,
    c.weightGrams,
    c.count * c.weightGrams,
    `"${c.visible ? 'Operational' : 'Disabled'}"`
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `GestureCAD_BOM_${config.wingspan}mm_${Date.now()}.csv`);
}
