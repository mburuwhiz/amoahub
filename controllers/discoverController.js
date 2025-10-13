import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Show new discover page with recently viewed and potential matches
// @route   GET /discover
export const getDiscoverPage = async (req, res) => {
    try {
        // 1. Fetch current user with populated recentlyViewed list
        const currentUser = await User.findById(req.user._id)
            .populate({
                path: 'recentlyViewed',
                options: { sort: { createdAt: -1 } }
            })
            .lean();

        // 2. Define users to exclude from the "All People" list (only self, disliked, and blocked)
        const excludedUsers = [
            currentUser._id,
            ...currentUser.dislikes,
            ...currentUser.blockedUsers,
        ];

        // 3. Build the query for "All People" based on user's preferences
        const query = {
            _id: { $nin: excludedUsers },
            status: 'active',
            role: 'user',
            age: {
                $gte: currentUser.preferences.ageRange.min,
                $lte: currentUser.preferences.ageRange.max
            },
        };

        // Handle gender preference
        if (!currentUser.preferences.gender.includes('Everyone')) {
            query.gender = { $in: currentUser.preferences.gender };
        }

        // 4. Fetch all people matching the criteria
        const allPeople = await User.find(query).lean();

        // 5. Render the page with the full recentlyViewed list
        res.render('discover_v2', {
            title: 'Discover People',
            user: currentUser,
            recentlyViewed: currentUser.recentlyViewed,
            allPeople,
        });

    } catch (err) {
        console.error('Error getting discover page:', err);
        req.flash('error_msg', 'Could not load the discover page.');
        res.redirect('/');
    }
};

// @desc    Like a user
// @route   POST /discover/like/:id
export const likeUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const targetUserId = req.params.id;

        // Add to current user's likes
        await User.findByIdAndUpdate(currentUser._id, { $addToSet: { likes: targetUserId } });

        // Check for a mutual match
        const targetUser = await User.findById(targetUserId);
        // Use .equals() for reliable ObjectId comparison
        if (targetUser.likes.some(id => id.equals(currentUser._id))) {
            // It's a match!
            await User.findByIdAndUpdate(currentUser._id, { $addToSet: { matches: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $addToSet: { matches: currentUser._id } });

            // It's a match! Create notifications for both users.
            const notificationForCurrentUser = {
                recipient: currentUser._id,
                sender: targetUser._id,
                type: 'new_match',
                message: `You matched with ${targetUser.displayName}!`,
                link: `/users/${targetUser._id}`
            };
            const notificationForTargetUser = {
                recipient: targetUser._id,
                sender: currentUser._id,
                type: 'new_match',
                message: `You matched with ${currentUser.displayName}!`,
                link: `/users/${currentUser._id}`
            };

            await Notification.create(notificationForCurrentUser);
            await Notification.create(notificationForTargetUser);

            // Emit real-time notifications
            const io = req.app.get('io');
            io.to(currentUser._id.toString()).emit('new_notification', notificationForCurrentUser);
            io.to(targetUser._id.toString()).emit('new_notification', notificationForTargetUser);

            return res.json({
                match: true,
                targetUser: {
                    _id: targetUser._id,
                    displayName: targetUser.displayName,
                    profileImage: { url: targetUser.profileImage.url }
                }
            });
        }

        res.json({ match: false });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Dislike a user
// @route   POST /discover/dislike/:id
export const dislikeUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const targetUserId = req.params.id;

        // Add to current user's dislikes
        await User.findByIdAndUpdate(currentUser._id, { $addToSet: { dislikes: targetUserId } });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};