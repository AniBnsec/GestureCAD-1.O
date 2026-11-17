import { Router } from 'express';
import {
  getDesigns,
  createDesign,
  getDesignById,
  updateDesign,
  deleteDesign,
  validateDesignEndpoint,
  getVariantsEndpoint
} from '../controllers/designController.js';

const router = Router();

router.get('/', getDesigns);
router.post('/', createDesign);
router.get('/:id', getDesignById);
router.put('/:id', updateDesign);
router.delete('/:id', deleteDesign);
router.post('/validate', validateDesignEndpoint);
router.post('/variants', getVariantsEndpoint);

export default router;

