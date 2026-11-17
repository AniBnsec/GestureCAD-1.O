import { Request, Response } from 'express';
import { getAIProvider } from '../services/aiProvider.js';
import { AIInterpretSchema, AIExplainSchema } from '../validators/designValidator.js';
import { prisma } from '../services/db.js';
import { config } from '../config/index.js';

export async function interpretAI(req: Request, res: Response) {
  try {
    const parsed = AIInterpretSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.format() });
    }

    const { command, currentConfig } = parsed.data;
    const { designId } = req.body;
    const aiProvider = getAIProvider();

    const result = await aiProvider.interpretCommand(command, currentConfig);

    // Save to command history if designId provided
    if (designId) {
      try {
        await prisma.commandHistory.create({
          data: {
            designId,
            command,
            response: JSON.stringify(result)
          }
        });
      } catch (e) {
        // Log and continue even if history record fails
        console.warn('Failed to record command history:', e);
      }
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error interpreting AI command:', error);
    return res.status(500).json({ success: false, message: 'AI interpretation failed' });
  }
}

export async function explainComponent(req: Request, res: Response) {
  try {
    const parsed = AIExplainSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.format() });
    }

    const { componentName } = parsed.data;
    const aiProvider = getAIProvider();
    const explanation = await aiProvider.explainComponent(componentName);

    return res.json({ success: true, data: explanation });
  } catch (error) {
    console.error('Error explaining component:', error);
    return res.status(500).json({ success: false, message: 'Component explanation failed' });
  }
}

export async function healthCheck(req: Request, res: Response) {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GestureCAD Backend API',
    version: '1.0.0 Pro',
    aiProvider: config.aiProvider,
    mode: config.aiProvider === 'local' ? 'Local Deterministic NLP Engine' : `${config.aiProvider.toUpperCase()} Cloud AI Engine`,
  });
}

