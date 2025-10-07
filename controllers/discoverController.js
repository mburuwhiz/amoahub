import User from '../models/User.js';

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

        // 2. Define users to exclude from matching
        const excludedUsers = [
            currentUser._id,
            ...currentUser.likes,
            ...currentUser.dislikes,
            ...currentUser.blockedUsers,
            ...currentUser.recentlyViewed.map(u => u._id)
        ];

        // 3. Build the query for potential matches based on user's preferences
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

        // 5. Filter recently viewed to exclude liked users
        const likedUserIds = new Set(currentUser.likes.map(id => id.toString()));
        const filteredRecentlyViewed = currentUser.recentlyViewed.filter(
            user => !likedUserIds.has(user._id.toString())
        );

        // 6. Render the page
        res.render('discover_v2', {
            title: 'Discover People',
            user: currentUser,
            recentlyViewed: filteredRecentlyViewed,
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

            // In a real app, you'd send a real-time notification here via Socket.IO
            console.log(`It's a match between ${currentUser.displayName} and ${targetUser.displayName}!`);

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