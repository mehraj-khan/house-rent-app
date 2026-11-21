import express from 'express';
import { smartSearch, generateDescription } from '../controllers/aiController.js';

const router = express.Router();

router.post('/smart-search', smartSearch);
router.post('/generate-description', generateDescription);

export default router;