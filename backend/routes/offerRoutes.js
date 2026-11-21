import express from 'express';
import {
  createOffer,
  getUserOffers,
  respondToOffer,
  markOfferBooked,
} from '../controllers/offerController.js';

const router = express.Router();

router.post('/create', createOffer);
router.get('/user/:userId', getUserOffers);
router.put('/:id/respond', respondToOffer);
router.put('/:id/booked', markOfferBooked);

export default router;