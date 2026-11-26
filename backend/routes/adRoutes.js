import express from 'express';
import {
  createAd,
  getActiveAds,
  trackAdClick,
  trackAdView,
  getMyAds,
  getAllAdsAdmin,
  updateAdStatus,
  deleteAd,
} from '../controllers/adController.js';

const router = express.Router();

router.post('/create', createAd);
router.get('/active', getActiveAds);
router.post('/:id/click', trackAdClick);
router.post('/:id/view', trackAdView);
router.get('/user/:userId', getMyAds);
router.get('/admin/all', getAllAdsAdmin);
router.put('/admin/:id/status', updateAdStatus);
router.delete('/admin/:id', deleteAd);

export default router;