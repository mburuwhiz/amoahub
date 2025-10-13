import express from 'express';
import { getLandingPage, getBannedPage, requestReview } from '../controllers/mainController.js';
import { getNotificationsPage } from '../controllers/usersController.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Landing page
// @route   GET /
router.get('/', getLandingPage);

// @desc    Banned user page
// @route   GET /banned
router.get('/banned', ensureAuth, getBannedPage);

// @desc    Handle review request from banned user
// @route   POST /request-review
router.post('/request-review', ensureAuth, requestReview);

// @desc    Notifications page
// @route   GET /notifications
router.get('/notifications', ensureAuth, getNotificationsPage);

export default router;