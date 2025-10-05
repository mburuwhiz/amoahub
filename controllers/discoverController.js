import User from '../models/User.js';

// @desc    Show discovery page with potential matches
// @route   GET /discover
export const getDiscoverPage = async (req, res) => {
  try {
    const currentUser = req.user;

    // Users I've already interacted with or are blocked
    const excludedUsers = [
      ...currentUser.likes,
      ...currentUser.dislikes,
      ...currentUser.blockedUsers,
      currentUser._id, // Exclude myself
    ];

    // Build the query
    const query = {
      _id: { $nin: excludedUsers }, // Not in the excluded list
      status: 'active', // Must be an active user
      role: 'user', // Must not be an admin
      // onboardingComplete: true, // Temporarily disabled for testing
      // 'preferences.ageRange.min': { $lte: currentUser.age }, // Temporarily disabled for testing
      // 'preferences.ageRange.max': { $gte: currentUser.age }, // Temporarily disabled for testing
      // 'preferences.gender': { $in: [currentUser.gender, 'Everyone'] }, // Temporarily disabled for testing
      age: {
        $gte: currentUser.preferences.ageRange.min,
        $lte: currentUser.preferences.ageRange.max,
      }, // Their age is within my preference range
      gender: { $in: currentUser.preferences.gender }, // Their gender is one I'm interested in
    };

    // Handle 'Everyone' preference for the current user
    if (currentUser.preferences.gender.includes('Everyone')) {
        // If I'm interested in everyone, remove the specific gender filter
        delete query.gender;
    }


    const potentialMatches = await User.find(query).limit(20).lean();

    res.render('discover', {
      title: 'Discover Matches',
      layout: 'layouts/main_app', // A new layout for the core app experience
      user: currentUser,
      potentialMatches,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
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