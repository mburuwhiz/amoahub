import User from '../models/User.js';
import Report from '../models/Report.js';
import Broadcast from '../models/Broadcast.js';
import Notification from '../models/Notification.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Admin Dashboard
// @route   GET /admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    // Fetch all non-admin users and reports in parallel for efficiency
    const [users, reports] = await Promise.all([
      User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).lean(),
      Report.find({ status: 'pending' }).populate('reporter reportedUser', 'displayName email').lean()
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      layout: 'layouts/admin', // A separate layout for the admin panel
      user: req.user,
      users: users,
      reports: reports,
    });
  } catch (err) {
    console.error(err);
    // res.render('error/500');
  }
};

// @desc    Toggle a user's status (ban/unban)
// @route   POST /admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.status = user.status === 'active' ? 'banned' : 'active';
            await user.save();

            const subject = user.status === 'banned' ? 'Your Account Has Been Banned' : 'Your Account Has Been Reinstated';
            const template = user.status === 'banned' ? 'userBanned' : 'userUnbanned';

            try {
                await sendEmail({
                    to: user.email,
                    subject: subject,
                    template: template,
                    data: {
                        name: user.displayName,
                    },
                });
            } catch (emailErr) {
                console.error(`Failed to send user ${user.status} email:`, emailErr);
            }
            req.flash('success_msg', `User has been ${user.status}.`);
        }
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating user status.');
        res.redirect('/admin/dashboard');
    }
};

// @desc    Delete a user by admin
// @route   POST /admin/users/:id/delete
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/admin/dashboard');
        }

        // Prevent deleting other admins
        if (user.role === 'admin') {
            req.flash('error_msg', 'Admins cannot be deleted.');
            return res.redirect('/admin/dashboard');
        }

        const userName = user.displayName;
        const userEmail = user.email;

        await User.findByIdAndDelete(req.params.id);

        try {
            await sendEmail({
                to: userEmail,
                subject: 'Your Amora Hub Account Has Been Deleted',
                template: 'accountDeletedAdmin',
                data: {
                    name: userName,
                    reason: 'incomplete onboarding process'
                },
            });
        } catch (emailErr) {
            console.error(`Failed to send account deletion email to ${userEmail}:`, emailErr);
            // Non-critical, the user is already deleted. Log it.
        }

        req.flash('success_msg', `User ${userName} has been deleted.`);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting user.');
        res.redirect('/admin/dashboard');
    }
};

// @desc    Broadcast a message to all users
// @route   POST /admin/broadcast
export const postBroadcast = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            req.flash('error_msg', 'Broadcast message cannot be empty.');
            return res.redirect('/admin/dashboard');
        }

        const broadcast = new Broadcast({
            admin: req.user.id,
            message: message,
        });
        await broadcast.save();

        const usersToNotify = await User.find({ role: 'user', status: 'active' });

        const notifications = usersToNotify.map(user => ({
            user: user._id,
            type: 'admin_broadcast',
            message: `A new announcement from Amora Hub: "${message.substring(0, 50)}..."`,
            link: `/broadcasts/${broadcast._id}`
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Send email to all users
        for (const user of usersToNotify) {
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'New Announcement from Amora Hub',
                    template: 'broadcast',
                    data: {
                        name: user.displayName,
                        message: message,
                    },
                });
            } catch (emailErr) {
                console.error(`Failed to send broadcast email to ${user.email}:`, emailErr);
            }
        }

        req.flash('success_msg', `Broadcast sent to ${usersToNotify.length} users.`);
        res.redirect('/admin/dashboard');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong while sending the broadcast.');
        res.redirect('/admin/dashboard');
    }
};

// @desc    Dismiss a user report
// @route   POST /admin/reports/:id/dismiss
export const dismissReport = async (req, res) => {
    try {
        await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' });
        req.flash('success_msg', 'Report dismissed.');
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error dismissing report.');
        res.redirect('/admin/dashboard');
    }
};

// @desc    Toggle a user's verification status
// @route   POST /admin/users/:id/toggle-verify
export const toggleUserVerify = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isVerified = !user.isVerified; // Allows toggling off if needed
            await user.save();

            if (user.isVerified) {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: 'You are now verified!',
                        template: 'userVerified',
                        data: {
                            name: user.displayName,
                        },
                    });
                } catch (emailErr) {
                    console.error('Failed to send verification email:', emailErr);
                    // Non-critical error, so we don't show an error to the admin
                }
            }

            req.flash('success_msg', `User ${user.isVerified ? 'verified' : 'un-verified'} successfully.`);
        }
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating user verification status.');
        res.redirect('/admin/dashboard');
    }
};