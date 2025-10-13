import express from 'express';
import { getBroadcastMessage } from '../controllers/broadcastController.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

// All broadcast routes are protected by ensureAuth
router.use(ensureAuth);

// @desc    Get a single broadcast message
// @route   GET /broadcasts/:id
router.get('/:id', getBroadcastMessage);

export default router;