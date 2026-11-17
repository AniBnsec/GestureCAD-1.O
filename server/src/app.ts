import express from 'express';
import cors from 'cors';
import designRoutes from './routes/designRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { techRouter } from './routes/techRoutes.js';
import { prisma } from './services/db.js';
import { validateDroneDesign } from './services/validationEngine.js';

export const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/designs', designRoutes);
app.use('/api', aiRoutes);
app.use('/api', techRouter);

// Seed initial default design if database is empty
export async function seedInitialDesignIfEmpty() {
  try {
    const count = await prisma.design.count();
    if (count === 0) {
      console.log('Seeding initial GestureCAD quadcopter benchmark design...');
      const defaultConfig = {
        wingspan: 400,
        armLength: 180,
        bodyWidth: 120,
        bodyLength: 120,
        bodyHeight: 35,
        motorSize: 30,
        propellerSize: 7,
        armAngle: 45,
        armThickness: 12,
        material: 'Carbon Fiber'
      };

      const defaultComponents = [
        { id: 'c-frame', name: 'Carbon Fiber Frame', type: 'frame', visible: true, count: 1, description: '3K carbon unibody central bay with 4 symmetric arm beams', weightGrams: 260 },
        { id: 'c-motors', name: 'Brushless Motors (x4)', type: 'motor', visible: true, count: 4, description: '2207 2400KV high-torque brushless outrunners', weightGrams: 264 },
        { id: 'c-props', name: 'Tri-Blade Propellers (x4)', type: 'propeller', visible: true, count: 4, description: '7-inch polycarbonate aerodynamic propellers (2 CW, 2 CCW)', weightGrams: 98 },
        { id: 'c-battery', name: 'LiPo Battery Pack', type: 'battery', visible: true, count: 1, description: '4S 14.8V 2200mAh 100C discharge lithium-polymer battery', weightGrams: 220 },
        { id: 'c-camera', name: 'FPV HD Camera', type: 'camera', visible: true, count: 1, description: '1200TVL ultra low-latency FPV camera with vibration damping', weightGrams: 25 },
        { id: 'c-fc', name: 'Flight Controller Board', type: 'flight_controller', visible: true, count: 1, description: 'STM32F405 8kHz gyro processor with integrated OSD', weightGrams: 35 },
      ];

      const validation = validateDroneDesign(defaultConfig, defaultComponents as any);

      const design = await prisma.design.create({
        data: {
          name: 'Benchmark Standard Quadcopter',
          configuration: JSON.stringify(defaultConfig),
          components: JSON.stringify(defaultComponents),
          validationResults: JSON.stringify(validation)
        }
      });

      // Also create 3 standard design variants
      await prisma.designVariant.createMany({
        data: [
          {
            designId: design.id,
            variantName: 'Design 1 — Standard',
            configuration: JSON.stringify({ ...defaultConfig, wingspan: 400, armLength: 180 })
          },
          {
            designId: design.id,
            variantName: 'Design 2 — Compact',
            configuration: JSON.stringify({ ...defaultConfig, wingspan: 300, armLength: 135, bodyWidth: 95, motorSize: 24, propellerSize: 5 })
          },
          {
            designId: design.id,
            variantName: 'Design 3 — Extended Arms',
            configuration: JSON.stringify({ ...defaultConfig, wingspan: 450, armLength: 205, bodyWidth: 130, motorSize: 35, propellerSize: 8 })
          }
        ]
      });

      console.log('Default benchmark design seeded successfully:', design.id);
    }
  } catch (err) {
    console.error('Failed to seed initial design:', err);
  }
}

