import { Request, Response } from 'express';
import { prisma } from '../services/db.js';
import { CreateDesignSchema, UpdateDesignSchema, DroneConfigSchema } from '../validators/designValidator.js';
import { validateDroneDesign } from '../services/validationEngine.js';
import { getAIProvider } from '../services/aiProvider.js';

export async function getDesigns(req: Request, res: Response) {
  try {
    const designs = await prisma.design.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { variants: true }
    });
    const parsed = designs.map((d) => ({
      ...d,
      configuration: JSON.parse(d.configuration),
      components: JSON.parse(d.components),
      validationResults: d.validationResults ? JSON.parse(d.validationResults) : null,
    }));
    return res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    console.error('Error fetching designs:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch designs' });
  }
}

export async function createDesign(req: Request, res: Response) {
  try {
    const validation = CreateDesignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.format() });
    }

    const { name, configuration, components } = validation.data;
    const validationResults = validateDroneDesign(configuration, components);

    const design = await prisma.design.create({
      data: {
        name,
        configuration: JSON.stringify(configuration),
        components: JSON.stringify(components),
        validationResults: JSON.stringify(validationResults)
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        ...design,
        configuration,
        components,
        validationResults
      }
    });
  } catch (error) {
    console.error('Error creating design:', error);
    return res.status(500).json({ success: false, message: 'Failed to create design' });
  }
}

export async function getDesignById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const design = await prisma.design.findUnique({
      where: { id },
      include: { variants: true, commands: true }
    });

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    return res.json({
      success: true,
      data: {
        ...design,
        configuration: JSON.parse(design.configuration),
        components: JSON.parse(design.components),
        validationResults: design.validationResults ? JSON.parse(design.validationResults) : null,
        variants: design.variants.map((v) => ({
          ...v,
          configuration: JSON.parse(v.configuration)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching design:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch design' });
  }
}

export async function updateDesign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validation = UpdateDesignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.format() });
    }

    const existing = await prisma.design.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    const prevConfig = JSON.parse(existing.configuration);
    const prevComponents = JSON.parse(existing.components);

    const newConfig = validation.data.configuration
      ? { ...prevConfig, ...validation.data.configuration }
      : prevConfig;
    const newComponents = validation.data.components || prevComponents;
    const newName = validation.data.name || existing.name;

    const validationResults = validateDroneDesign(newConfig, newComponents);

    const updated = await prisma.design.update({
      where: { id },
      data: {
        name: newName,
        configuration: JSON.stringify(newConfig),
        components: JSON.stringify(newComponents),
        validationResults: JSON.stringify(validationResults)
      }
    });

    return res.json({
      success: true,
      data: {
        ...updated,
        configuration: newConfig,
        components: newComponents,
        validationResults
      }
    });
  } catch (error) {
    console.error('Error updating design:', error);
    return res.status(500).json({ success: false, message: 'Failed to update design' });
  }
}

export async function deleteDesign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.design.delete({ where: { id } });
    return res.json({ success: true, message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error deleting design:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete design' });
  }
}

export async function validateDesignEndpoint(req: Request, res: Response) {
  try {
    const { configuration, components } = req.body;
    if (!configuration || !components) {
      return res.status(400).json({ success: false, message: 'Missing configuration or components' });
    }
    const report = validateDroneDesign(configuration, components);
    return res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error validating design:', error);
    return res.status(500).json({ success: false, message: 'Validation failed' });
  }
}

export async function getVariantsEndpoint(req: Request, res: Response) {
  try {
    const aiProvider = getAIProvider();
    const { configuration } = req.body;
    const baseConfig = configuration || {
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
    const variants = await aiProvider.generateVariants(baseConfig);
    return res.json({ success: true, data: variants });
  } catch (error) {
    console.error('Error generating variants:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate variants' });
  }
}

