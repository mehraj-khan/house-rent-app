import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  toggleVerifyUser,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getAdminStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.put('/user/:id/verify', protect, isAdmin, toggleVerifyUser);
router.delete('/user/:id', protect, isAdmin, deleteUser);

export default router;