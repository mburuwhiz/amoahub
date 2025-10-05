import express from 'express';
import { viewUserProfile } from '../controllers/usersController.js';
import { ensureAuth, checkOnboarding } from '../middleware/auth.js';

const router = express.Router();

// Protect all user routes
router.use(ensureAuth, checkOnboarding);

// @desc    View a specific user's profile
// @route   GET /:id
router.get('/:id', viewUserProfile);

export default router;