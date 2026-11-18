import express from 'express';
import { sendMessage, getMessages, getUserConversations } from '../controllers/chatController.js';

const router = express.Router();

router.post('/send', sendMessage);
router.get('/history/:houseId/:user1/:user2', getMessages);
router.get('/conversations/:userId', getUserConversations);

export default router;