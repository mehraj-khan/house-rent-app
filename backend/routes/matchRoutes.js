import express from 'express';
import {
  getMatchesForHouse,
  getMatchesForRequirement,
} from '../controllers/matchController.js';

const router = express.Router();

router.get('/for-house/:houseId', getMatchesForHouse);
router.get('/for-requirement/:requirementId', getMatchesForRequirement);

export default router;