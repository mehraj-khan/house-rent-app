import express from 'express';
import {
  addHouse,
  getAllHouses,
  getHouseById,
  getSimilarHouses,
  deleteHouse,
  getMyHouses,
  updateHouse,
  requestFreeVisit,
} from '../controllers/houseController.js';
import { protect, rateLimiter } from '../middleware/authMiddleware.js';

const router = express.Router();

const visitLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many visit requests. Please wait a few minutes.',
});

router.get('/', getAllHouses);
router.get('/owner/:ownerId', protect, getMyHouses);
router.get('/:id/similar', getSimilarHouses);
router.get('/:id', getHouseById);
router.post('/add', protect, addHouse);
router.post('/:id/request-visit', visitLimiter, requestFreeVisit);
router.put('/:id', protect, updateHouse);
router.delete('/:id', protect, deleteHouse);

export default router;