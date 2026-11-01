import express from 'express';
import { getAdminStats, getAllUsers, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/user/:id', deleteUser);

export default router;