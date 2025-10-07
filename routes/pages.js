import express from 'express';
import { getMatchesPage, getProfilePage, getEditProfilePage, postEditProfile, postChangePassword, deleteAccount, getNotificationsPage, getBroadcastPage } from '../controllers/pagesController.js';
import { ensureAuth, checkOnboarding } from '../middleware/auth.js';

const router = express.Router();

// Static pages
router.get('/privacy', (req, res) => {
    res.render('pages/privacy', { title: 'Privacy Policy', layout: 'layouts/main' });
});

router.get('/terms', (req, res) => {
    res.render('pages/terms', { title: 'Terms of Service', layout: 'layouts/main' });
});

// Protect all these pages
router.use(ensureAuth, checkOnboarding);

// @desc    Show Matches page
// @route   GET /matches
router.get('/matches', getMatchesPage);

// @desc    Show Profile page
// @route   GET /profile
router.get('/profile', getProfilePage);

// @desc    Show and handle Edit Profile page
// @route   GET, POST /profile/edit
router.get('/profile/edit', getEditProfilePage);
router.post('/profile/edit', postEditProfile);
router.post('/profile/change-password', postChangePassword);

// @desc    Delete user account
// @route   POST /profile/delete
router.post('/profile/delete', deleteAccount);

// @desc    Show Notifications page
// @route   GET /notifications
router.get('/notifications', getNotificationsPage);

// @desc    Show a single broadcast
// @route   GET /broadcasts/:id
router.get('/broadcasts/:id', getBroadcastPage);


export default router;