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

        // Add the viewed user to the current user's recentlyViewed list
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { recentlyViewed: userToView._id }
        });

        // Keep the list at a max of 15
        await User.findByIdAndUpdate(req.user._id, {
            $push: { recentlyViewed: { $each: [], $slice: -15 } }
        });

        res.render('view_profile_v2', {
            title: `${userToView.displayName}'s Profile`,
            layout: 'layouts/main_v2',
            user: req.user,
            profile: userToView
        });

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'There was an error viewing the profile.');
        res.redirect('/discover');
    }
};