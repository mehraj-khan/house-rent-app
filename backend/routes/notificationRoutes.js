import express from 'express';
import {
  getUserNotifications,
  markAllNotificationsRead,
  markOneNotificationRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId', getUserNotifications);
router.put('/read-all/:userId', markAllNotificationsRead);
router.put('/read/:id', markOneNotificationRead);

export default router;