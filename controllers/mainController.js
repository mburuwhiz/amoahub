import Report from '../models/Report.js';

// @desc    Show the landing page
// @route   GET /
export const getLandingPage = (req, res) => {
    res.render('landing_v3', {
        title: 'Welcome to Amora Hub',
        layout: 'layouts/main'
    });
};

// @desc    Show the banned page
// @route   GET /banned
export const getBannedPage = (req, res) => {
    // Ensure only banned users can see this page
    if (req.user.status !== 'banned') {
        return res.redirect('/discover');
    }
    res.render('banned', {
        title: 'Account Suspended',
        layout: false // This view has its own full HTML structure
    });
};

// @desc    Handle a review request from a banned user
// @route   POST /request-review
export const requestReview = async (req, res) => {
    try {
        const user = req.user;

        // Check if a review request already exists to prevent spam
        const existingReport = await Report.findOne({ reporter: user._id, reason: 'Review requested for banned account.' });
        if (existingReport) {
            req.flash('error_msg', 'You have already submitted a review request.');
            return res.redirect('/banned');
        }

        const report = new Report({
            reporter: user._id,
            reportedUser: user._id, // Reporting themselves for review
            reason: 'Review requested for banned account.',
            status: 'pending'
        });
        await report.save();

        req.flash('success_msg', 'Your review request has been sent to the admin team.');
        res.redirect('/banned');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again later.');
        res.redirect('/banned');
    }
};