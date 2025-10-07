import User from '../models/User.js';

// @desc    Show display name page for Google users
// @route   GET /onboarding/display-name
export const getDisplayNamePage = (req, res) => {
  res.render('onboarding/display-name', {
    title: 'Choose Your Display Name',
    layout: false, // This view has its own full HTML structure
    user: req.user,
  });
};

// @desc    Process display name from Google users
// @route   POST /onboarding/display-name
export const postDisplayName = async (req, res) => {
  try {
    const { displayName } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, { displayName });

    res.redirect('/onboarding/step1');
  } catch (err) {
    console.error(err);
    res.redirect('/onboarding/display-name');
  }
};


// @desc    Show onboarding step 1 (Core Details)
// @route   GET /onboarding/step1
export const getStep1 = (req, res) => {
  res.render('onboarding/step1', {
    title: 'Step 1: Your Details',
    layout: 'layouts/main',
    user: req.user,
  });
};

// @desc    Process onboarding step 1
// @route   POST /onboarding/step1
export const postStep1 = async (req, res) => {
  try {
    const { dob, gender, location, interestedIn, ageMin, ageMax } = req.body;
    const userId = req.user.id;

    // Age verification
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const m = new Date().getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18) {
      // Mark account as banned and log out
      await User.findByIdAndUpdate(userId, { status: 'banned' });
      req.logout((err) => {
        if (err) return next(err);
        // Optional: Add a flash message explaining why
        res.redirect('/age-restriction'); // A dedicated page explaining the rule
      });
      return;
    }

    // Update user
    await User.findByIdAndUpdate(userId, {
      dob: birthDate,
      age: age,
      gender: gender,
      location: location,
      'preferences.gender': interestedIn,
      'preferences.ageRange.min': ageMin,
      'preferences.ageRange.max': ageMax,
    });

    res.redirect('/onboarding/step2');
  } catch (err) {
    console.error(err);
    res.redirect('/onboarding/step1'); // Or render with an error
  }
};

// @desc    Show onboarding step 2 (Photos)
// @route   GET /onboarding/step2
export const getStep2 = (req, res) => {
    res.render('onboarding/step2', {
        title: 'Step 2: Upload Photos',
        layout: 'layouts/main',
        user: req.user
    });
};

// @desc    Process onboarding step 2
// @route   POST /onboarding/step2
export const postStep2 = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validation for number of photos
        if (!req.files || !req.files.profileImage || req.files.profileImage.length < 1) {
            req.flash('error_msg', 'A profile picture is required.');
            return res.redirect('/onboarding/step2');
        }
        if (!req.files.galleryImages || req.files.galleryImages.length < 2) {
            req.flash('error_msg', 'Please upload at least two photos to your gallery.');
            return res.redirect('/onboarding/step2');
        }

        const updates = {};

        // Format profile picture data
        updates.profileImage = {
            url: req.files.profileImage[0].path,
            public_id: req.files.profileImage[0].filename
        };

        // Format gallery photos data, assuming model field is 'photos'
        updates.photos = req.files.galleryImages.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        await User.findByIdAndUpdate(userId, updates);

        res.redirect('/onboarding/step3');
    } catch (err) {
        console.error('Onboarding step 2 error:', err);
        req.flash('error_msg', 'There was an error uploading your photos. Please try again.');
        res.redirect('/onboarding/step2');
    }
};


// @desc    Show onboarding step 3 (Personality)
// @route   GET /onboarding/step3
export const getStep3 = (req, res) => {
    res.render('onboarding/step3', {
        title: 'Step 3: Your Personality',
        layout: 'layouts/main',
        user: req.user
    });
};

// @desc    Process onboarding step 3
// @route   POST /onboarding/step3
export const postStep3 = async (req, res) => {
  try {
    const { work, bio, interests } = req.body;
    const userId = req.user.id;

    // Convert interests string to array
    const interestsArray = interests.split(',').map(item => item.trim()).filter(item => item);

    await User.findByIdAndUpdate(userId, {
      work: work,
      bio: bio,
      interests: interestsArray,
      onboardingComplete: true, // Mark as complete!
    });

    res.redirect('/discover'); // Onboarding finished, to the main app!
  } catch (err) {
    console.error(err);
    res.redirect('/onboarding/step3');
  }
};