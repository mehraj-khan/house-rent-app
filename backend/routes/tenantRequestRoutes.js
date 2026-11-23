import express from 'express';
import { 
  createTenantRequest, 
  getAllTenantRequests, 
  sendPropertyOffer 
} from '../controllers/tenantRequestController.js';

const router = express.Router();

router.post('/create', createTenantRequest);
router.get('/all', getAllTenantRequests);
router.post('/send-offer', sendPropertyOffer);

export default router;