import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Broadcast from '../models/Broadcast.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Report from '../models/Report.js';
import sendEmail from '../utils/sendEmail.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Show the matches page
// @route   GET /matches
export const getMatchesPage = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate('matches').lean();
    res.render('matches', {
      title: 'Your Matches',
      layout: 'layouts/main_app',
      user: currentUser,
      matches: currentUser.matches,
    });
  } catch (err) {
    console.error(err);
    res.redirect('/discover');
  }
};

// @desc    Delete user account and all associated data
// @route   POST /profile/delete
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/profile/edit');
    }

    // --- Data Deletion ---

    // 1. Delete user's photos from Cloudinary
    if (user.photos && user.photos.length > 0) {
      const publicIds = user.photos.map(photo => photo.public_id).filter(id => id);
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }
    if (user.profileImage && user.profileImage.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    // 2. Delete user's messages
    await Message.deleteMany({ sender: userId });

    // 3. Delete user's conversations
    await Conversation.deleteMany({ participants: userId });

    // 4. Delete user's reports (both made by and against them)
    await Report.deleteMany({ $or: [{ reporter: userId }, { reportedUser: userId }] });

    // 5. Delete user's notifications
    await Notification.deleteMany({ user: userId });

    // 6. Delete the user document itself
    const deletedUserEmail = user.email;
    const deletedUserDisplayName = user.displayName;
    await User.findByIdAndDelete(userId);

    // --- Final Steps ---

    // 7. Send confirmation email
    try {
      await sendEmail({
        to: deletedUserEmail,
        subject: 'Your Amora Hub Account Has Been Deleted',
        template: 'accountDeleted',
        data: {
          name: deletedUserDisplayName,
        },
      });
    } catch (emailErr) {
      console.error('Failed to send account deletion email:', emailErr);
    }

    // 8. Logout and redirect
    req.logout((err) => {
      if (err) {
        console.error('Logout error after account deletion:', err);
        return res.redirect('/');
      }
      req.flash('success_msg', 'Your account has been permanently deleted.');
      res.redirect('/');
    });

  } catch (err) {
    console.error('Error during account deletion:', err);
    req.flash('error_msg', 'Something went wrong while deleting your account. Please contact support.');
    res.redirect('/profile/edit');
  }
};

// @desc    Show a single broadcast message
// @route   GET /broadcasts/:id
export const getBroadcastPage = async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id).populate('admin', 'displayName').lean();

    if (!broadcast) {
      req.flash('error_msg', 'Broadcast not found.');
      return res.redirect('/notifications');
    }

    res.render('broadcast', {
      title: 'Announcement',
      layout: 'layouts/main_app',
      user: req.user,
      broadcast,
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not load broadcast.');
    res.redirect('/notifications');
  }
};

// @desc    Show the profile page
// @route   GET /profile
export const getProfilePage = (req, res) => {
  res.render('profile', {
    title: 'Your Profile',
    layout: 'layouts/main_app',
    user: req.user,
  });
};

// @desc    Show the edit profile page
// @route   GET /profile/edit
export const getEditProfilePage = (req, res) => {
  res.render('profile-edit', {
    title: 'Edit Your Profile',
    layout: false, // This view has its own full HTML structure
    user: req.user,
  });
};

// @desc    Update user profile
// @route   POST /profile/edit
export const postEditProfile = async (req, res) => {
  try {
    const {
      displayName,
      location,
      work,
      bio,
      interests,
      interestedIn,
      ageMin,
      ageMax
    } = req.body;

    const interestsArray = interests.split(',').map(item => item.trim()).filter(item => item);

    await User.findByIdAndUpdate(
      req.user.id,
      {
        displayName,
        location,
        work,
        bio,
        interests: interestsArray,
        'preferences.gender': interestedIn,
        'preferences.ageRange.min': ageMin,
        'preferences.ageRange.max': ageMax,
      },
      { new: true, runValidators: true }
    );

    req.flash('success_msg', 'Your profile has been updated successfully.');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    res.redirect('/profile/edit');
  }
};

// @desc    Handle password change from profile
// @route   POST /profile/change-password
export const postChangePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user.id;

        // 1. Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            req.flash('error_msg', 'New passwords do not match.');
            return res.redirect('/profile/edit');
        }

        const user = await User.findById(userId);

        // 2. Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            req.flash('error_msg', 'Your current password is incorrect.');
            return res.redirect('/profile/edit');
        }

        // 3. Set new password and save
        user.password = newPassword;
        await user.save();

        req.flash('success_msg', 'Your password has been updated successfully.');
        res.redirect('/profile');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred while changing your password.');
        res.redirect('/profile/edit');
    }
};

// @desc    Show notifications page
// @route   GET /notifications
export const getNotificationsPage = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Mark all as read when the user visits the page
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });

    res.render('notifications', {
      title: 'Your Notifications',
      layout: 'layouts/main_app',
      user: req.user,
      notifications,
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not load notifications.');
    res.redirect('/discover');
  }
};