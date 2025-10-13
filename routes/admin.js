import express from 'express';
import { getDashboard, toggleUserStatus, postBroadcast, dismissReport, toggleUserVerify, deleteUser, getBroadcastPage } from '../controllers/adminController.js';
import { ensureAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

// All admin routes are protected by ensureAuth and isAdmin middleware
router.use(ensureAuth, isAdmin);

// @desc    Admin Dashboard
// @route   GET /dashboard
router.get('/dashboard', getDashboard);

// @desc    Toggle a user's status (ban/unban)
// @route   POST /users/:id/toggle-status
router.post('/users/:id/toggle-status', toggleUserStatus);

// @desc    Show broadcast page
// @route   GET /broadcast
router.get('/broadcast', getBroadcastPage);

// @desc    Broadcast a message
// @route   POST /broadcast
router.post('/broadcast', postBroadcast);

// @desc    Dismiss a user report
// @route   POST /reports/:id/dismiss
router.post('/reports/:id/dismiss', dismissReport);

// @desc    Toggle a user's verification status
// @route   POST /users/:id/toggle-verify
router.post('/users/:id/toggle-verify', toggleUserVerify);

// @desc    Delete a user
// @route   POST /users/:id/delete
router.post('/users/:id/delete', deleteUser);

export default router;