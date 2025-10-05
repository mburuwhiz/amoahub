import express from 'express';
import { getDisplayNamePage, postDisplayName, getStep1, postStep1, getStep2, postStep2, getStep3, postStep3 } from '../controllers/onboardingController.js';
import { ensureAuth } from '../middleware/auth.js';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({ storage });

const router = express.Router();

// All onboarding routes should be protected
router.use(ensureAuth);

// Display Name step for Google Signups
router.get('/display-name', getDisplayNamePage);
router.post('/display-name', postDisplayName);

// Step 1: Core Details
router.get('/step1', getStep1);
router.post('/step1', postStep1);

// Step 2: Photos
router.get('/step2', getStep2);
// Using multer to handle multipart/form-data for file uploads
router.post('/step2', upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 4 }]), postStep2);


// Step 3: Personality
router.get('/step3', getStep3);
router.post('/step3', postStep3);

export default router;