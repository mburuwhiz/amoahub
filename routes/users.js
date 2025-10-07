import express from 'express';
import { viewUserProfile } from '../controllers/usersController.js';
import { ensureAuth, checkOnboarding } from '../middleware/auth.js';

const router = express.Router();

// Protect all user routes
router.use(ensureAuth, checkOnboarding);

// @desc    View a specific user's profile
// @route   GET /:id
router.get('/:id', viewUserProfile);

import { blockUser, reportUser } from '../controllers/usersController.js';

// @desc    Block a user
// @route   POST /:id/block
router.post('/:id/block', blockUser);

// @desc    Report a user
// @route   POST /:id/report
router.post('/:id/report', reportUser);

export default router;