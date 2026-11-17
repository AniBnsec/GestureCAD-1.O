import { Router } from 'express';
import { interpretAI, explainComponent, healthCheck } from '../controllers/aiController.js';

const router = Router();

router.get('/health', healthCheck);
router.post('/ai/interpret', interpretAI);
router.post('/assistant/explain', explainComponent);

export default router;

