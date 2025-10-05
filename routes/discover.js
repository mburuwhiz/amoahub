import express from 'express';
import { getDiscoverPage, likeUser, dislikeUser } from '../controllers/discoverController.js';
import { ensureAuth, checkOnboarding } from '../middleware/auth.js';

const router = express.Router();

// Protect all discover routes
router.use(ensureAuth, checkOnboarding);

// @desc    Show discovery page
// @route   GET /
router.get('/', getDiscoverPage);

// @desc    Like a user
// @route   POST /like/:id
router.post('/like/:id', likeUser);

// @desc    Dislike a user
// @route   POST /dislike/:id
router.post('/dislike/:id', dislikeUser);

export default router;