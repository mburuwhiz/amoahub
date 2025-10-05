import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Broadcast from '../models/Broadcast.js';

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