import User from '../models/User.js';

// @desc    View another user's profile
// @route   GET /users/:id
export const viewUserProfile = async (req, res) => {
    try {
        const userToView = await User.findById(req.params.id).lean();

        if (!userToView) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/discover');
        }

        // Redirect to their own profile page if they try to view themselves here
        if (userToView._id.toString() === req.user._id.toString()) {
            return res.redirect('/profile');
        }

        res.render('view_profile', {
            title: `${userToView.displayName}'s Profile`,
            layout: 'layouts/main_app',
            user: req.user, // The logged-in user (for the header, etc.)
            profile: userToView // The data of the user being viewed
        });

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'There was an error viewing the profile.');
        res.redirect('/discover');
    }
};