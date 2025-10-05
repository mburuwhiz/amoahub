import express from 'express';
import { getChatsPage, uploadChatImage } from '../controllers/chatController.js';
import { ensureAuth, checkOnboarding } from '../middleware/auth.js';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({ storage });
const router = express.Router();

// Protect all chat routes
router.use(ensureAuth, checkOnboarding);

// @desc    Get main chats page (list of conversations)
// @route   GET /
router.get('/', getChatsPage);

// @desc    Get a specific chat page
// @route   GET /:userId
router.get('/:userId', getChatsPage);

// @desc    Handle image upload in chat
// @route   POST /upload-image
router.post('/upload-image', upload.single('chatImage'), uploadChatImage);

export default router;