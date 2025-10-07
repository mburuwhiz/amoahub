import User from '../models/User.js';
import Report from '../models/Report.js';

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

// @desc    Block a user
// @route   POST /users/:id/block
export const blockUser = async (req, res) => {
    try {
        const userIdToBlock = req.params.id;
        const currentUserId = req.user.id;

        // Add to current user's blocked list
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { blockedUsers: userIdToBlock }
        });

        // Optional: remove from likes/matches if they exist
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { likes: userIdToBlock, matches: userIdToBlock }
        });

        res.status(200).json({ success: true, message: 'User blocked.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// @desc    Report a user
// @route   POST /users/:id/report
export const reportUser = async (req, res) => {
    try {
        const reportedUserId = req.params.id;
        const reporterId = req.user.id;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ success: false, message: 'A reason is required to submit a report.' });
        }

        const report = new Report({
            reporter: reporterId,
            reportedUser: reportedUserId,
            reason: reason,
        });

        await report.save();

        res.status(201).json({ success: true, message: 'Report submitted successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};