import { z } from 'zod';

export const DroneConfigSchema = z.object({
  wingspan: z.number().min(200).max(800),
  armLength: z.number().min(80).max(400),
  bodyWidth: z.number().min(50).max(300),
  bodyLength: z.number().min(50).max(300),
  bodyHeight: z.number().min(15).max(100),
  motorSize: z.number().min(15).max(60),
  propellerSize: z.number().min(3).max(15),
  armAngle: z.number().min(20).max(70).default(45),
  armThickness: z.number().min(4).max(30).default(12),
  material: z.string().default('Carbon Fiber')
});

export const ComponentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['frame', 'motor', 'propeller', 'battery', 'camera', 'flight_controller']),
  visible: z.boolean(),
  selected: z.boolean().optional(),
  count: z.number().min(1),
  description: z.string(),
  weightGrams: z.number()
});

export const CreateDesignSchema = z.object({
  name: z.string().min(1).max(100),
  configuration: DroneConfigSchema,
  components: z.array(ComponentItemSchema),
});

export const UpdateDesignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  configuration: DroneConfigSchema.partial().optional(),
  components: z.array(ComponentItemSchema).optional(),
});

export const AIInterpretSchema = z.object({
  command: z.string().min(1).max(500),
  currentConfig: DroneConfigSchema,
});

export const AIExplainSchema = z.object({
  componentName: z.string().min(1).max(100),
});

