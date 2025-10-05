import express from 'express';
import { getManagePhotosPage, uploadProfilePicture, uploadGalleryImages, deletePhoto } from '../controllers/photosController.js';
import { ensureAuth } from '../middleware/auth.js';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({ storage });
const router = express.Router();

// Protect all photo management routes
router.use(ensureAuth);

// @desc    Show the manage photos page
// @route   GET /manage
router.get('/manage', getManagePhotosPage);

// @desc    Upload a new profile picture
// @route   POST /upload-profile
router.post('/upload-profile', upload.single('profileImage'), uploadProfilePicture);

// @desc    Upload new gallery images
// @route   POST /upload-gallery
router.post('/upload-gallery', upload.array('galleryImages', 4), uploadGalleryImages);

// @desc    Delete a photo
// @route   POST /delete
router.post('/delete', deletePhoto);

export default router;