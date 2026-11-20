import express from 'express';
import {
  createRequirement,
  getAllRequirements,
  deleteRequirement,
} from '../controllers/requirementController.js';

const router = express.Router();

router.post('/add', createRequirement);
router.get('/', getAllRequirements);
router.delete('/:id', deleteRequirement);

export default router;