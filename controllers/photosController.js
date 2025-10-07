import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Show the manage photos page
// @route   GET /photos/manage
export const getManagePhotosPage = (req, res) => {
    res.render('photos-manage', {
        title: 'Manage Your Photos',
        layout: false, // This view has its own full HTML structure
        user: req.user
    });
};

// @desc    Upload a new profile picture
// @route   POST /photos/upload-profile
export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error_msg', 'Please select a file to upload.');
            return res.redirect('/photos/manage');
        }

        const profileImage = {
            url: req.file.path,
            public_id: req.file.filename
        };

        await User.findByIdAndUpdate(req.user.id, { profileImage });

        req.flash('success_msg', 'Profile picture updated successfully.');
        res.redirect('/photos/manage');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/photos/manage');
    }
};

// @desc    Upload new gallery images
// @route   POST /photos/upload-gallery
export const uploadGalleryImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            req.flash('error_msg', 'Please select one or more files to upload.');
            return res.redirect('/photos/manage');
        }

        const newPhotos = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        await User.findByIdAndUpdate(req.user.id, {
            $push: { photos: { $each: newPhotos } }
        });

        req.flash('success_msg', 'Gallery photos added successfully.');
        res.redirect('/photos/manage');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/photos/manage');
    }
};

// @desc    Delete a photo (profile or gallery)
// @route   POST /photos/delete
export const deletePhoto = async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            req.flash('error_msg', 'Invalid request.');
            return res.redirect('/photos/manage');
        }

        // Remove from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Check if it was the profile picture and reset to default if so
        if (req.user.profileImage && req.user.profileImage.public_id === publicId) {
             await User.findByIdAndUpdate(req.user.id, {
                 profileImage: {
                     url: '/img/default-avatar.png',
                     public_id: null
                 }
             });
        } else {
            // Remove from user's gallery
            await User.findByIdAndUpdate(req.user.id, {
                $pull: { photos: { public_id: publicId } }
            });
        }

        req.flash('success_msg', 'Photo deleted successfully.');
        res.redirect('/photos/manage');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete photo.');
        res.redirect('/photos/manage');
    }
};