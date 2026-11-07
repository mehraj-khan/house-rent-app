import express from 'express';
import { addReview, getHouseReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/add', addReview);
router.get('/:houseId', getHouseReviews);

export default router;