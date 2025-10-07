import User from '../models/User.js';

// @desc    Show new discover page with recently viewed and all people
// @route   GET /discover
export const getDiscoverPage = async (req, res) => {
    try {
        // 1. Fetch recently viewed users
        const currentUser = await User.findById(req.user._id)
            .populate({
                path: 'recentlyViewed',
                options: { sort: { createdAt: -1 } } // Sort by most recently added
            })
            .lean();

        // 2. Handle filters for "All People"
        const filters = {
            gender: req.query.gender || 'Everyone',
            minAge: req.query.minAge || 18,
            maxAge: req.query.maxAge || 99,
        };

        // 3. Build the query for "All People"
        const query = {
            _id: { $ne: currentUser._id }, // Exclude self
            status: 'active',
            role: 'user',
            age: { $gte: filters.minAge, $lte: filters.maxAge },
        };

        if (filters.gender !== 'Everyone') {
            query.gender = filters.gender;
        }

        // 4. Fetch all people based on filters
        const allPeople = await User.find(query).lean();

        res.render('discover_v2', {
            title: 'Discover People',
            layout: 'layouts/main_v2',
            user: currentUser,
            recentlyViewed: currentUser.recentlyViewed,
            allPeople,
            filters,
        });
    } catch (err) {
        console.error('Error getting discover page:', err);
        req.flash('error_msg', 'Could not load the discover page.');
        res.redirect('/'); // Redirect to a safe page on error
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
                    profileImage: targetUser.profileImage
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